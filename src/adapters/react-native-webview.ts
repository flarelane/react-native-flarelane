import { NativeModules, Platform } from 'react-native';
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
    console.log(`[FlareLane] _webViewSyncPayload failed: ${e}`);
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
        console.log('[FlareLane] WebView bridge ignored non-object message');
        return null;
      }
      body = parsed as Record<string, any>;
    } catch (e) {
      console.log('[FlareLane] WebView bridge JSON parse failed');
      return null;
    }

    const method = typeof body.method === 'string' ? body.method : null;
    if (!method) {
      console.log('[FlareLane] WebView bridge message missing "method"');
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
        if (body.tags && typeof body.tags === 'object') {
          FlareLane.setTags(body.tags as Record<string, unknown>);
        }
        return null;
      case 'trackEvent':
        if (typeof body.type !== 'string') {
          console.log('[FlareLane] trackEvent missing "type"');
          return null;
        }
        FlareLane.trackEvent(
          body.type,
          body.data && typeof body.data === 'object' ? body.data : null
        );
        return null;
      case 'setUserAttributes':
        if (body.attributes && typeof body.attributes === 'object') {
          FlareLane.setUserAttributes(
            body.attributes as Record<string, unknown>
          );
        }
        return null;
      default:
        console.log(`[FlareLane] WebView bridge unknown method: ${method}`);
        return null;
    }
  } catch (e) {
    console.log(`[FlareLane] WebView bridge handle failed: ${e}`);
    return null;
  }
}

/**
 * `react-native-webview` 전용 어댑터.
 *
 * 네이티브 Android/iOS의 `FlareLaneJavascriptInterface` + `BRIDGE_NAME` 패턴을
 * RN에서 그대로 쓸 수 있도록, react-native-webview의 prop/callback 슬롯
 * 이름과 동일한 이름의 멤버를 노출합니다. customer는 자기 `<WebView>` 위젯을
 * 평소대로 와이어링하면서 필요한 slot에 우리 멤버를 끼워 넣기만 하면 됩니다.
 *
 * 사용 예 — customer의 기존 코드와 함께:
 *
 *   const webViewRef = useRef<WebView>(null);
 *   <WebView
 *     ref={webViewRef}
 *     injectedJavaScript={
 *       myExistingInjection + FlareLaneJavascriptInterface.injectedJavaScript
 *     }
 *     injectedJavaScriptBeforeContentLoaded={
 *       myExistingInjection +
 *       FlareLaneJavascriptInterface.injectedJavaScriptBeforeContentLoaded
 *     }
 *     onMessage={async (event) => {
 *       await FlareLaneJavascriptInterface.onMessage(webViewRef)(event);
 *       myExistingOnMessage(event);
 *     }}
 *     source={{ uri }}
 *   />
 */
export class FlareLaneJavascriptInterface {
  /** Channel name constant — 네이티브 SDK의 `BRIDGE_NAME`과 같은 역할. */
  static readonly BRIDGE_NAME = 'FlareLaneNativeBridge';

  /** `<WebView injectedJavaScript={...}>`에 그대로 꽂는 JS 문자열. */
  static readonly injectedJavaScript: string = _injectionScript;

  /** `<WebView injectedJavaScriptBeforeContentLoaded={...}>`에 그대로 꽂는 JS 문자열 (위와 동일 값). */
  static readonly injectedJavaScriptBeforeContentLoaded: string = _injectionScript;

  /**
   * `<WebView onMessage={...}>`에 꽂는 핸들러 팩토리.
   * webview ref는 syncDeviceData 응답 JS를 webview로 다시 evaluate하기 위함.
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
