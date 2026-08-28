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
