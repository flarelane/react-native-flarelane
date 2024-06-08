import type { NotificationReceivedEvent } from './notificationReceivedEvent';

export type LogLevel = 'none' | 'error' | 'verbose';

export interface Notification {
  id: string;
  title?: string;
  body: string;
  url?: string;
  imageUrl?: string;
  data?: Record<string, any>;
}

export type NotificationHandlerCallback = (payload: Notification) => void;
export type NotificationForegroundReceivedHandler = (
  payload: NotificationReceivedEvent
) => void;
export type IsSubscribedHandlerCallback = (isSubscribed: boolean) => void;
export type Tags = Record<string, unknown>;
export type EventData = Record<string, string | number> | null;

export interface FlareLaneType {
  setLogLevel(level: number): void;
  initialize(projectId: string, requestPermissionOnLaunch?: boolean): void;
  setNotificationClickedHandler: () => void;
  setNotificationForegroundReceivedHandler: () => void;
  displayNotification: (notificationId: string) => void;
  setUserId: (userId: string | null) => void;
  setTags: (tags: Tags) => void;
  subscribe: (
    fallbackToSettings: boolean,
    callback: IsSubscribedHandlerCallback
  ) => void;
  unsubscribe: (callback: IsSubscribedHandlerCallback) => void;
  isSubscribed: (callback: (isSubscribed: boolean) => void) => void;
  getDeviceId: (callback: (id: string | null) => void) => void;
  trackEvent: (type: string, data: EventData) => void;
}
