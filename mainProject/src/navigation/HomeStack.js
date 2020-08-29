import React, {useState, Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { createStackNavigator } from '@react-navigation/stack';


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import  AlarmMain  from '../screens/AlarmMainScreen';
import  AlarmSet  from '../screens/AlarmSetScreen';
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

    // this.getData = this.getData.bind(this);
    
    this.state = {
      uesrName: '',
      userTestNumber: 0,
      howLongDate: 0,
      userDB: null,
      returnDOM: ''
    };
    
    (async () => {
      await CheckDate();
    })();
  }

  //마지막 시험으로부터 며칠이 지났는지 확인

  render(){
    return (
      <Tab.Navigator
        tabBarOptions={{
          activeTintColor: 'lightseagreen',
          labelStyle: {
            fontSize: 20,
            margin: 5,
            paddingBottom: 5
    
          },
        }}
        initialRouteName={this.props.initialRouteName}
      >
        <Tab.Screen name='알람 설정' component={AlarmStack} 
         />
        <Tab.Screen name='단어 학습' component={TestStack} 
        />
        <Tab.Screen name='진행 확인' component={CheckStack} 
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
      console.log("durationDate:", durationDate);
      //마지막으로 기록된 테스트 날짜에 앱을 연 상황
      //= 테스트를 이미봤다는 가정이기 때문에 아무것도 할 필요가 없음
    }
    //하루 이상이 지났을 때
    //= 마지막으로 기록된 테스트 날짜 다음날부터 CheckDate()가 호출됐을 때
    //= 접속을 그 동안 안했으니 해당 기간에 시험을 안봤다고 표기/저장해야함
    else if(durationDate >= 2){
      console.log("durationDate:", durationDate);
      //AsyncStorage에 저장된 정보들 삭제
      await AsyncStorage.removeItem('testResult');
      await AsyncStorage.removeItem('testResultTime');
      await AsyncStorage.removeItem('popTime');

      //시험을 보지 않은 날짜가 있다면 해당 내용들은 DB에 null로 기록
      let firstLoginTime = await AsyncStorage.getItem('firstLoginTime');

      //최초 로그인날짜부터 현재까지의 시간 구하기
      let allDuration = new Date(now.getTime() - firstLoginTime);

      //마지막 테스트 결과 D+날짜를 얻기
      let lastDate = await AsyncStorage.getItem('lastDate');  
      
      console.log("all duration", allDuration.getDate());
      console.log("last test date", lastDate); 
      // 1               2 3 4 5 6 7
      // 0               0 x x x 

      //앱에 접속안한 기간만큼 DB에 시험을 안 봤다고 기록
      // for(let i=lastDate+1; i<allDuration.getDate(); i++){
      //   try{
      //     let postData = {
      //       correctCount: -1,
      //       date: now.toString()
      //     };

      //     let updates= {};
      //     updates['/users/1000/test/' + i] = postData;
      //     database().ref().update(updates);

      //   }
      //   catch(e){
      //     console.log('fail to update non-test date', e);
      //   }
      // }
    }
  }
  catch(e){
    console.log('fail to get testresulttime ', e);
  }
}

function AlarmStack({navigation}){
  return (  
    <Stack.Navigator>
        <Stack.Screen name="AlarmMain" component={AlarmMain} />
        <Stack.Screen name="AlarmSet" component={AlarmSet} options={{ title: '알람설정'}}/>
    </Stack.Navigator>
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