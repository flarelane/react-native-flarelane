#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RCTFlareLane, RCTEventEmitter)

RCT_EXTERN_METHOD(setLogLevel:
                    (NSInteger)logLevel
)

RCT_EXTERN_METHOD(initialize:
                    (NSString)projectId
                    requestPermissionOnLaunch: (BOOL)requestPermissionOnLaunch
)

RCT_EXTERN_METHOD(setNotificationConvertedHandler)

RCT_EXTERN_METHOD(setUserId:
                    (NSString)userId
)

RCT_EXTERN_METHOD(getTags: (RCTResponseSenderBlock *)successCallback)

RCT_EXTERN_METHOD(setTags:
                    (NSDictionary)tags
)

RCT_EXTERN_METHOD(deleteTags:
                    (NSArray)keys
)

RCT_EXTERN_METHOD(setIsSubscribed:
                    (BOOL)isSubscribed
                    successCallback: (RCTResponseSenderBlock *)successCallback
)

RCT_EXTERN_METHOD(subscribe:
                    (BOOL)fallbackToSettings
                    successCallback: (RCTResponseSenderBlock *)successCallback
)

RCT_EXTERN_METHOD(unsubscribe: (RCTResponseSenderBlock *)successCallback)

RCT_EXTERN_METHOD(isSubscribed: (RCTResponseSenderBlock *)successCallback)

RCT_EXTERN_METHOD(getDeviceId: (RCTResponseSenderBlock *)successCallback)

RCT_EXTERN_METHOD(trackEvent:
                    (NSString)type
                    data: (NSDictionary)data
)

@end
