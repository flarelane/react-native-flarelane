import { NativeModules } from 'react-native';
import FlareLaneEventManager from './eventManager';
import type {
  EventData,
  FlareLaneType,
  LogLevel,
  NotificationHandlerCallback,
  SubscribeHandlerCallback,
  Tags,
} from './types';
import {
  convertLogLevel,
  isArray,
  isBoolean,
  isPlainObject,
  isString,
  isValidCallback,
  publicMethodErrorHandler,
} from './utils';

const { FlareLane: FlareLaneNativeModule } = NativeModules as {
  FlareLane: FlareLaneType;
};

if (!FlareLaneNativeModule)
  throw 'FlareLane - Cannot find FlareLane module. Please check pod install or gradle sync.';

const eventManager = new FlareLaneEventManager(FlareLaneNativeModule);

class FlareLane {
  // ----- PUBLIC METHOD -----

  static setLogLevel(logLevel: LogLevel) {
    if (!isString(logLevel, this.name)) return;

    try {
      console.log(`FlareLane - Set log level [${logLevel}]`);
      FlareLaneNativeModule.setLogLevel(convertLogLevel(logLevel));
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static initialize(
    projectId: string,
    requestPermissionOnLaunch: boolean = true
  ) {
    if (!isString(projectId, this.name)) return;

    try {
      console.log(`FlareLane - Initiallize with project id. [${projectId}]`);
      FlareLaneNativeModule.initialize(projectId, requestPermissionOnLaunch);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  // ----- EVENT HANDLERS -----

  static setNotificationConvertedHandler(
    callback: NotificationHandlerCallback
  ) {
    if (!isValidCallback(callback, this.name, true)) return;

    try {
      console.log(`FlareLane - Set notification converted handler.`);
      eventManager.setNotificationConvertedHandler(callback);
      FlareLaneNativeModule.setNotificationConvertedHandler();
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  // ----- SET DEVICE META DATA -----

  static setUserId(userId: string | null) {
    if (!isString(userId, this.name, true)) return;

    try {
      console.log(`FlareLane - Set user id`);
      FlareLaneNativeModule.setUserId(userId);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static setTags(tags: Tags) {
    if (!isPlainObject(tags, this.name)) return;

    try {
      console.log(`FlareLane - Set tags`);
      FlareLaneNativeModule.setTags(tags);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static deleteTags(keys: string[]) {
    if (!isArray(keys, this.name)) return;

    try {
      console.log(`FlareLane - Delete tags`);
      FlareLaneNativeModule.deleteTags(keys);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static setIsSubscribed(
    isSubscribed: boolean,
    callback?: SubscribeHandlerCallback
  ) {
    if (!isBoolean(isSubscribed, this.name)) return;
    if (callback && !isValidCallback(callback, this.name)) return;

    try {
      console.log(`FlareLane - Set is subscribed`);
      FlareLaneNativeModule.setIsSubscribed(
        isSubscribed,
        (_isSubscribed: boolean) => {
          if (callback) callback(_isSubscribed);
        }
      );
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static subscribe(
    fallbackToSettings: boolean = true,
    callback?: SubscribeHandlerCallback
  ) {
    if (fallbackToSettings && !isBoolean(fallbackToSettings, this.name)) return;
    if (callback && !isValidCallback(callback, this.name)) return;

    try {
      console.log(`FlareLane - Subscribe`);
      FlareLaneNativeModule.subscribe(
        fallbackToSettings,
        (_isSubscribed: boolean) => {
          if (callback) callback(_isSubscribed);
        }
      );
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static unsubscribe(callback?: SubscribeHandlerCallback) {
    if (callback && !isValidCallback(callback, this.name)) return;

    try {
      console.log(`FlareLane - Unsubscribe`);
      FlareLaneNativeModule.unsubscribe((_isSubscribed: boolean) => {
        if (callback) callback(_isSubscribed);
      });
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static isSubscribed(callback: (isSubscribed: boolean) => void) {
    if (!isValidCallback(callback, this.name)) return;

    try {
      console.log(`FlareLane - IsSubscribed`);
      FlareLaneNativeModule.isSubscribed(callback);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static trackEvent(type: string, data?: EventData) {
    try {
      if (!isString(type, this.name)) return;
      if (data && !isPlainObject(data, this.name)) return;

      console.log(`FlareLane - Track Event ${JSON.stringify({ type, data })}`);
      FlareLaneNativeModule.trackEvent(type, data || null);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  // ----- GET DEVICE META DATA -----

  static getDeviceId(): Promise<string | null> {
    return new Promise((resolve) => {
      FlareLaneNativeModule.getDeviceId((id) => {
        resolve(id);
      });
    });
  }

  static getTags(getTagsHandler: (tags: Tags | null) => any) {
    FlareLaneNativeModule.getTags(getTagsHandler);
  }
}

export default FlareLane;
