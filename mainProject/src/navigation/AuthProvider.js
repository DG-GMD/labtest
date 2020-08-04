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
<<<<<<< HEAD
=======

>>>>>>> origin/master
              let userDB = snapshot.val();

              let getName = userDB.name;
              let getBirth = userDB.birth;
<<<<<<< HEAD
=======
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
              saveUser();
              saveBirth();
              saveNumber();
>>>>>>> origin/master

              if(getName == name && getBirth == birth){
                //navigation.navigate('HomeStack');
                setUser(getName);
              }
            });
          } catch (e) {
            console.log(e);
          }
        },
        
        logout: async () => {
          try {
            await auth().signOut();
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
