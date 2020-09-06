import React, { useRef, useContext, useState, useEffect, createContext } from 'react';
import { AppState, StyleSheet, Text,  Platform } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import AuthStack from './AuthStack';
import HomeStack from './HomeStack';
import { AuthContext } from './AuthProvider';
import Loading from '../components/Loading';
// import { alarmModule } from '../utils/jvmodules'
import AsyncStorage from '@react-native-community/async-storage'

import { createStackNavigator } from '@react-navigation/stack';
import PopScreen from '../screens/PopScreen';
const Stack = createStackNavigator();
import LoginScreen from '../screens/LoginScreen';
import swiftAlarmModule from '../utils/swiftModule';

import UserContext, {UserProvider} from './UserContext';




export default function Routes() {
  const { user, setUser } = useContext(AuthContext);
  const { skip } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [refresh, setRefresh] = useState(false);
  const {isPop, setPop} = useContext(UserContext);

  let irn = "알람 설정";
  if(skip == 2)
    irn = "단어 학습";


  //popscreen을 띄워도 되는지 확인
  swiftAlarmModule.isTimeToPop(
    (isAlarm) => {
    if(isAlarm){
      setPop(true);
      console.log("routes: isTimeToPop: isAlarm is true!!");
    }
    else{
      setPop(false);
      console.log("routes: isTimeToPop: isAlarm is true!!");
    }
  });

  console.log("-------isPop", isPop);

  // alarmModule.checkIsAlarm(
  //   (msg) => {
  //     console.log(msg);
  //   },
  //   (isAlarm) => {
  //     if(isAlarm){
  //       setPop(true);
  //     }
  //     else{
  //       setPop(false);
  //     }
  //   }
  // );

  const { login } = useContext(AuthContext);

  
  // Handle user state changes
  function onAuthStateChanged(user) {
    console.log("user", user);
    setUser(user);
    if (initializing) setInitializing(false);
    setLoading(false);
  }

  
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    console.log(onAuthStateChanged);

    AppState.addEventListener("change", _handleAppStateChange);
    //popscreen을 띄워도 되는지 확인
  
    return subscriber; // unsubscribe on unmount
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
    }

    setRefresh(!refresh);
    console.log("refresh: ", refresh);

    swiftAlarmModule.isTimeToPop(
      (isAlarm) => {
      if(isAlarm){
        setPop(true);
        console.log("useEffect: isTimeToPop: isAlarm is true!!");
      }
      else{
        setPop(false);
        console.log("useEffect: isTimeToPop: isAlarm is false!!");
      }
    });

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
    console.log("AppState", appState.current);
  };

  //한번 로그인했었으면 해당 정보로 자동 로그인
  (async () => {
    const storageUserName = await AsyncStorage.getItem('user');
    // console.log("get name!");
    
    if( storageUserName != null){
      const storageUserBirth = await AsyncStorage.getItem('birth');
      const storageUserNumber = await AsyncStorage.getItem('testNumber');
          
      // console.log(typeof(storageUserName), typeof(storageUserBirth),typeof(storageUserNumber));
      // console.log(storageUserName, storageUserBirth, storageUserNumber);
      login(storageUserName, storageUserBirth, storageUserNumber);
    }
  })();
  

  if (loading) {
    return <Loading />;
  }

  if(isPop){
    return(
      
        <PopScreen/>
      
    );
  } else {
    return (
      <NavigationContainer>
                 
        {user ? <HomeStack 
                  initialRouteName={irn} 
                /> : <AuthStack />}
      </NavigationContainer>
    );
  }
}