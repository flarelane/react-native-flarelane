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
import { WebView } from 'react-native-webview';
import { FlareLaneJavascriptInterface } from '@flarelane/react-native-sdk/adapters/react-native-webview';

const webViewRef = useRef<WebView>(null);

// `injectedJavaScript` and `injectedJavaScriptBeforeContentLoaded` carry the
// same string, so one variable can be reused across both slots. If you don't
// have existing injection, drop the `myExistingInjection +` part.
const injection =
  myExistingInjection + FlareLaneJavascriptInterface.injectedJavaScript;

<WebView
  ref={webViewRef}
  source={{ uri }}
  injectedJavaScript={injection}
  injectedJavaScriptBeforeContentLoaded={injection}
  onMessage={FlareLaneJavascriptInterface.onMessage(webViewRef)}
/>
```

If you already have an `onMessage` handler, wrap the adapter inside it:

```tsx
onMessage={async (event) => {
  await FlareLaneJavascriptInterface.onMessage(webViewRef)(event);
  myExistingOnMessage(event);
}}
```

The adapter exposes:

- `FlareLaneJavascriptInterface.BRIDGE_NAME` — channel name constant.
- `FlareLaneJavascriptInterface.injectedJavaScript` — JS to inject. Includes
  the `react-native-webview` channel adapter and the bridge shim. The same
  string is valid for both `injectedJavaScript` and
  `injectedJavaScriptBeforeContentLoaded` slots.
- `FlareLaneJavascriptInterface.onMessage(webViewRef)` — factory that
  returns a handler for `<WebView onMessage={…}>`. The ref is used to
  evaluate response JS (e.g. the `syncDeviceData` callback) back into the
  webview.

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
