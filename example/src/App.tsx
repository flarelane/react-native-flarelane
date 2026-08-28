import FlareLane from '@flarelane/react-native-sdk';
import * as React from 'react';
import { Button, ScrollView, StyleSheet, Text } from 'react-native';
import { WebViewBridgeDemo } from './WebViewBridgeDemo';

// Keep in sync with example/index.tsx so the Web SDK demo runs against the
// same project as the native bindings.
const FLARELANE_PROJECT_ID = 'a43cdc82-0ea5-4fdd-aebc-1940fe99b6c3';

export default function App() {
  const [text, setText] = React.useState<string>();
  const [isSetUserId, setIsSetUserId] = React.useState<boolean>(false);
  const [isSetTags, setIsSetTags] = React.useState<boolean>(false);
  const [isSetUserAttributes, setIsSetUserAttributes] =
    React.useState<boolean>(false);
  const [showWebViewDemo, setShowWebViewDemo] = React.useState<boolean>(false);

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
    FlareLane.subscribe(true, (subscribed) => {
      console.log('subscribe ->', subscribed);
    });
  };

  const unsubscribe = () => {
    FlareLane.unsubscribe((subscribed) => {
      console.log('unsubscribe ->', subscribed);
    });
  };

  const isSubscribedFunc = () => {
    FlareLane.isSubscribed(console.log);
  };

  const displayInApp = () => {
    FlareLane.displayInApp('home', { data: 'd2' });
  };

  const toggleUserAttributes = () => {
    if (isSetUserAttributes) {
      FlareLane.setUserAttributes({
        name: null,
        email: null,
        phoneNumber: null,
        dob: null,
        timeZone: null,
        country: null,
        language: null,
      });
      setIsSetUserAttributes(false);
    } else {
      FlareLane.setUserAttributes({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+821012345678',
        dob: '1990-01-01',
        timeZone: 'Asia/Seoul',
        country: 'KR',
        language: 'ko',
      });
      setIsSetUserAttributes(true);
    }
  };

  if (showWebViewDemo) {
    return (
      <WebViewBridgeDemo
        onClose={() => setShowWebViewDemo(false)}
        projectId={FLARELANE_PROJECT_ID}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>FlareLane Test</Text>
      <Text>{text}</Text>
      <Button
        onPress={toggleUserId}
        title={`TOGGLE USER ID (${isSetUserId ? 'del' : 'set'})`}
      />
      <Button
        onPress={toggleTags}
        title={`TOGGLE TAGS (${isSetTags ? 'del' : 'set'})`}
      />
      <Button
        onPress={toggleUserAttributes}
        title={`TOGGLE USER ATTRIBUTES (${
          isSetUserAttributes ? 'del' : 'set'
        })`}
      />
      <Button onPress={subscribe} title="SUBSCRIBE" />
      <Button onPress={unsubscribe} title="UNSUBSCRIBE" />
      <Button onPress={getDeviceId} title="GET DEVICE ID" />
      <Button onPress={trackEvent} title="TRACK EVENT" />
      <Button onPress={isSubscribedFunc} title="ISSUBSCRIBED" />
      <Button onPress={displayInApp} title="DISPLAY INAPP" />
      <Text style={styles.sectionLabel}>WebView Bridge</Text>
      <Button
        onPress={() => setShowWebViewDemo(true)}
        title="react-native-webview"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 16,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 4,
    fontSize: 12,
    color: '#666',
  },
});
