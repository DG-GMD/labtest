import React from 'react';
import { AuthProvider } from './AuthProvider';
import Routes from './Routes';
import { NativeModules, Alert, Platform } from 'react-native';
// import { alarmModule } from '../utils/jvmodules'
import NotifService from '../utils/NotifService';

export default function Providers() {
  //check notification permission
  var notifObj = new NotifService(
    null,
    null,
  );

  notifObj.requestPermissions();

  //start check alardm
  // const swiftAlarmModule = NativeModules.swiftAlarmModule;
  // swiftAlarmModule.checkAlarm();

  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}