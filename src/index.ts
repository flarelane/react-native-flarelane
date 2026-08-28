import { NativeModules } from 'react-native';
import FlareLaneEventManager from './eventManager';
import Logger from './logger';
import { NotificationReceivedEvent } from './notificationReceivedEvent';
import type {
  EventData,
  FlareLaneType,
  InAppMessageActionHandler,
  IsSubscribedHandlerCallback,
  LogLevel,
  NotificationForegroundReceivedHandler,
  NotificationHandlerCallback,
  Tags,
  UserAttributes,
} from './types';
import {
  convertLogLevel,
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
      // Apply on the JS side first: the bridge hop is async, so anything logged in between
      // would otherwise still use the previous level.
      Logger.setLevel(logLevel);
      Logger.verbose(`Set log level [${logLevel}]`);
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
      Logger.verbose(`Initiallize with project id. [${projectId}]`);
      FlareLaneNativeModule.initialize(projectId, requestPermissionOnLaunch);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  // ----- EVENT HANDLERS -----

  static setNotificationClickedHandler(callback: NotificationHandlerCallback) {
    if (!isValidCallback(callback, this.name, true)) return;

    try {
      eventManager.setNotificationClickedHandler(callback);
      FlareLaneNativeModule.setNotificationClickedHandler();
      Logger.verbose(`NotificationClickedHandler has been registered.`);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static setNotificationForegroundReceivedHandler(
    callback: NotificationForegroundReceivedHandler
  ) {
    if (!isValidCallback(callback, this.name, true)) return;

    try {
      eventManager.setNotificationForegroundReceivedHandler((notification) => {
        const event = new NotificationReceivedEvent(
          FlareLaneNativeModule,
          notification
        );
        callback(event);
      });
      FlareLaneNativeModule.setNotificationForegroundReceivedHandler();
      Logger.verbose(
        `NotificationForegroundReceivedHandler has been registered.`
      );
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  // ----- SET DEVICE META DATA -----

  static setUserId(userId: string | null) {
    if (!isString(userId, this.name, true)) return;

    try {
      Logger.verbose(`Set user id: ${userId}`);
      FlareLaneNativeModule.setUserId(userId);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static setTags(tags: Tags) {
    if (!isPlainObject(tags, this.name)) return;

    try {
      Logger.verbose(`Set tags: ${JSON.stringify(tags)}`);
      FlareLaneNativeModule.setTags(tags);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  /**
   * Set user attributes (name/email/phoneNumber/dob/timeZone/country/language, etc.).
   * Sent only when userId is set, matching Web SDK behavior.
   */
  static setUserAttributes(attributes: UserAttributes) {
    if (!isPlainObject(attributes, this.name)) return;

    try {
      Logger.verbose(`Set user attributes: ${JSON.stringify(attributes)}`);
      FlareLaneNativeModule.setUserAttributes(attributes);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static subscribe(
    fallbackToSettings: boolean,
    callback?: IsSubscribedHandlerCallback
  ) {
    if (fallbackToSettings && !isBoolean(fallbackToSettings, this.name)) return;
    if (callback && !isValidCallback(callback, this.name)) return;

    try {
      Logger.verbose(`Subscribe`);
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

  static unsubscribe(callback?: IsSubscribedHandlerCallback) {
    if (callback && !isValidCallback(callback, this.name)) return;

    try {
      Logger.verbose(`Unsubscribe`);
      FlareLaneNativeModule.unsubscribe((_isSubscribed: boolean) => {
        if (callback) callback(_isSubscribed);
      });
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static isSubscribed(callback: IsSubscribedHandlerCallback) {
    if (!isValidCallback(callback, this.name)) return;

    try {
      Logger.verbose(`IsSubscribed`);
      FlareLaneNativeModule.isSubscribed(callback);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static trackEvent(type: string, data?: EventData) {
    try {
      if (!isString(type, this.name)) return;
      if (data && !isPlainObject(data, this.name)) return;

      Logger.verbose(`Track Event ${JSON.stringify({ type, data })}`);
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

  // ----- IN-APP MESSAGES -----

  static displayInApp(group: string, data?: Record<string, unknown> | null) {
    if (!isString(group, this.name, true)) return;

    try {
      Logger.verbose(
        `displayInApp ${JSON.stringify({ group, data: data ?? null })}`
      );
      FlareLaneNativeModule.displayInApp(group, data ?? null);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }

  static setInAppMessageActionHandler(callback: InAppMessageActionHandler) {
    if (!isValidCallback(callback, this.name, true)) return;

    try {
      eventManager.setInAppMessageActionHandler(callback);
      FlareLaneNativeModule.setInAppMessageActionHandler();
      Logger.verbose(`setInAppMessageActionHandler has been registered.`);
    } catch (error: any) {
      publicMethodErrorHandler(error, this.name);
    }
  }
}

export default FlareLane;
