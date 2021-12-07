import FlareLane

@objc(RCTFlareLane)
class RCTFlareLane: RCTEventEmitter {
  public static var emitter: RCTEventEmitter!
  var notificationConvertedEventKey: String = "FlareLane-NotificationConverted"
  
  override init() {
    super.init()
    RCTFlareLane.emitter = self
    FlareLane.setSdkInfo(sdkType: .reactnative, sdkVersion: "1.0.7")
  }

  // ----- PUBLIC METHOD -----
  
  @objc(setLogLevel:)
  func setLogLevel(logLevel: Int) {
    let level = LogLevel(rawValue: logLevel) ?? LogLevel.verbose
    FlareLane.setLogLevel(level: level)
  }
  
  @objc(initialize:)
  func initialize(projectId: String) {
    let launchOptions = self.bridge.launchOptions as? [UIApplication.LaunchOptionsKey: Any]
    FlareLane.initWithLaunchOptions(launchOptions, projectId: projectId)
  }
  
  // ----- EVENT HANDLERS -----
  @objc func setNotificationConvertedHandlerEvent() {
    FlareLane.setNotificationConvertedHandler() { payload in
      RCTFlareLane.emitter.sendEvent(withName: self.notificationConvertedEventKey, body: payload.toDictionary())
    }
  }

  // ----- SET DEVICE META DATA -----
  
  @objc(setUserId:)
  func setUserId(userId: String) {
     FlareLane.setUserId(userId: userId)
  }

  @objc(setTags:)
  func setTags(tags: [String: Any]) {
     FlareLane.setTags(tags: tags)
  }
  
  @objc(deleteTags:)
  func deleteTags(keys: [String]) {
     FlareLane.deleteTags(keys: keys)
  }

  @objc(setIsSubscribed:)
  func setIsSubscribed(isSubscribed: Bool) {
     FlareLane.setIsSubscribed(isSubscribed: isSubscribed)
  }
  
  // ----- SDK SETTINGS -----

  override open func supportedEvents() -> [String] {
    return [self.notificationConvertedEventKey]
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
