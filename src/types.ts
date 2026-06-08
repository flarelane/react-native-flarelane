import type { InAppMessage } from './inAppMessage';
import type { NotificationReceivedEvent } from './notificationReceivedEvent';

export type LogLevel = 'none' | 'error' | 'verbose';

export interface NotificationButton {
  label: string;
  link?: string;
}

/** Read-only shape of a notification surfaced to JS. Every field is populated from the
 *  native bridge — JS never derives values (e.g. `clickedButton` from `clickedButtonIndex`).
 *  Native (Android/iOS) is the single source of truth for click semantics; this layer just
 *  reflects what it was handed, so the four SDKs can't drift. */
export interface Notification {
  id: string;
  title?: string;
  body: string;
  url?: string;
  imageUrl?: string;
  data?: Record<string, any>;
  buttons?: NotificationButton[];
  /** Index of the tapped action button, or `null`/`undefined` for a body click. Doubles as
   *  the "was it a button click?" check via `notification.clickedButtonIndex != null`. */
  clickedButtonIndex?: number | null;
  /** The action button the user tapped, or `null`/`undefined` for a body click / out-of-range. */
  clickedButton?: NotificationButton | null;
  /** URL associated with the click:
   *   - Button click → the tapped button's `link`, or `null` when it has no link.
   *   - Body click   → the notification body's `url`, or `null` when none is set.
   *  A button click with no link returns `null`, **not** the body's url. */
  clickedUrl?: string | null;
}

export type NotificationHandlerCallback = (payload: Notification) => void;
export type NotificationForegroundReceivedHandler = (
  payload: NotificationReceivedEvent
) => void;
export type InAppMessageActionHandler = (
  iam: InAppMessage,
  actionId: string
) => void;
export type IsSubscribedHandlerCallback = (isSubscribed: boolean) => void;
export type Tags = Record<string, unknown>;
export type EventData = Record<string, string | number> | null;
export type UserAttributes = Record<string, unknown>;

export interface WebViewSyncPayload {
  projectId: string | null;
  deviceId: string | null;
  userId: string | null;
}

export interface FlareLaneType {
  setLogLevel(level: number): void;
  initialize(projectId: string, requestPermissionOnLaunch?: boolean): void;
  setNotificationClickedHandler: () => void;
  setNotificationForegroundReceivedHandler: () => void;
  setInAppMessageActionHandler: () => void;
  displayNotification: (notificationId: string) => void;
  displayInApp: (group: string, data?: Record<string, unknown> | null) => void;
  setUserId: (userId: string | null) => void;
  setTags: (tags: Tags) => void;
  setUserAttributes: (attributes: UserAttributes) => void;
  subscribe: (
    fallbackToSettings: boolean,
    callback: IsSubscribedHandlerCallback
  ) => void;
  unsubscribe: (callback: IsSubscribedHandlerCallback) => void;
  isSubscribed: (callback: (isSubscribed: boolean) => void) => void;
  getDeviceId: (callback: (id: string | null) => void) => void;
  trackEvent: (type: string, data: EventData) => void;
  /** Helper-only entry for the WebView bridge adapter — not part of the public API. */
  _webViewSyncPayload: (
    callback: (payload: WebViewSyncPayload) => void
  ) => void;
}
