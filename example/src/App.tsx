import FlareLane from '@flarelane/react-native-sdk';
import messaging from '@react-native-firebase/messaging';
import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import OneSignal from 'react-native-onesignal';
import type { Notification } from 'src/types';

const FLARELANE_PROJECT_ID = 'FLARELANE_PROJECT_ID';
const ONESIGNAL_APP_ID = 'ONESIGNAL_APP_ID';

const tags = { age: 27, gender: 'men' };

export default function App() {
  const [text, setText] = React.useState<Notification>();
  const [isSetUserId, setIsSetUserId] = React.useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = React.useState<boolean>(false);
  const [isSetTags, setIsSetTags] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Initialize by setting logLevel and projectId.
    FlareLane.setLogLevel('verbose');
    FlareLane.initialize(FLARELANE_PROJECT_ID);
    // Executes a handler with notification data when notification is converted.
    FlareLane.setNotificationConvertedHandler((payload) => {
      // Do something...
      setText(payload); // Example code
    });

    setupOneSignal();
    setupFCM();
  }, []);

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
    OneSignal.setNotificationOpenedHandler((notification) => {
      console.log('OneSignal: notification opened:', notification);
    });
  }

  const toggleUserId = () => {
    FlareLane.setUserId(isSetUserId ? null : 'myuser@flarelane.com');
    setIsSetUserId(!isSetUserId);
  };

  const toggleIsSubscribed = () => {
    FlareLane.setIsSubscribed(isSubscribed);
    setIsSubscribed(!isSubscribed);
  };

  const toggleTags = () => {
    if (!isSetTags) {
      FlareLane.setTags(tags);
      setIsSetTags(true);
    } else {
      FlareLane.deleteTags(Object.keys(tags));
      setIsSetTags(false);
    }
  };

  const getDeviceId = async () => {
    console.log(await FlareLane.getDeviceId());
  };

  return (
    <View style={styles.container}>
      <Text>FlareLane Test</Text>
      <Text>Notification id: {text?.id}</Text>
      <Text>Notification title: {text?.title}</Text>
      <Text>Notification body: {text?.body}</Text>
      <Text>Notification url: {text?.url}</Text>
      <Text>Notification imageUrl: {text?.imageUrl}</Text>
      <Text>Notification data: {JSON.stringify(text?.data)}</Text>
      <Button onPress={toggleUserId} title="TOGGLE USER ID" />
      <Button onPress={toggleIsSubscribed} title="TOGGLE IS SUBSCRIBED" />
      <Button onPress={toggleTags} title="TOGGLE TAGS" />
      <Button onPress={getDeviceId} title="GET DEVICE ID" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
