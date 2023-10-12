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
export type SubscribeHandlerCallback = (isSubscribed: boolean) => void;
export type Tags = Record<string, unknown>;
export type EventData = Record<string, string | number> | null;

export interface FlareLaneType {
  setLogLevel(level: number): void;
  initialize(projectId: string, requestPermissionOnLaunch?: boolean): void;
  setNotificationConvertedHandler: () => void;
  setUserId: (userId: string | null) => void;
  getTags: (callback: (tags: Tags | null) => void) => void;
  setTags: (tags: Tags) => void;
  deleteTags: (keys: string[]) => void;
  setIsSubscribed: (
    isSubscribed: boolean,
    callback: SubscribeHandlerCallback
  ) => void;
  subscribe: (
    fallbackToSettings: boolean,
    callback: SubscribeHandlerCallback
  ) => void;
  unsubscribe: (callback: SubscribeHandlerCallback) => void;
  isSubscribed: (callback: (isSubscribed: boolean) => void) => void;
  getDeviceId: (callback: (id: string | null) => void) => void;
  trackEvent: (type: string, data: EventData) => void;
}
