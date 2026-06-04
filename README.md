# react-native-flarelane

Welcome to [FlareLane](https://flarelane.com)!

## Installation

```sh
npm install @flarelane/react-native-sdk
```

## WebView Bridge (hybrid apps)

For apps that embed pages running the FlareLane Web SDK, the native SDK
exposes a bridge so identity (`deviceId` / `userId` / `projectId`) and
SDK calls (`setUserId`, `setTags`, `trackEvent`, `setUserAttributes`,
`syncDeviceData`) stay aligned between native and web.

The bridge name and class name match the native Android/iOS SDKs:
`FlareLaneJavascriptInterface` + `BRIDGE_NAME`. RN ships a library-named
adapter that exposes members 1:1 with `react-native-webview`'s prop and
callback slots — drop them into your existing `<WebView>` wiring.

### react-native-webview

```tsx
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { FlareLaneJavascriptInterface } from '@flarelane/react-native-sdk/adapters/react-native-webview';

const webViewRef = useRef<WebView>(null);

<WebView
  ref={webViewRef}
  // single-valued slot — compose adapter string with anything you already inject
  injectedJavaScript={
    myExistingInjection + FlareLaneJavascriptInterface.injectedJavaScript
  }
  injectedJavaScriptBeforeContentLoaded={
    myExistingInjection +
    FlareLaneJavascriptInterface.injectedJavaScriptBeforeContentLoaded
  }
  // single-valued slot — call adapter callback inside your own handler
  onMessage={async (event: WebViewMessageEvent) => {
    await FlareLaneJavascriptInterface.onMessage(webViewRef)(event);
    myExistingOnMessage(event);
  }}
  source={{ uri }}
/>
```

The adapter exposes:

- `FlareLaneJavascriptInterface.BRIDGE_NAME` — channel name constant.
- `FlareLaneJavascriptInterface.injectedJavaScript` — JS to inject. Includes
  the `react-native-webview` channel adapter and the bridge shim.
- `FlareLaneJavascriptInterface.injectedJavaScriptBeforeContentLoaded` —
  same value, kept as a separate member so the slot name matches 1:1.
- `FlareLaneJavascriptInterface.onMessage(webViewRef)` — factory that
  returns a handler for `<WebView onMessage={…}>`. The ref is used to
  evaluate response JS (e.g. the `syncDeviceData` callback) back into the
  webview.

If your `<WebView>` has no existing injection or `onMessage`, omit the
`myExistingInjection +` and `myExistingOnMessage(event)` lines.

### Other webview packages

This SDK only ships a first-class adapter for `react-native-webview`. If you
use a different webview library, port the adapter implementation
(`src/adapters/react-native-webview.ts`) to your library's slot names — the
JS injection and message routing logic are self-contained inside that file.

### Notes

- The injected JS is idempotent — safe to inject twice.
- Inject *before* the Web SDK loads. `injectedJavaScriptBeforeContentLoaded`
  works on iOS; Android falls back to `injectedJavaScript` (post-load).
  Either way the SDK injection is guarded so multiple injections are safe.
  For Android specifically, avoid loading the Web SDK as an inline synchronous
  `<script>` at the very top of `<head>`, which could fire before the
  fallback injection lands.
- `setUserAttributes` is available on Android, iOS, Flutter, and React
  Native SDKs with consistent semantics.

## License

MIT
