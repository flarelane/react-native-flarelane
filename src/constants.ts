// SDK-wide log level values, identical on every platform. The native plugins map this to
// whatever their platform API expects, so JS keeps a single table.
export const logLevelValue = {
  none: 0,
  error: 1,
  verbose: 5,
};

export const events = {
  NOTIFICATION_CLICKED: 'FlareLane-NotificationClickedCallback',
  NOTIFICATION_FOREGROUND_RECEIVED:
    'FlareLane-NotificationForegroundReceivedCallback',
  IN_APP_MESSAGE_ACTION: 'FlareLane-InAppMessageActionCallback',
};
