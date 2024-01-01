import FlareLane

@objc(RCTFlareLane)
class RCTFlareLane: RCTEventEmitter {
  public static var emitter: RCTEventEmitter!
  var notificationClickedEventKey: String = "FlareLane-NotificationClickedCallback"
  var notificationForegroundReceivedEventKey: String = "FlareLane-NotificationForegroundReceivedCallback"
  var notificationEventCache = [String: FlareLaneNotificationReceivedEvent]()

  override init() {
    super.init()
    RCTFlareLane.emitter = self
    FlareLane.setSdkInfo(sdkType: .reactnative, sdkVersion: "1.5.0")
  }

  // ----- PUBLIC METHOD -----

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

  @objc func getTags(_ successCallback: @escaping RCTResponseSenderBlock) {
    FlareLane.getTags() { tags in
      successCallback([tags as Any])
    }
  }

  @objc(setTags:)
  func setTags(tags: [String: Any]) {
    FlareLane.setTags(tags: tags)
  }

  @objc(deleteTags:)
  func deleteTags(keys: [String]) {
    FlareLane.deleteTags(keys: keys)
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
    return [self.notificationClickedEventKey, self.notificationForegroundReceivedEventKey]
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
