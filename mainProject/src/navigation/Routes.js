import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, AsyncStorage} from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import AuthStack from './AuthStack';
import HomeStack from './HomeStack';
import { AuthContext } from './AuthProvider';
import Loading from '../components/Loading';
import LoginScreen from '../screens/LoginScreen';

export default function Routes() {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const { login } = useContext(AuthContext);

  // Handle user state changes
  function onAuthStateChanged(user) {
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

  return (
    <NavigationContainer>
      {user ? <HomeStack /> : <AuthStack />}
    </NavigationContainer>
  );
}