// Top-level forwarder so customers can import via the canonical subpath
// `@flarelane/react-native-sdk/adapters/react-native-webview`. Points at the
// `src/` source rather than a `lib/` build artifact so installs without a
// completed `prepare` step (GitHub URL / yalc / blocked postinstall scripts)
// still resolve. Metro handles the TS source via the consumer's RN babel
// preset; the main entry uses the same pattern via the `react-native` field
// in package.json.
module.exports = require('../src/adapters/react-native-webview');
