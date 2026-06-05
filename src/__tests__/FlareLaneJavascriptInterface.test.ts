// Spec for the `react-native-webview` adapter
// (`@flarelane/react-native-sdk/adapters/react-native-webview`).
//
// Pins the injected JS shape and the `onMessage(ref)` routing contract so
// future schema changes can't silently drop fields the Web SDK depends on.
//
// The mock for react-native lives inside the jest.mock factory itself rather
// than referencing module-scoped variables — jest hoists the mock above all
// imports, so any external references would be undefined at evaluation time.

jest.mock('react-native', () => {
  const FlareLane = {
    setLogLevel: jest.fn(),
    initialize: jest.fn(),
    setUserId: jest.fn(),
    setTags: jest.fn(),
    setUserAttributes: jest.fn(),
    trackEvent: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    isSubscribed: jest.fn(),
    getDeviceId: jest.fn((cb: (id: string | null) => void) => cb(null)),
    displayInApp: jest.fn(),
    displayNotification: jest.fn(),
    setNotificationClickedHandler: jest.fn(),
    setNotificationForegroundReceivedHandler: jest.fn(),
    setInAppMessageActionHandler: jest.fn(),
    _webViewSyncPayload: jest.fn(
      (
        cb: (p: {
          projectId: string | null;
          deviceId: string | null;
          userId: string | null;
        }) => void
      ) => cb({ projectId: 'P', deviceId: 'D', userId: 'U' })
    ),
  };
  return {
    NativeModules: { FlareLane },
    Platform: { OS: 'ios' },
    NativeEventEmitter: jest.fn().mockImplementation(() => ({
      addListener: jest.fn(),
      removeAllListeners: jest.fn(),
    })),
  };
});

import { NativeModules } from 'react-native';
import { FlareLaneJavascriptInterface } from '../adapters/react-native-webview';

const mockFlareLane = (NativeModules as any).FlareLane;

describe('FlareLaneJavascriptInterface (react-native-webview adapter)', () => {
  beforeEach(() => {
    Object.values(mockFlareLane).forEach((fn: any) => {
      if (typeof fn?.mockClear === 'function') fn.mockClear();
    });
  });

  it('BRIDGE_NAME matches the standard channel name', () => {
    expect(FlareLaneJavascriptInterface.BRIDGE_NAME).toBe(
      'FlareLaneNativeBridge'
    );
  });

  it('injectedJavaScript installs the standard FlareLaneBridge shim', () => {
    expect(FlareLaneJavascriptInterface.injectedJavaScript).toContain(
      'window.FlareLaneBridge'
    );
    // Must also include the react-native-webview channel adapter so messages
    // routed through `window.FlareLaneNativeBridge.postMessage` reach the
    // native `onMessage` prop via `window.ReactNativeWebView.postMessage`.
    expect(FlareLaneJavascriptInterface.injectedJavaScript).toContain(
      'window.ReactNativeWebView.postMessage'
    );
  });

  it('onMessage(ref) routes syncDeviceData payload through native handle and injects the response back', async () => {
    const injectJavaScript = jest.fn();
    const webViewRef = { current: { injectJavaScript } };
    const handler = FlareLaneJavascriptInterface.onMessage(webViewRef);

    await handler({
      nativeEvent: { data: JSON.stringify({ method: 'syncDeviceData' }) },
    });

    expect(mockFlareLane._webViewSyncPayload).toHaveBeenCalledTimes(1);
    expect(injectJavaScript).toHaveBeenCalledTimes(1);
    const js = injectJavaScript.mock.calls[0][0] as string;
    expect(js.startsWith('FlareLane.syncDeviceDataCallback(')).toBe(true);
  });

  it('onMessage(ref) forwards setUserId to the SDK and does not call injectJavaScript', async () => {
    const injectJavaScript = jest.fn();
    const webViewRef = { current: { injectJavaScript } };
    const handler = FlareLaneJavascriptInterface.onMessage(webViewRef);

    await handler({
      nativeEvent: {
        data: JSON.stringify({ method: 'setUserId', userId: 'user-1' }),
      },
    });

    expect(mockFlareLane.setUserId).toHaveBeenCalledWith('user-1');
    expect(injectJavaScript).not.toHaveBeenCalled();
  });

  it('onMessage(ref) is safe when the ref is null (no native ref yet)', async () => {
    const handler = FlareLaneJavascriptInterface.onMessage({ current: null });
    await expect(
      handler({
        nativeEvent: { data: JSON.stringify({ method: 'syncDeviceData' }) },
      })
    ).resolves.toBeUndefined();
  });
});
