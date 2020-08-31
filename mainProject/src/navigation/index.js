import React from 'react';
import { AuthProvider } from './AuthProvider';
import Routes from './Routes';
import { Alert, Platform } from 'react-native';
// import { alarmModule } from '../utils/jvmodules'
import ReactNativeAN from 'react-native-alarm-notification';

export default function Providers() {
  // if(Platform.OS === 'android'){
  //   alarmModule.checkPermission(
  //     "Write",
  //     (msg) => {
  //       console.log(msg);
  //     },
  //     (pCode, isPermitted) => {
  //       if(!isPermitted)
  //         Alert.alert(
  //           title="권한설정",
  //           message="알람소리 변경을 위해 시스템 설정 권한을 허용해주세요.",
  //           buttons=[
  //             {
  //               test: '확인',
  //               onPress: () => alarmModule.requirePermission(pCode),
  //             }
  //           ]
  //         )
  //     }
  //   );
  
  //   alarmModule.checkPermission(
  //     "Overlay",
  //     (msg) => {
  //       console.log(msg);
  //     },
  //     (pCode, isPermitted) => {
  //       if(!isPermitted)
  //         Alert.alert(
  //           title="권한설정",
  //           message="알람 화면을 띄우기 위해 다른앱 위에 그리기 권한을 허용해주세요.",
  //           buttons=[
  //             {
  //               test: '확인',
  //               onPress: () => alarmModule.requirePermission(pCode),
  //             }
  //           ]
  //         )
  //     }
  //   );
  // }

  //check permission
  ReactNativeAN.checkPermissions((permissions) => {
    console.log(permissions);
  });

  //request permissions
  ReactNativeAN.requestPermissions({
    alert: true,
    badge: true,
    sound: true,
  }).then(
    (data) => {
      console.log('request permissions', data);
    },
    (data) => {
      console.log('request permissions fail', data);
    }
  );
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}