import React, {useState, Component} from 'react';
import {AsyncStorage} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import  Alarm  from '../screens/AlarmScreen';
import  Check  from '../screens/CheckScreen';
import TestStack from './TestStack';
import { StackActions } from '@react-navigation/native';
import database from '@react-native-firebase/database';

import LogoutButton from '../components/Logout';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();



export default class HomeStack extends Component {
  constructor(props){
    super(props);

    console.log('home stack props is ', props);

    // this.getData = this.getData.bind(this);
    
    this.state = {
      uesrName: '',
      userTestNumber: 0,
      howLongDate: 0,
      userDB: null,
      returnDOM: ''
    };
    let atime = new Date(0);
    let btime = new Date(24 * 3600 * 1000);

    let gap = new Date(btime.getTime() - atime.getTime());
    console.log('testtttttttttttttttttttt ', gap.getDate());
  }

  //마지막 시험으로부터 며칠이 지났는지 확인

  render(){
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
        initialRouteName={this.props.initialRouteName}
      >
        <Tab.Screen name='Alarm' component={Alarm} 
         />
        <Tab.Screen name='Test' component={TestStack} 
        />
        <Tab.Screen name='Check' component={CheckStack} 
        />   
      </Tab.Navigator>
    );
  }
 
}

//마지막 시험으로부터 며칠이 지났는지 확인
async function CheckDate(){
    let testResultTime = null;
    try{
      //마지막으로 시험 결과를 저장한 시간 가져오기
      testResultTime = await AsyncStorage.getItem('testResultTime');
      console.log('get testresulttime ', testResultTime);

      let now = new Date();
      let calcDate = new Date(now.getTime() - testResultTime);

      // if(calcDate.getDate() )
    }
    catch(e){
      console.log('fail to get testresulttime ', e);
    }
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