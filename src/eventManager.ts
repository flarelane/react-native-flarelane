import { AppRegistry, NativeEventEmitter, Platform } from 'react-native';
import { events } from './constants';
import type {
  FlareLaneType,
  InAppMessageActionHandler,
  NotificationHandlerCallback,
} from './types';

// Module-level callback refs so re-setting a handler updates behavior without
// re-registering the underlying Android HeadlessJsTask. RN warns when
// `AppRegistry.registerHeadlessTask` is called more than once with the same
// key (typical during Fast Refresh / repeated useEffect runs).
type AnyCallback = (...args: any[]) => any;
const headlessCallbacks: Record<string, AnyCallback | null> = {};
const headlessRegistered: Record<string, boolean> = {};

function registerHeadlessTaskOnce(eventName: string) {
  if (headlessRegistered[eventName]) return;
  headlessRegistered[eventName] = true;
  AppRegistry.registerHeadlessTask(eventName, () => async (payload) => {
    const cb = headlessCallbacks[eventName];
    // Await the callback's result so AppRegistry observes completion of
    // async handlers; sync callbacks resolve immediately. Without the await,
    // the task could finish before an async callback finishes its work.
    if (cb) await Promise.resolve(cb(payload));
  });
}

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
    this.registerNotificationHandler(events.NOTIFICATION_CLICKED, callback);
  }

  setNotificationForegroundReceivedHandler(
    callback: NotificationHandlerCallback
  ) {
    this.registerNotificationHandler(
      events.NOTIFICATION_FOREGROUND_RECEIVED,
      callback
    );
  }

  /** Hook a notification callback up to whichever bridge mechanism the platform uses:
   *   - iOS: live RCTEventEmitter while the JS context is up
   *   - Android: HeadlessJsTask so callbacks still fire when the app was killed
   *  Both deliver a fully-parsed Notification object (native pre-computes `data`, `buttons`,
   *  `clickedButton`, `clickedUrl`) so this layer has no per-field transformation logic. */
  private registerNotificationHandler(
    eventName: string,
    callback: NotificationHandlerCallback
  ) {
    if (Platform.OS === 'ios') {
      this.setEventHandler(eventName, callback);
    } else {
      headlessCallbacks[eventName] = callback;
      registerHeadlessTaskOnce(eventName);
    }
  }

  setInAppMessageActionHandler(callback: InAppMessageActionHandler) {
    const eventName = events.IN_APP_MESSAGE_ACTION;
    if (Platform.OS === 'ios') {
      this.setEventHandler(eventName, (data) => {
        callback(data.iam, data.actionId);
      });
    } else {
      headlessCallbacks[eventName] = (data: any) => {
        callback(data.iam, data.actionId);
      };
      registerHeadlessTaskOnce(eventName);
    }
  }
}

export default FlareLaneEventManager;
