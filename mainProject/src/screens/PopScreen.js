import React, { useContext, useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, Button, BackHandler, StyleSheet, Platform, TouchableOpacity} from 'react-native';
import { alarmModule } from '../utils/jvmodules';
import { AuthContext } from '../navigation/AuthProvider';
import RNExitApp from 'react-native-exit-app';

import AsyncStorage from '@react-native-community/async-storage'

import { Player } from '@react-native-community/audio-toolkit';

async function savePopTime(){
    //popScreen이 표시된 시간을 로컬 저장소에 저장
    
    let now = new Date();
    try{
        await AsyncStorage.setItem('popTime', now.getTime().toString());
    }
    catch(e){
        console.log('fail to save poptime ', e);
    }
    
}

export default function Pop({navigation}){
    const { setSkip } = useContext(AuthContext);
    const [refresh, setRefresh] = useState(false);
    const [isPlay, setIsPlay] = useState(false);
    const [ audioPlayer ] = useState(new Player('alarm.mp3'));

    navigation.setOptions({ headerTitle: props => {return <Text>Lab Test</Text>}});

    if(Platform.OS === 'ios'){
        if(!isPlay){
            audioPlayer.play();
            setIsPlay(true);
        }
    }

    const startDict = (admit) => {
        console.log("admit", admit);
        if(Platform.OS === 'android')
            alarmModule.startDict(admit);
        else if(Platform.OS === 'ios'){
            if(isPlay){
                audioPlayer.destroy();
            }
            
            (async () => {
                await AsyncStorage.setItem('isAlarm', "false");
            })().then(()=>{
                setRefresh(true);
            });
        }
    }
    
    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
            }}
        >
            <View style={{margin: 20, flex:1, flexDirection: 'row'}}>
                <Text style={{fontSize: 25, alignSelf:'center'}}>
                    단어테스트를 보시겠습니까?
                </Text>
            </View>
            <View style={{
                flex:1,
                flexDirection: 'row',
                }}>
                <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress = {() => {
                        savePopTime();
                        startDict(true);
                        setSkip(2);
                    }} 
                >
                    <Text>
                        예
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress = {() => {
                        savePopTime();
                        startDict(false);
                        RNExitApp.exitApp();
                        BackHandler.exitApp();
                    }} 
                >
                    <Text>
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
        width: 80,
        height: 40,
        backgroundColor: 'lightgreen',
        padding: 10,
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    PickerContainer: {
        width: 100,
        height: 170,
        marginHorizontal: 20,
        alignItems: 'center',
    },
});
