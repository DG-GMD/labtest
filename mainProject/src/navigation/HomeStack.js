import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import  Alarm  from '../screens/AlarmScreen';
import  Check  from '../screens/CheckScreen';
import TestStack from './TestStack';


const Tab = createBottomTabNavigator();

export default function HomeStack() {
  return (
    <Tab.Navigator>
      <Tab.Screen name='Test' component={TestStack} />
      <Tab.Screen name='Alarm' component={Alarm} />
      <Tab.Screen name='Check' component={Check} />    
    </Tab.Navigator>
  );
}