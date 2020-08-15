import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import { AuthContext } from '../navigation/AuthProvider';

import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [testNumber, setTestNumber] = useState('');

  const { login } = useContext(AuthContext);

  const downloadAlarmFile = () => {
    let filePath = RNFS.DocumentDirectoryPath;
    console.log("filePath", filePath)
    const downloadTo = `${filePath}/alarm.mp3`;

    const task = storage()
      .ref('/test/Alarm-ringtone.mp3')
      .writeToFile(downloadTo);
  
      task.on('state_changed', taskSnapshot => {
          console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
      });
      
      task.then(() => {
          console.log('alarm uploaded to the bucket!');
      }).catch((err)=>{
          console.log(err.message);
      });
  };

  return (
    <View style={styles.container}>
      <View style={{
        marginTop: 20,
        width: '80%',
        flex: 2,
        backgroundColor: 'white',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{
          fontSize: 30,
          margin: 20,
          marginBottom: 50
        }}>영어 단어 학습</Text>
        <FormInput
          value={name}
          placeholderText='이름'
          onChangeText={userName => setName(userName)}
          autoCapitalize='none'
          autoCorrect={false}
        />
        <FormInput
          value={birth}
          placeholderText='생년월일(6자)'
          onChangeText={userBirth => setBirth(userBirth)}
        />
        <FormInput
          value={testNumber}
          placeholderText='연구번호'
          onChangeText={userTestNumber => setTestNumber(userTestNumber)}
        />
      </View>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10
      }}>
        <FormButton buttonTitle='Login' onPress={() => {
          database()
          .ref('/users/' + testNumber)
          .once('value')
          .then(snapshot => {
            let userData = snapshot.val();
            let res = false;
    
            if(userData != null)
              res = (userData.name == name && userData.birth.toString() == birth);
            else
              res = false;
            
            if(res){
              downloadAlarmFile();
              login(name, birth, testNumber);
            }
            else{
              Alert.alert(
                '알림',
                '잘못된 사용자 정보입니다.'
              );
            }
          });
        }} />
        <FormButton buttonTitle='Test Login' onPress={() => login('park', '970000', '1000')} />
        <Text style={styles.text}>연구번호를 분실했거나 오류가 발생할 경우, 관리자
(green940@g.skku.edu)에게 문의해주십시오.</Text>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFEFEF',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 15,
    margin: 20
  },
  navButton: {
    marginTop: 15
  },
  navButtonText: {
    fontSize: 20,
    color: '#6646ee'
  }
});
