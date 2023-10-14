import FlareLane from '@flarelane/react-native-sdk';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './src/App';

const FLARELANE_PROJECT_ID = 'FLARELANE_PROJECT_ID';
const ONESIGNAL_APP_ID = 'ONESIGNAL_APP_ID';

FlareLane.setLogLevel('verbose');
FlareLane.initialize(FLARELANE_PROJECT_ID, false);

// setupOneSignal();
// setupFCM();

AppRegistry.registerComponent(appName, () => App);

// async function setupFCM() {
//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//   if (enabled) {
//     messaging().onMessage(async (remoteMessage) => {
//       console.log(
//         'FCM: A new FCM message arrived!',
//         JSON.stringify(remoteMessage)
//       );
//     });
//     messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//       console.log(
//         'FCM: Message handled in the background!',
//         JSON.stringify(remoteMessage)
//       );
//     });
//     messaging().onNotificationOpenedApp((remoteMessage) => {
//       console.log(
//         'FCM: Notification caused app to open from background state:',
//         JSON.stringify(remoteMessage)
//       );
//     });
//     await messaging().registerDeviceForRemoteMessages();
//     const token = await messaging().getToken();
//     console.log(`FCM: Token ${token}`);
//   }
// }

// async function setupOneSignal() {
//   OneSignal.initialize(ONESIGNAL_APP_ID);
//   OneSignal.Notifications.requestPermission(true);
//   OneSignal.Notifications.addEventListener('click', (event) => {
//     console.log('OneSignal: notification clicked:', event);
//   });
// }
