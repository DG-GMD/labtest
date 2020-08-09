import React , { useContext, useState, useEffect }from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import  Memorize  from '../screens/MemorizeScreen';
import  Test  from '../screens/TestScreen';
import { AsyncStorage } from 'react-native';

const Stack = createStackNavigator();

export default function TestStack() {
  const [testState, setState] = useState('');
  

  

  //로컬에 저장된 시험 진행 상태를 가져온다
  (async () => {
    try{
      setState( await AsyncStorage.getItem('day1') );
      console.log("read day1 state!!", testState);
    }
    catch(e){
      console.log("fail to read day1", e);
    }
    
  })();


  useEffect(() => {
    //시험 진행 상태에 따라 라우팅한다
    console.log("in hook") ;
  });
  //시험 진행 상태에 따라 라우팅한다
  if(testState == 'testing' || testState == "after test"){
    
    console.log(testState, "=============alreay done testing!!!!");
    return(
      <Stack.Navigator
        initialRouteName="Test"
      >
        <Stack.Screen
          name="Test"
          component={Test}
        />
        
      </Stack.Navigator>
    );
  }
  else{
    console.log("==================not yet!!");
    return (
      <Stack.Navigator
        initialRouteName="Memorize"
      >
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
}

function writeTestState(state){
  (async () => {
      try{
          await AsyncStorage.setItem('day1', state);
          console.log("check day1 as", state);
      }
      catch(e){
          console.log("fail to check day1 ", state);
      }
  })();
}
