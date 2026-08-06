## 1.10.1

- Bump native dependencies to FlareLane Android SDK 1.10.1 / iOS SDK 1.10.2 (in-app message callback reliability fixes).
- Declare `react-native-webview` as an optional peer dependency.

## 1.10.0

- Add `setUserAttributes` public method.
- Add notification action button surface: `buttons`, `clickedButtonIndex`, `clickedButton`, `clickedUrl`.
- Add `FlareLaneJavascriptInterface` adapter for `react-native-webview` hybrid apps (see README).
- Fix Android `registerHeadlessTask` duplicate-registration warning on Fast Refresh.
- Fix subpath import resolution when installed from a GitHub branch (no `lib/` build present).
- Bump native dependencies to FlareLane Android/iOS SDK 1.10.0.
