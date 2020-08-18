import React from 'react';
import { AuthProvider } from './AuthProvider';
import Routes from './Routes';
import { Alert, Platform } from 'react-native';
import { alarmModule } from '../utils/jvmodules'

export default function Providers() {
  if(Platform.OS === 'android'){
    alarmModule.checkPermission(
      "Write",
      (msg) => {
        console.log(msg);
      },
      (pCode, isPermitted) => {
        if(!isPermitted)
          Alert.alert(
            title="권한설정",
            message="알람소리 변경을 위해 시스템 설정 권한을 허용해주세요.",
            buttons=[
              {
                test: '확인',
                onPress: () => alarmModule.requirePermission(pCode),
              }
            ]
          )
      }
    );
  
    alarmModule.checkPermission(
      "Overlay",
      (msg) => {
        console.log(msg);
      },
      (pCode, isPermitted) => {
        if(!isPermitted)
          Alert.alert(
            title="권한설정",
            message="알람 화면을 띄우기 위해 다른앱 위에 그리기 권한을 허용해주세요.",
            buttons=[
              {
                test: '확인',
                onPress: () => alarmModule.requirePermission(pCode),
              }
            ]
          )
      }
    );
  }

  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}