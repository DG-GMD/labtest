//
//  iosAlarmModule.m
//  labtest
//
//  Created by skku2 on 2020/08/31.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(swiftAlarmModule, NSObject)

RCT_EXTERN_METHOD(setAlarmTime:(NSInteger)hour minute:(NSInteger)minute)
RCT_EXTERN_METHOD(checkAlarm:(NSString)number)
RCT_EXTERN_METHOD(confirmFromPopScreen)
RCT_EXTERN_METHOD(isTimeToPop: (RCTResponseSenderBlock)callback)

@end
