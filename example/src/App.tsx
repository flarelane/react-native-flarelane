import FlareLane from '@flarelane/react-native-sdk';
import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { Notification } from 'src/types';

const tags = { age: 27, gender: 'men' };

export default function App() {
  const [text, setText] = React.useState<Notification>();
  const [isSetUserId, setIsSetUserId] = React.useState<boolean>(false);
  const [isSetTags, setIsSetTags] = React.useState<boolean>(false);

  React.useEffect(() => {
    FlareLane.setNotificationClickedHandler((payload) => {
      // Do something...
      setText(payload); // Example code
    });

    FlareLane.setNotificationForegroundReceivedHandler((event) => {
      setText(event.notification);

      setTimeout(() => {
        if (event.notification.data?.dismiss_foreground_notification === 'true')
          return;

        console.log('Execute event.display() delayed');
        event.display();
      }, 3000);
    });
  }, []);

  const toggleUserId = () => {
    FlareLane.setUserId(isSetUserId ? null : 'TEST_USER_ID');
    setIsSetUserId(!isSetUserId);
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

  const getTags = async () => {
    FlareLane.getTags(console.log);
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
      <Button onPress={toggleTags} title="TOGGLE TAGS" />
      <Button onPress={getTags} title="GET TAGS" />
      <Button onPress={getDeviceId} title="GET DEVICE ID" />
      <Button onPress={trackEvent} title="TRACK EVENT" />
      <Button onPress={subscribe} title="SUBSCRIBE" />
      <Button onPress={unsubscribe} title="UNSUBSCRIBE" />
      <Button onPress={isSubscribedFunc} title="ISSUBSCRIBED" />
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
