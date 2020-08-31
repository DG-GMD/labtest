//
//  iosAlarmModule.m
//  labtest
//
//  Created by skku2 on 2020/08/31.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(iosAlarmModule, NSObject)

RCT_EXTERN_METHOD(setAlarmTime:(NSInteger)hour minute:(NSInteger)minute)

@end
