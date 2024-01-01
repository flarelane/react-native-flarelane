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

  setEventHandler(eventName: string, callback: (...args: any[]) => any) {
    this.eventEmitter.removeAllListeners(eventName);
    this.eventEmitter.addListener(eventName, callback);
  }

  setNotificationClickedHandler(callback: NotificationHandlerCallback) {
    if (Platform.OS === 'ios') {
      this.setEventHandler(events.NOTIFICATION_CLICKED, callback);
    } else {
      AppRegistry.registerHeadlessTask(
        events.NOTIFICATION_CLICKED,
        () => (noti) => {
          try {
            if (typeof noti.data === 'string') {
              noti.data = JSON.parse(noti.data);
            }
          } catch (e) {
            console.error(e);
            noti.data = undefined;
          }

          callback(noti);
          return Promise.resolve();
        }
      );
    }
  }

  setNotificationForegroundReceivedHandler(
    callback: NotificationHandlerCallback
  ) {
    if (Platform.OS === 'ios') {
      this.setEventHandler(events.NOTIFICATION_FOREGROUND_RECEIVED, callback);
    } else {
      AppRegistry.registerHeadlessTask(
        events.NOTIFICATION_FOREGROUND_RECEIVED,
        () => (noti) => {
          try {
            if (typeof noti.data === 'string') {
              noti.data = JSON.parse(noti.data);
            }
          } catch (e) {
            console.error(e);
            noti.data = undefined;
          }

          callback(noti);
          return Promise.resolve();
        }
      );
    }
  }
}

export default FlareLaneEventManager;
