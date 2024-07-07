import FlareLane from '@flarelane/react-native-sdk';
import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [text, setText] = React.useState<string>();
  const [isSetUserId, setIsSetUserId] = React.useState<boolean>(false);
  const [isSetTags, setIsSetTags] = React.useState<boolean>(false);

  React.useEffect(() => {
    FlareLane.setNotificationClickedHandler((noti) => {
      const text = `Notification Clicked: ${JSON.stringify(noti)}`;
      setText(text); // Example code
    });

    FlareLane.setNotificationForegroundReceivedHandler((event) => {
      const text = `Notification Foreground Received: ${JSON.stringify(
        event.notification
      )}`;
      setText(text);
      setTimeout(() => {
        if (event.notification.data?.dismiss_foreground_notification === 'true')
          return;

        console.log('Execute event.display() delayed');
        event.display();
      }, 3000);
    });

    FlareLane.setInAppMessageActionHandler((iam, actionId) => {
      const text = `Handling InAppMessage Action: ${JSON.stringify({
        iam,
        actionId,
      })}`;
      setText(text);
      console.log(text);
    });
  }, []);

  const toggleUserId = () => {
    FlareLane.setUserId(isSetUserId ? null : 'TEST_USER_ID');
    setIsSetUserId(!isSetUserId);
  };

  const toggleTags = () => {
    if (!isSetTags) {
      FlareLane.setTags({ age: 27, gender: 'men' });
      setIsSetTags(true);
    } else {
      FlareLane.setTags({ age: null, gender: null });
      setIsSetTags(false);
    }
  };

  const getDeviceId = async () => {
    console.log(await FlareLane.getDeviceId());
  };

  const trackEvent = () => {
    FlareLane.trackEvent('test_event', { react: 'native' });
  };

  const subscribe = () => {
    FlareLane.subscribe(true, console.log);
  };

  const unsubscribe = () => {
    FlareLane.unsubscribe(console.log);
  };

  const isSubscribedFunc = () => {
    FlareLane.isSubscribed(console.log);
  };

  const displayInApp = () => {
    FlareLane.displayInApp('home');
  };

  return (
    <View style={styles.container}>
      <Text>FlareLane Test</Text>
      <Text>{text}</Text>
      <Button onPress={toggleUserId} title="TOGGLE USER ID" />
      <Button onPress={toggleTags} title="TOGGLE TAGS" />
      <Button onPress={getDeviceId} title="GET DEVICE ID" />
      <Button onPress={trackEvent} title="TRACK EVENT" />
      <Button onPress={subscribe} title="SUBSCRIBE" />
      <Button onPress={unsubscribe} title="UNSUBSCRIBE" />
      <Button onPress={isSubscribedFunc} title="ISSUBSCRIBED" />
      <Button onPress={displayInApp} title="DISPLAY INAPP" />
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
