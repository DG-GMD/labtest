import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import { AuthContext } from '../navigation/AuthProvider';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [testNumber, setTestNumber] = useState('');

  const { login } = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <Text style={{
        fontSize: 30,
        margin: 40
      }}>i-lab Voice Alarm</Text>
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
      <FormButton buttonTitle='Login' onPress={() => login(name, birth, testNumber)} />
      <FormButton buttonTitle='Test Login' onPress={() => login('park', '970000', '1000')} />
      <Text style={styles.text}>연구번호를 분실했거나 오류가 발생할 경우, 관리자
(green940@g.skku.edu)에게 문의해주십시오.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 20,
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
