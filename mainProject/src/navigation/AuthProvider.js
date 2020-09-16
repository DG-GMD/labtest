import React, { createContext, useState } from 'react';
import database from '@react-native-firebase/database';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text} from "react-native";
import AsyncStorage from '@react-native-community/async-storage';

import RNFS from 'react-native-fs';

/**
 * This provider is created
 * to access user in whole app
 */

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [skip, setSkip] = useState(0);
  const [testNumber, setTestNumber] = useState(null);

  //const navigation = useNavigation();

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        testNumber,
        skip,
        setSkip,
        login: async (name, birth, testNumber) => {
          try {
            //await auth().signInWithEmailAndPassword(email, password);
            const onValueChange = database()
            .ref(`/users/${testNumber}`)
            .once('value', snapshot => {
              //console.log('User data: ', snapshot.val());
              let userDB = snapshot.val();

              let getName = userDB.name;
              let getBirth = userDB.birth;
              // console.log("getBirth : ", getBirth);

              const saveUser = async () => {
                try{
                  await AsyncStorage.setItem('user', getName);
                  // console.log("save name");
                }
                catch(e){
                  // console.log("fail to save name", e);
                }
              }
              const saveBirth = async () => {
                try{
                  await AsyncStorage.setItem('birth', getBirth.toString());
                  // console.log("save birth");
                }
                catch(e){
                  // console.log("fail to save birth", e);
                }
              }
              const saveNumber = async () => {
                try{
                  await AsyncStorage.setItem('testNumber', testNumber);
                  setTestNumber(testNumber);
                  // console.log("save number");
                }
                catch(e){
                  // console.log("fail to save number", e);
                }
              }
              
              saveUser();
              saveBirth();
              saveNumber();

              if(getName == name && getBirth == birth){
                setUser(getName);
              }
            });

            writeStartTime(testNumber)
          } catch (e) {
            console.log(e);
          }
        },
        
        logout: async () => {
          try {
            // console.log("logout!!!");
            setUser('');
          } catch (e) {
            console.error(e);
          }
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


//최초 로그인 날짜를 firebase DB와 로컬 저장소에 저장
async function writeStartTime(testNumber) {

  // firstLoginTime = {

  // }
  let firstLoginTime = null;
  //이미 로그인을 한번이라도 했다면 로그인 시 시간 정보 저장을 안한다.
  try{
    firstLoginTime = await AsyncStorage.getItem('firstLoginTime');
  }
  catch(e){
    console.log('no login time in AsyncStorage');
  }

  //기록된 최초 로그인 시간 정보가 없다면 새로 기록
  if(firstLoginTime == null){
    database()
    .ref('/users/'+ testNumber.toString())
    .once('value',async (snapshot) =>{
      console.log('sanpshot', snapshot.val());
      var userData = snapshot.val();
      if(userData.startDate == null){
        var now = new Date();
        now.setHours(0);
        now.setMinutes(1);

        // A post entry to set tin firebase DB
        var postData = {
          millitime: now.getTime()
        };

        database()
        .ref('/users/'+ testNumber.toString() + '/startDate')
        .update(postData)
        .then(() => console.log('start data updated.'));

        //set data to local storage
        try{
          await AsyncStorage.setItem('firstLoginTime', now.getTime().toString());
          // console.log('----------first login : ', now.getTime().toString());
        }
        catch(e){
          // console.log("fail to set firstLoginTime", e);
        }
      }
      else{
        var now = new Date(userData.startDate.millitime);
        now.setHours(0);
        now.setMinutes(1);

        if(userData.popCheck != null){
          var path = RNFS.DocumentDirectoryPath + '/popTime.txt';

          console.log('popCheck data', userData.popCheck);
          // write the file
          RNFS.writeFile(path, userData.popCheck.popTime, 'utf8')
          .then((success) => {
              console.log('Pop Time WRITTEN!');
          })
          .catch((err) => {
              console.log(err.message);
          });
        }

        //set data to local storage
        try{
          await AsyncStorage.setItem('firstLoginTime', now.getTime().toString());
          console.log('----------first login : ', now.getTime().toString());
        }
        catch(e){
          console.log("fail to set firstLoginTime", e);
        }
      }
    });
  }else{
    // console.log("---------- firstLoginTime", firstLoginTime);
  }
  
}