import React from 'react';
import { AuthProvider } from './AuthProvider';
import Routes from './Routes';
import { Alert, Platform } from 'react-native';
// import { alarmModule } from '../utils/jvmodules'
import NotifService from '../utils/NotifService';

export default function Providers() {
  //check notification permission
  var notifObj = new NotifService(
    null,
    null,
  );

  notifObj.requestPermissions();

  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}