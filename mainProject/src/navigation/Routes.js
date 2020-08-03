import React, { useContext, useState, useEffect } from 'react';
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

export default function Routes() {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [Pop, setPop] = useState(true);

  alarmModule.checkIsAlarm(
    (msg) => {
      console.log(msg);
    },
    (isAlarm) => {
      console.log("isAlarm", isAlarm);
      if(isAlarm){
        setPop(true);
      }
      else{
        setPop(false);
      }
    }
  );

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

  if (loading) {
    return <Loading />;
  }

  if(Pop){
    console.log("I reach");
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