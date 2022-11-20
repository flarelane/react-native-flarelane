import { NativeModules } from 'react-native';
import FlareLaneEventManager from './eventManager';
import type {
  FlareLaneType,
  LogLevel,
  NotificationHandlerCallback,
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

  static initialize(projectId: string) {
    if (!isString(projectId, this.name)) return;

    try {
      console.log(`FlareLane - Initiallize with project id. [${projectId}]`);
      FlareLaneNativeModule.initialize(projectId);
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

  static setIsSubscribed(isSubscribed: boolean) {
    if (!isBoolean(isSubscribed, this.name)) return;

    try {
      console.log(`FlareLane - Set is subscribed`);
      FlareLaneNativeModule.setIsSubscribed(isSubscribed);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  // ----- GET DEVICE META DATA -----

  static getDeviceId() {
    return new Promise((resolve) => {
      FlareLaneNativeModule.getDeviceId((id) => {
        resolve(id);
      });
    });
  }
}

export default FlareLane;
