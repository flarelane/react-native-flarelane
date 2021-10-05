import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import FlareLane from 'react-native-flarelane';
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

  return (
    <View style={styles.container}>
      <Text>FlareLane Test</Text>
      <Text>Notification title: {text?.title}</Text>
      <Text>Notification body: {text?.body}</Text>
      <Text>Notification url: {text?.url}</Text>
      <Button onPress={toggleUserId} title="TOGGLE USER ID" />
      <Button onPress={toggleIsSubscribed} title="TOGGLE IS SUBSCRIBED" />
      <Button onPress={toggleTags} title="TOGGLE TAGS" />
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
