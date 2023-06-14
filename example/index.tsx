import FlareLane from '@flarelane/react-native-sdk';
import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import OneSignal from 'react-native-onesignal';
import { name as appName } from './app.json';
import App from './src/App';

const FLARELANE_PROJECT_ID = 'a43cdc82-0ea5-4fdd-aebc-1940fe99b6c3';
const ONESIGNAL_APP_ID = 'ONESIGNAL_APP_ID';

FlareLane.setLogLevel('verbose');
FlareLane.initialize(FLARELANE_PROJECT_ID);

setupOneSignal();
setupFCM();

AppRegistry.registerComponent(appName, () => App);

async function setupFCM() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
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
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    console.log(`FCM: Token ${token}`);
  }
}

async function setupOneSignal() {
  OneSignal.setAppId(ONESIGNAL_APP_ID);
  OneSignal.promptForPushNotificationsWithUserResponse();
  OneSignal.setNotificationWillShowInForegroundHandler(
    (notificationReceivedEvent) => {
      console.log(
        'OneSignal: notification will show in foreground:',
        notificationReceivedEvent
      );
      let notification = notificationReceivedEvent.getNotification();
      console.log('notification: ', notification);
      const data = notification.additionalData;
      console.log('additionalData: ', data);
      // Complete with null means don't show a notification.
      notificationReceivedEvent.complete(notification);
    }
  );
}
