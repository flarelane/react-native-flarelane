export type LogLevel = 'none' | 'error' | 'verbose';

export interface Notification {
  id: string;
  title?: string;
  body: string;
  url?: string;
}

export type NotificationHandlerCallback = (payload: Notification) => void;

export type Tags = Record<string, unknown>;

export interface FlareLaneType {
  setLogLevel(level: number): void;
  initialize(projectId: string): void;
  setNotificationConvertedHandlerEvent: () => void;
  setUserId: (userId: string | null) => void;
  setTags: (tags: Tags) => void;
  deleteTags: (keys: string[]) => void;
  setIsSubscribed: (isSubscribed: boolean) => void;
}
