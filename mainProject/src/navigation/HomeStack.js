import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import  Alarm  from '../screens/AlarmScreen';
import  Check  from '../screens/CheckScreen';
import TestStack from './TestStack';
import { StackActions } from '@react-navigation/native';



const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function HomeStack() {
  
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: 'lightseagreen',
        labelStyle: {
          fontSize: 22,
          margin: 0,
          padding: 10,
        },
      }}
    >
      <Tab.Screen name='Test' component={TestStack} />
      <Tab.Screen name='Alarm' component={Alarm} />
      <Tab.Screen name='Check' component={CheckStack} />    
    </Tab.Navigator>
  );
}

function CheckStack({navigation}){
  return(
    <Stack.Navigator>
      <Stack.Screen 
        name='Check'
        component={Check}
      />
    </Stack.Navigator>
  );
}