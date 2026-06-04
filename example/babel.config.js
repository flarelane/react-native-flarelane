const path = require('path');
const pak = require('../package.json');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          // Subpath imports (e.g. `@flarelane/react-native-sdk/adapters/foo`)
          // resolve under src/ during dev so the example app sees changes
          // without a rebuild. Listed first so the more specific regex wins
          // over the bare-package match.
          [`^${pak.name}/(.+)$`]: path.join(__dirname, '..', 'src', '\\1'),
          // Bare package import resolves to src/index. Anchored with `$` to
          // prevent prefix-append (otherwise `pkg/adapters/foo` would resolve
          // to `src/index/adapters/foo` via string-alias prefix matching).
          [`^${pak.name}$`]: path.join(__dirname, '..', pak.source),
        },
      },
    ],
  ],
};
