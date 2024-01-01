import type { FlareLaneType, Notification } from './types';

export class NotificationReceivedEvent {
  notification: Notification;
  nativeModule: FlareLaneType;

  constructor(nativeModule: FlareLaneType, notification: Notification) {
    this.nativeModule = nativeModule;
    this.notification = notification;
  }

  display() {
    this.nativeModule.displayNotification(this.notification.id);
  }
}
