import { NativeModules, Platform } from 'react-native';
import Logger from '../logger';
import FlareLane from '../index';
import type { FlareLaneType, WebViewSyncPayload } from '../types';

const { FlareLane: FlareLaneNativeModule } = NativeModules as {
  FlareLane: FlareLaneType;
};

// react-native-webview only exposes a single postMessage funnel
// (`window.ReactNativeWebView.postMessage`). The bridge shim below targets a
// generic channel named `window.FlareLaneNativeBridge`, so a small adapter is
// prepended to forward that funnel to react-native-webview's actual entry.
//
// `window.FlareLaneBridge` mirrors the native Android JavascriptInterface
// surface — the Web SDK detects it and forwards calls. We intentionally do
// NOT install `window.webkit.messageHandlers.FlareLaneBridge` (the iOS hook).
// The Web SDK calls both paths unconditionally; installing both would deliver
// every action twice.
//
// `displayInApp` is intentionally omitted to match the native Android/iOS
// SDK bridges: the Web SDK renders in-app messages inside the webview itself
// using device data synced via `syncDeviceData`.
const _injectionScript = `
(function () {
  if (window.__flareLaneBridgeInstalled) return;
  window.__flareLaneBridgeInstalled = true;

  window.FlareLaneNativeBridge = {
    postMessage: function (s) { window.ReactNativeWebView.postMessage(s); }
  };

  function post(payload) {
    try {
      var ch = window.FlareLaneNativeBridge;
      if (ch && typeof ch.postMessage === 'function') {
        ch.postMessage(JSON.stringify(payload));
      }
    } catch (e) {}
  }

  window.FlareLaneBridge = {
    syncDeviceData: function () { post({ method: 'syncDeviceData' }); },
    setUserId: function (userId) { post({ method: 'setUserId', userId: userId }); },
    setTags: function (jsonString) {
      var tags = {}; try { tags = JSON.parse(jsonString); } catch (e) {}
      post({ method: 'setTags', tags: tags });
    },
    trackEvent: function (type, jsonString) {
      var data = null; if (jsonString) { try { data = JSON.parse(jsonString); } catch (e) {} }
      post({ method: 'trackEvent', type: type, data: data });
    },
    setUserAttributes: function (jsonString) {
      var attributes = {}; try { attributes = JSON.parse(jsonString); } catch (e) {}
      post({ method: 'setUserAttributes', attributes: attributes });
    }
  };
})();
`;

async function _buildSyncDeviceDataCallback(): Promise<string | null> {
  try {
    const payload = await new Promise<WebViewSyncPayload>((resolve) => {
      FlareLaneNativeModule._webViewSyncPayload((p) => resolve(p));
    });
    const out: Record<string, unknown> = {
      projectId: payload?.projectId ?? null,
      deviceId: payload?.deviceId ?? null,
      userId: payload?.userId ?? null,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    };
    return `FlareLane.syncDeviceDataCallback(${JSON.stringify(out)});`;
  } catch (e) {
    Logger.error(`_webViewSyncPayload failed: ${e}`);
    return null;
  }
}

// Routes one JSON message from the webview channel to the FlareLane SDK.
// Returns response JS string to evaluate back into the webview (only for
// `syncDeviceData`), or `null` otherwise. Never throws.
async function _handle(message: string): Promise<string | null> {
  try {
    let body: Record<string, any>;
    try {
      const parsed = JSON.parse(message);
      if (
        parsed === null ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed)
      ) {
        Logger.verbose('WebView bridge ignored non-object message');
        return null;
      }
      body = parsed as Record<string, any>;
    } catch (e) {
      Logger.verbose('WebView bridge JSON parse failed');
      return null;
    }

    const method = typeof body.method === 'string' ? body.method : null;
    if (!method) {
      Logger.verbose('WebView bridge message missing "method"');
      return null;
    }

    switch (method) {
      case 'syncDeviceData':
        return await _buildSyncDeviceDataCallback();
      case 'setUserId':
        FlareLane.setUserId(
          typeof body.userId === 'string' ? body.userId : null
        );
        return null;
      case 'setTags':
        // typeof null === 'object' and typeof [] === 'object' in JS — guard
        // both so only plain object payloads reach the SDK call.
        if (
          body.tags &&
          typeof body.tags === 'object' &&
          !Array.isArray(body.tags)
        ) {
          FlareLane.setTags(body.tags as Record<string, unknown>);
        }
        return null;
      case 'trackEvent':
        if (typeof body.type !== 'string') {
          Logger.verbose('trackEvent missing "type"');
          return null;
        }
        FlareLane.trackEvent(
          body.type,
          body.data &&
            typeof body.data === 'object' &&
            !Array.isArray(body.data)
            ? body.data
            : null
        );
        return null;
      case 'setUserAttributes':
        if (
          body.attributes &&
          typeof body.attributes === 'object' &&
          !Array.isArray(body.attributes)
        ) {
          FlareLane.setUserAttributes(
            body.attributes as Record<string, unknown>
          );
        }
        return null;
      default:
        Logger.verbose(`WebView bridge unknown method: ${method}`);
        return null;
    }
  } catch (e) {
    Logger.error(`WebView bridge handle failed: ${e}`);
    return null;
  }
}

/**
 * `react-native-webview`-specific adapter.
 *
 * Mirrors the native Android/iOS `FlareLaneJavascriptInterface` + `BRIDGE_NAME`
 * pattern in RN. Customers compose `injectedJavaScript` with their existing
 * injection (if any) and reuse the same string across both injection slots.
 *
 * Example — alongside the customer's existing wiring:
 *
 *   const webViewRef = useRef<WebView>(null);
 *   const injection =
 *     myExistingInjection + FlareLaneJavascriptInterface.injectedJavaScript;
 *   <WebView
 *     ref={webViewRef}
 *     source={{ uri }}
 *     injectedJavaScript={injection}
 *     injectedJavaScriptBeforeContentLoaded={injection}
 *     onMessage={FlareLaneJavascriptInterface.onMessage(webViewRef)}
 *   />
 *
 * If the customer already has an `onMessage` handler, wrap the adapter inside:
 *
 *   onMessage={async (event) => {
 *     await FlareLaneJavascriptInterface.onMessage(webViewRef)(event);
 *     myExistingOnMessage(event);
 *   }}
 */
export class FlareLaneJavascriptInterface {
  /** Channel name constant — mirrors the native SDK's `BRIDGE_NAME`. */
  static readonly BRIDGE_NAME = 'FlareLaneNativeBridge';

  /**
   * JS string to inject into the WebView. Same value works for both
   * `injectedJavaScript` and `injectedJavaScriptBeforeContentLoaded` slots —
   * compose with the customer's existing injection (if any) and assign the
   * resulting string to whichever slots they use.
   */
  static readonly injectedJavaScript: string = _injectionScript;

  /**
   * Handler factory for `<WebView onMessage={...}>`. The webview ref is used to
   * evaluate the syncDeviceData response JS back into the webview.
   */
  static onMessage(webViewRef: {
    current: { injectJavaScript: (js: string) => void } | null;
  }): (event: { nativeEvent: { data: string } }) => Promise<void> {
    return async (event) => {
      const js = await _handle(event.nativeEvent.data);
      if (js) webViewRef.current?.injectJavaScript(js);
    };
  }
}
