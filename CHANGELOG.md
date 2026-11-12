## 1.12.0

- Add an optional `region` argument to `initialize` for projects created in the Seoul region: `FlareLane.initialize(projectId, true, 'kr')`. Omitting it keeps the default `"us"` region.
- Bump native FlareLane Android/iOS SDKs to 1.12.0, which route all requests to the project's region and reject a malformed region at initialization. Apps with a Notification Service Extension must pin `FlareLane` 1.12.0 in that target's Podfile entry too.
- The hybrid WebView bridge passes the native region to the Web SDK.
- The Android native module now reports SDK version 1.12.0 (1.11.3 still reported 1.11.2).

## 1.11.3

- Bump native FlareLane Android/iOS SDKs to 1.11.3: a notification tap now resumes the app's existing task as-is instead of relaunching the main activity (Android), and idempotent POST retries carry an `Idempotency-Key` header.
- Minimum supported iOS version raised to 15.0 (required by Xcode 27).

## 1.11.2

- Bump native FlareLane Android/iOS SDKs to 1.11.2: transient network failures retry automatically with jittered backoff, `trackEvent` payloads carry a client-generated `insertId` so the backend can deduplicate resends, a 410 from a device endpoint stops the SDK for the rest of the process, and the pending task queue is bounded at 100 tasks.
- Add notification grouping (threadId) and chat-style communication notifications; `threadId` and `communication` are exposed on the notification payload type.
- Route JS-side logs through a level-gated Logger, so the `'none'` log level silences the JS layer too (it previously ignored the log level).

## 1.10.3

- Bump native iOS dependency to FlareLane iOS SDK 1.10.3 (fixes action buttons not displaying in some environments such as iOS 16).
- Align plugin version with the latest native SDK version (1.10.3).

## 1.10.2

- Bump native dependencies to FlareLane Android SDK 1.10.1 / iOS SDK 1.10.2 (in-app message callback reliability fixes).
- Align plugin version with the latest native SDK version (1.10.2); 1.10.1 was skipped.
- Declare `react-native-webview` as an optional peer dependency.

## 1.10.0

- Add `setUserAttributes` public method.
- Add notification action button surface: `buttons`, `clickedButtonIndex`, `clickedButton`, `clickedUrl`.
- Add `FlareLaneJavascriptInterface` adapter for `react-native-webview` hybrid apps (see README).
- Fix Android `registerHeadlessTask` duplicate-registration warning on Fast Refresh.
- Fix subpath import resolution when installed from a GitHub branch (no `lib/` build present).
- Bump native dependencies to FlareLane Android/iOS SDK 1.10.0.
