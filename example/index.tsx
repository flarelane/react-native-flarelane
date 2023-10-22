import FlareLane from '@flarelane/react-native-sdk';
import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './src/App';

const FLARELANE_PROJECT_ID = 'FLARELANE_PROJECT_ID';

FlareLane.initialize(FLARELANE_PROJECT_ID, false);

// Test with FCM: https://rnfirebase.io/
setupFCM();

AppRegistry.registerComponent(appName, () => App);

async function setupFCM() {
  messaging().onMessage(async (remoteMessage) => {
    console.log(
      'FCM: A new FCM message arrived!',
      JSON.stringify(remoteMessage)
    );
  });
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log(
      'FCM: Message handled in the background!',
      JSON.stringify(remoteMessage)
    );
  });
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log(
      'FCM: Notification caused app to open from background state:',
      JSON.stringify(remoteMessage)
    );
  });

  const token = await messaging().getToken();
  console.log(`FCM: Token ${token}`);
}
