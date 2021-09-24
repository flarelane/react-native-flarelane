import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import FlareLane from 'react-native-flarelane';
import type { Notification } from 'src/types';

export default function App() {
  const [text, setText] = React.useState<Notification>();
  const [isSetUserId, setIsSetUserId] = React.useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = React.useState<boolean>(false);
  const [tags, setTags] = React.useState<Record<string, unknown>>();
  const [isSetTags, setIsSetTags] = React.useState<boolean>(false);

  React.useEffect(() => {
    FlareLane.setLogLevel('verbose');
    FlareLane.initialize('df156155-6ec8-4f87-8b74-f27b75a0699b');
    // Event
    FlareLane.setNotificationConvertedHandler((payload) => {
      console.log('callback called!', payload);
      setText(payload);
    });
    // Device data
    setTags({ age: 88 });
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
    if (!tags) return;

    if (!isSetTags) {
      FlareLane.setTags(tags);
      setIsSetTags(true);
    } else {
      let keys = Object.keys(tags);
      FlareLane.deleteTags(keys);
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
