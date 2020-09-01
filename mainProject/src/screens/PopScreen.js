import React, { useContext, useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, Button, BackHandler, StyleSheet, Platform, TouchableOpacity} from 'react-native';
// import { alarmModule } from '../utils/jvmodules';
import { AuthContext } from '../navigation/AuthProvider';

//import AsyncStorage from '@react-native-community/async-storage'

import { Player } from '@react-native-community/audio-toolkit';

import RNFS from 'react-native-fs';

import swiftAlarmModule from "../utils/swiftModule";

// async function savePopTime(){
//     //popScreen이 표시된 시간을 로컬 저장소에 저장
    
//     let now = new Date();
//     try{
//         console.log('savePoptime ', now.getTime().toString());
//         await AsyncStorage.setItem('popTime', now.getTime().toString());
//     }
//     catch(e){
//         console.log('fail to save poptime ', e);
//     }
    
// }

const startDict = (admit) => {
    console.log("admit", admit);
    // alarmModule.startDict(admit);
}

export default function Pop({navigation}){
    const { setSkip } = useContext(AuthContext);
    
    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
            }}
        >
            <View style={{
                width: '100%',
                flex:1, 
                flexDirection: 'row',
            }}>
                <Text style={{fontSize: 25, alignSelf:'center', textAlign: 'center'}}>
                    오늘의 단어 학습을 시작하시겠습니까?
                </Text>
            </View>
            <View style={{
                flex:1,
                flexDirection: 'row',
                }}>
                <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress = {() => {
                        swiftAlarmModule.confirmFromPopScreen();
                        var path = RNFS.DocumentDirectoryPath + '/popTime.txt';

                        // write the file
                        RNFS.writeFile(path, new Date().getTime().toString(), 'utf8')
                        .then((success) => {
                            console.log('Pop Time WRITTEN!');
                            startDict(true);
                            setSkip(2);
                        })
                        .catch((err) => {
                            console.log(err.message);
                        });
                    }}
                >
                    <Text style={{fontSize: 18}}>
                        예
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress = {() => {
                        swiftAlarmModule.confirmFromPopScreen();
                        var path = RNFS.DocumentDirectoryPath + '/popTime.txt';

                        // write the file
                        RNFS.writeFile(path, new Date().getTime().toString(), 'utf8')
                        .then((success) => {
                            console.log('Pop Time WRITTEN!');
                            startDict(false);
                            BackHandler.exitApp();
                        })
                        .catch((err) => {
                            console.log(err.message);
                        });
                    }} 
                >
                    <Text style={{fontSize: 18}}>
                        아니요
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 10,
        width: 90,
        height: 50,
        backgroundColor: 'lightgreen',
        padding: 10,
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
});
