import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, AsyncStorage, BackHandler} from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import AuthStack from './AuthStack';
import HomeStack from './HomeStack';
import { AuthContext } from './AuthProvider';
import Loading from '../components/Loading';
import { alarmModule } from '../utils/jvmodules'

import { createStackNavigator } from '@react-navigation/stack';
import PopScreen from '../screens/PopScreen';
const Stack = createStackNavigator();
import LoginScreen from '../screens/LoginScreen';

export default function Routes() {
  const { user, setUser } = useContext(AuthContext);
  const { skip, setSkip } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [Pop, setPop] = useState(true);

  if(skip == 3){
    BackHandler.exitApp();
  }

  alarmModule.checkIsAlarm(
    (msg) => {
      console.log(msg);
    },
    (isAlarm) => {
      if(isAlarm){
        setPop(true);
      }
      else{
        setPop(false);
      }
    }
  );
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
    return subscriber; // unsubscribe on unmount
  }, []);

  //한번 로그인했었으면 해당 정보로 자동 로그인
  (async () => {
    const storageUserName = await AsyncStorage.getItem('user');
    console.log("get name!");
      
    if( storageUserName != null){
      const storageUserBirth = await AsyncStorage.getItem('birth');
          
       
      const storageUserNumber = await AsyncStorage.getItem('testNumber');
          
      console.log(typeof(storageUserName), typeof(storageUserBirth),typeof(storageUserNumber));
      console.log(storageUserName, storageUserBirth, storageUserNumber);
      login(storageUserName, storageUserBirth, storageUserNumber);
    }

  })();
  

  if (loading) {
    return <Loading />;
  }

  if(Pop){
    return(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name='Pop'
            component={PopScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <NavigationContainer>
        {user ? <HomeStack /> : <AuthStack />}
      </NavigationContainer>
    );
  }
}