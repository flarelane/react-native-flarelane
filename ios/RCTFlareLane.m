#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RCTFlareLane, RCTEventEmitter)

RCT_EXTERN_METHOD(setLogLevel:
                    (NSInteger)logLevel 
)

RCT_EXTERN_METHOD(initialize:
                    (NSString)projectId 
)

RCT_EXTERN_METHOD(setNotificationConvertedHandlerEvent)

RCT_EXTERN_METHOD(setUserId:
                    (NSString)userId 
)

RCT_EXTERN_METHOD(setTags:
                    (NSDictionary)tags 
)

RCT_EXTERN_METHOD(deleteTags:
                    (NSArray)keys 
)

RCT_EXTERN_METHOD(setIsSubscribed:
                    (BOOL)isSubscribed 
)

@end