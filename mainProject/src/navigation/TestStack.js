import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import  Memorize  from '../screens/MemorizeScreen';
import  Test  from '../screens/TestScreen';

const Stack = createStackNavigator();

export default function TestStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='Memorize'
        component={Memorize}
      />
      <Stack.Screen
        name='Test'
        component={Test}
      />
    </Stack.Navigator>
  );
}
