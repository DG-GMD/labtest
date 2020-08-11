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
    let btime = new Date(24 * 3600 * 1000 -1);

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
    let durationDate = calcDate.getDate();
    //하루가 지나지 않았을 때
    //= 마지막으로 기록된 테스트 날짜에 CheckDate()가 호출됐을 때
    if(durationDate == 1){

    }
    //하루 이상이 지났을 때
    //= 마지막으로 기록된 테스트 날짜 다음날부터 CheckDate()가 호출됐을 때
    //= 접속을 그 동안 안했으니 해당 기간에 시험을 안봤다고 표기/저장해야함
    else if(durationDate >= 2){
      //AsyncStorage에 저장된 정보들 삭제
      await AsyncStorage.removeItem('testResult');
      await AsyncStorage.removeItem('testResultTime');


      //시험을 보지 않은 날짜가 있다면 해당 내용들은 DB에 null로 기록
      let firstLoginTime = await AsyncStorage.getItem('firstLoginTime');

      //최초 로그인날짜부터 현재까지의 시간 구하기
      let allDuration = new Date(now.getTime() - firstLoginTime);

      //마지막 테스트 결과 D+날짜를 얻기
      let lastDate = await AsyncStorage.getItem('lastDate');   
      // 1               2 3 4 5 6 7
      // 0               0 x x x 
    }
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