import FlareLane

@objc(RCTFlareLane)
class RCTFlareLane: RCTEventEmitter {
  public static var emitter: RCTEventEmitter!
  var notificationConvertedEventKey: String = "FlareLane-NotificationConverted"

  override init() {
    super.init()
    RCTFlareLane.emitter = self
    FlareLane.setSdkInfo(sdkType: .reactnative, sdkVersion: "1.4.1")
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
  @objc func setNotificationConvertedHandler() {
    FlareLane.setNotificationConvertedHandler() { payload in
      let notificationDictionary: [String: Optional<Any>] = [
        "id": payload.id,
        "title": payload.title,
        "body": payload.body,
        "url": payload.url,
        "imageUrl": payload.imageUrl,
        "data": payload.data
      ]

      RCTFlareLane.emitter.sendEvent(withName: self.notificationConvertedEventKey, body: notificationDictionary)
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

  // Deprecated
  @objc(setIsSubscribed:successCallback:)
  func setIsSubscribed(isSubscribed: Bool, successCallback: @escaping RCTResponseSenderBlock) {
    FlareLane.setIsSubscribed(isSubscribed: isSubscribed) { isSubscribed in
      successCallback([isSubscribed])
    }
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
    return [self.notificationConvertedEventKey]
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
