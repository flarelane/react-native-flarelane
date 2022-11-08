import FlareLane from '@flarelane/react-native-sdk';
import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { Notification } from 'src/types';

const tags = { age: 27, gender: 'men' };

export default function App() {
  const [text, setText] = React.useState<Notification>();
  const [isSetUserId, setIsSetUserId] = React.useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = React.useState<boolean>(false);
  const [isSetTags, setIsSetTags] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Initialize by setting logLevel and projectId.
    FlareLane.setLogLevel('verbose');
    FlareLane.initialize('INPUT_YOUR_PROJECT_ID');

    // Executes a handler with notification data when notification is converted.
    FlareLane.setNotificationConvertedHandler((payload) => {
      // Do something...
      setText(payload); // Example code
    });
  }, []);

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
