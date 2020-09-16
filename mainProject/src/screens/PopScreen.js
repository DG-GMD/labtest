import React, { useContext, useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, Button, BackHandler, StyleSheet, Platform, TouchableOpacity} from 'react-native';
// import { alarmModule } from '../utils/jvmodules';
import { AuthContext } from '../navigation/AuthProvider';

//import AsyncStorage from '@react-native-community/async-storage'
import database from '@react-native-firebase/database';
import { Player } from '@react-native-community/audio-toolkit';

import RNFS from 'react-native-fs';

import swiftAlarmModule from "../utils/swiftModule";

import UserContext from '../navigation/UserContext';

import RNExitApp from 'react-native-exit-app';


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
    const { setSkip, testNumber } = useContext(AuthContext);

    const {isPop} = useContext(UserContext);
    const {setPop} = useContext(UserContext);
    const {showRefresh} = useContext(UserContext);
    const {startMemorize} = useContext(UserContext);

    const [refresh, setRefresh] = useState(null);

    const yesButton = () => {
        swiftAlarmModule.confirmFromPopScreen();
                            
        startMemorize();
        startDict(true);
            setSkip(2);
            setRefresh(true);
            console.log("PopScreen: isPop is", isPop);
            setPop(false);
    }

    const onButtonClicked = (boolButton) => {
        var path = RNFS.DocumentDirectoryPath + '/popTime.txt';
        var popTimeStr = new Date().getTime().toString();

        // write the file
        RNFS.writeFile(path, popTimeStr, 'utf8')
        .then((success) => {
            console.log('Pop Time WRITTEN!');

            database()
            .ref('/users/' + testNumber + '/popCheck')
            .orderByChild('order')
            .limitToLast(1)
            .once('value')
            .then(snapshot => {
                var data = snapshot.val();

                var popData = {};
                for(let key in data){
                    popData = data[key];
                }

                json = {};
                json.popTime = popTimeStr;
                console.log('popCheckData', data);
                if(data == null || data == undefined){
                    json['0'] = {
                        'order' : 0,
                        'clicked': boolButton,
                        'registeredDate': new Date().toString()
                    }
                }
                else{
                    let currentOrder = popData.order + 1;
                    json[currentOrder.toString()] = {
                        'order' : currentOrder,
                        'clicked': boolButton,
                        'registeredDate': new Date().toString()
                    }
                }

                database()
                .ref('/users/' + testNumber + '/popCheck')
                .update(json)
                .then(() => {
                    console.log('Pop Time saved to firebase');

                    if(boolButton){
                        startDict(true);
                        setSkip(2);
                    }
                    else {
                        startDict(false);
                        BackHandler.exitApp();
                    }
                })
                .catch((err)=>{
                    console.log(err.message);
                })
            });
        })
        .catch((err) => {
            console.log(err.message);
        });
    }

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
                justifyContent: 'center',
                padding: 30
            }}>
                <Text style={{fontSize: 25, alignSelf:'center', textAlign: 'center'}}>
                    오늘의 단어 학습을{"\n\n"} 시작하시겠습니까?
                </Text>
            </View>
            <View style={{
                flex:1,
                flexDirection: 'row',
                }}>
                <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress = {() => {
                        yesButton();
                        onButtonClicked(true);
                    }}
                >
                    <Text style={{fontSize: 18}}>
                        예
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress = {() => {
                        swiftAlarmModule.confirmFromPopScreen()
                        
                        startMemorize();
                        
                        onButtonClicked(false);
                        startDict(true);
                        setSkip(2);
                        setRefresh(true);
                        console.log("PopScreen: isPop is", isPop);
                        setPop(false);
                        RNExitApp.exitApp();
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
