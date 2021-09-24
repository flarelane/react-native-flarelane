import { AppRegistry, NativeEventEmitter, Platform } from 'react-native';
import { events } from './constants';
import type { FlareLaneType, NotificationHandlerCallback } from './types';

class FlareLaneEventManager {
  FlareLane: FlareLaneType;
  eventEmitter: NativeEventEmitter;

  constructor(FlareLane: FlareLaneType) {
    this.FlareLane = FlareLane;
    this.eventEmitter = new NativeEventEmitter(FlareLane as any);
  }

  setEventHandler(eventName: string, callback: NotificationHandlerCallback) {
    this.eventEmitter.removeAllListeners(eventName);
    this.eventEmitter.addListener(eventName, callback);
  }

  setNotificationConvertedHandler(callback: NotificationHandlerCallback) {
    if (Platform.OS === 'ios') {
      this.setEventHandler(events.NOTIFICATION_CONVERTED, callback);
      this.FlareLane.setNotificationConvertedHandlerEvent();
    } else {
      AppRegistry.registerHeadlessTask(
        events.NOTIFICATION_CONVERTED,
        () => (data) => {
          callback(data);
          return Promise.resolve();
        }
      );
    }
  }
}

export default FlareLaneEventManager;
