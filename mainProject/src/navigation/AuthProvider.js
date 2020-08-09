import React, { createContext, useState } from 'react';
import database from '@react-native-firebase/database';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, AsyncStorage} from "react-native";

/**
 * This provider is created
 * to access user in whole app
 */

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [skip, setSkip] = useState(null);

  //const navigation = useNavigation(); 

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        setSkip,
        login: async (name, birth, testNumber) => {
          try {
            //await auth().signInWithEmailAndPassword(email, password);
            const onValueChange = database()
            .ref(`/users/${testNumber}`)
            .on('value', snapshot => {

              console.log('User data: ', snapshot.val());
              let userDB = snapshot.val();

              let getName = userDB.name;
              let getBirth = userDB.birth;
              console.log("getBirth : ", getBirth);

              const saveUser = async () => {
                try{
                  await AsyncStorage.setItem('user', getName);
                  console.log("save name");
                }
                catch(e){
                  console.log("fail to save name", e);
                }
              }
              const saveBirth = async () => {
                try{
                  await AsyncStorage.setItem('birth', getBirth.toString());
                  console.log("save birth");
                }
                catch(e){
                  console.log("fail to save birth", e);
                }
              }
              const saveNumber = async () => {
                try{
                  await AsyncStorage.setItem('testNumber', testNumber);
                  console.log("save number");
                }
                catch(e){
                  console.log("fail to save number", e);
                }
              }
              
              

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
            console.log("logout!!!");
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


function writeStartTime(testNumber) {
  var now = new Date();

  // A post entry.
  var postData = {
    millitime: now.getTime()
  };

  database()
  .ref('/users/'+ testNumber.toString() + '/startDate')
  .update(postData)
  .then(() => console.log('start data updated.'));
}