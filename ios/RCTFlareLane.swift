import FlareLane
import React

@objc(RCTFlareLane)
class RCTFlareLane: RCTEventEmitter {
  public static var emitter: RCTEventEmitter!
  var notificationClickedEventKey: String = "FlareLane-NotificationClickedCallback"
  var notificationForegroundReceivedEventKey: String = "FlareLane-NotificationForegroundReceivedCallback"
  var inAppMessageActionEventKey: String = "FlareLane-InAppMessageActionCallback"
  var notificationEventCache = [String: FlareLaneNotificationReceivedEvent]()

  override init() {
    super.init()
    RCTFlareLane.emitter = self
    FlareLane.setSdkInfo(sdkType: .reactnative, sdkVersion: "1.11.2")
  }

  // ----- PUBLIC METHODS -----

  @objc(setLogLevel:)
  func setLogLevel(logLevel: Int) {
    let level = LogLevel(rawValue: logLevel) ?? LogLevel.verbose
    FlareLane.setLogLevel(level: level)
  }

  @objc(initialize:requestPermissionOnLaunch:)
  func initialize(projectId: String, requestPermissionOnLaunch: Bool) {
    DispatchQueue.main.async {
      let launchOptions = self.bridge.launchOptions as? [UIApplication.LaunchOptionsKey: Any]
      FlareLane.initWithLaunchOptions(launchOptions, projectId: projectId, requestPermissionOnLaunch: requestPermissionOnLaunch)
    }
  }

  @objc(displayInApp:data:)
  func displayInApp(group: String, data: [String: Any]?) {
    FlareLane.displayInApp(group: group, data: data)
  }

  // ----- EVENT HANDLERS -----
  @objc func setNotificationClickedHandler() {
    FlareLane.setNotificationClickedHandler() { notification in
      RCTFlareLane.emitter.sendEvent(
        withName: self.notificationClickedEventKey,
        body: notification.toDictionary()
      )
    }
  }

  @objc func setNotificationForegroundReceivedHandler() {
    FlareLane.setNotificationForegroundReceivedHandler() { event in
      self.notificationEventCache[event.notification.id] = event

      RCTFlareLane.emitter.sendEvent(
        withName: self.notificationForegroundReceivedEventKey,
        body: event.notification.toDictionary()
      )
    }
  }

  @objc func setInAppMessageActionHandler() {
    FlareLane.setInAppMessageActionHandler { iam, actionId in
      RCTFlareLane.emitter.sendEvent(
        withName: self.inAppMessageActionEventKey,
        body: ["iam": iam.toDictionary(), "actionId": actionId]
      )
    }
  }

  @objc(displayNotification:)
  func displayNotification(notificationId: String) {
    DispatchQueue.main.async {
      if let event = self.notificationEventCache[notificationId] {
        event.display()
      }
    }
  }

  // ----- SET DEVICE META DATA -----

  @objc(setUserId:)
  func setUserId(userId: String?) {
    FlareLane.setUserId(userId: userId)
  }

  @objc(setTags:)
  func setTags(tags: [String: Any]) {
    FlareLane.setTags(tags: tags)
  }

  @objc(setUserAttributes:)
  func setUserAttributes(attributes: [String: Any]) {
    FlareLane.setUserAttributes(attributes: attributes)
  }

  // Helper-only entry for the WebView bridge adapter — not part of the public API.
  @objc(_webViewSyncPayload:)
  func _webViewSyncPayload(_ successCallback: RCTResponseSenderBlock) {
    let payload: [String: Any] = [
      "projectId": FlareLane.getProjectId() as Any,
      "deviceId": FlareLane.getDeviceId() as Any,
      "userId": FlareLane.getUserId() as Any
    ]
    successCallback([payload])
  }

  @objc(subscribe:successCallback:)
  func subscribe(fallbackToSettings: Bool, successCallback: @escaping RCTResponseSenderBlock) {
    FlareLane.subscribe(fallbackToSettings: fallbackToSettings) { isSubscribed in
      successCallback([isSubscribed])
    }
  }

  @objc func unsubscribe(_ successCallback: @escaping RCTResponseSenderBlock) {
    FlareLane.unsubscribe() { isSubscribed in
      successCallback([isSubscribed])
    }
  }

  @objc func isSubscribed(_ successCallback: @escaping RCTResponseSenderBlock) {
    FlareLane.isSubscribed() { isSubscribed in
      successCallback([isSubscribed])
    }
  }

  @objc func getDeviceId(_ successCallback: RCTResponseSenderBlock) {
    successCallback([FlareLane.getDeviceId() as Any])
  }

  @objc(trackEvent:data:)
  func trackEvent(type: String, data: [String: Any]?) {
    FlareLane.trackEvent(type, data: data)
  }

  // ----- SDK SETTINGS -----

  override open func supportedEvents() -> [String] {
    return [
      self.notificationClickedEventKey,
      self.notificationForegroundReceivedEventKey,
      self.inAppMessageActionEventKey
    ]
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

extension FlareLaneInAppMessage {
  func toDictionary() -> [String: Any] {
    return [
      "id": self.id
    ]
  }
}
