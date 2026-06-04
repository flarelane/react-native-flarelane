// Top-level forwarder so customers can import via the canonical subpath
// `@flarelane/react-native-sdk/adapters/react-native-webview` regardless of
// the build artifact layout under `lib/`.
module.exports = require('../lib/commonjs/adapters/react-native-webview');
