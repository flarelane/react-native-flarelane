import FlareLane from '@flarelane/react-native-sdk';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './src/App';

const FLARELANE_PROJECT_ID = 'a43cdc82-0ea5-4fdd-aebc-1940fe99b6c3';

FlareLane.initialize(FLARELANE_PROJECT_ID, false);

AppRegistry.registerComponent(appName, () => App);
