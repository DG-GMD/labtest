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

    // this.getData = this.getData.bind(this);
    
    this.state = {
      uesrName: '',
      userTestNumber: 0,
      howLongDate: 0,
      userDB: null,
      returnDOM: ''
    };

   

    
    
  }

  // componentDidMount(){
  //   this.getData();
  // }

  // getData = async () => {
  //   const storageUserName = await AsyncStorage.getItem('user');
    
  //   const storageTestNumber = await AsyncStorage.getItem('testNumber');
  //   console.log("storage ", storageTestNumber, storageUserName);

  //   this.setState({
  //     userName: storageUserName,
  //     userTestNumber: storageTestNumber
  //   });

  //   database()
  //   .ref('/users/' + storageTestNumber)
  //   .once('value')
  //   .then(snapshot => {
  //     console.log("snapshot ", snapshot.val());
  //     this.setState({
  //       userDB: snapshot.val(),

  //     });
  //   })
  //   .then( () => {
  //     let milliTime = this.state.userDB.startDate.millitime;
  //     console.log('time : ', milliTime);

  //     let now = new Date();

  //     let calcDate = new Date(now.getTime() - milliTime);
  //     this.setState({
  //       howLongDate: calcDate
  //     });

  //     // this.setState(this.state);
      
  //   });

  //   console.log("**************");
  //   console.log("userDB", this.state.userDB);
  //   console.log("username", this.state.userName);

    
  // };

 

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