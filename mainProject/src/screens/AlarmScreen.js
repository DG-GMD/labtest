import { AsyncStorage, View, Text, Image, ScrollView, TextInput, Button, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import React, {useContext, useEffect, useState} from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../navigation/AuthProvider';
import { alarmModule } from '../utils/jvmodules';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {ScrollPicker} from 'react-native-value-picker';
import database from '@react-native-firebase/database';

import {HOUR_DATA, MIN_DATA} from '../utils/timeData';
import LogoutButton from '../components/Logout';


const Stack = createStackNavigator();
const reference = database().ref('/users/1000/alarm');

export default function Alarm({navigation}){
    const { user, logout } = useContext(AuthContext); 

    //navigation.setOptions({ title: 'D-00 안녕하세요 000님' });

    return (  
    <Stack.Navigator>
        <Stack.Screen name="AlarmMain" component={AlarmMain} />
        <Stack.Screen name="AlarmSet" component={AlarmSet} />
    </Stack.Navigator>
    );
}

function AlarmMain({navigation}) {
    navigation.setOptions({ headerTitle: props => <LogoutButton /> });

    const [userName, setUserName] = useState();
    const [userTestNumber, setTestNumber] = useState();

    navigation.setOptions({ headerTitle: props => <Text style={{fontSize:20}}>Alarm Loading...</Text> });

    async function getData() {
        const storageUserName = await AsyncStorage.getItem('user');
        
        const storageTestNumber = await AsyncStorage.getItem('testNumber');
        console.log("storage ", storageTestNumber, storageUserName);

        
        setUserName(storageUserName);
        setTestNumber(storageTestNumber);
        
        database()
        .ref('/users/' + storageTestNumber)
        .once('value')
        .then(snapshot => {
            console.log("snapshot ", snapshot.val());
            
            return snapshot.val().startDate.millitime;
        })
        .then( (milliTime) => {        
            console.log('time : ', milliTime);

            let now = new Date();

            let calcDate = new Date(now.getTime() - milliTime);
            
            return calcDate.getDate()
        })
        .then( (mililTime) => {
            navigation.setOptions({ headerTitle: props => {return <LogoutButton restDate={mililTime} userName={userName}/>}   });
        });
    };

    useEffect( () => {
        getData();
        console.log('---------------in useeffect');
    });

    return (
        <View>
            <View>
                
            </View>
            <View>
                <TouchableOpacity
                    style = {styles.buttonContainer}
                    onPress={() => navigation.navigate('AlarmSet')}
                >
                    <Text>설정</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

function AlarmSet({navigation}) {
    navigation.setOptions({ headerTitle: props => <LogoutButton /> });

    const [userName, setUserName] = useState();
    const [userTestNumber, setTestNumber] = useState();

    async function getData() {
        const storageUserName = await AsyncStorage.getItem('user');
        
        const storageTestNumber = await AsyncStorage.getItem('testNumber');
        console.log("storage ", storageTestNumber, storageUserName);

        
        setUserName(storageUserName);
        setTestNumber(storageTestNumber);
        
        database()
        .ref('/users/' + storageTestNumber)
        .once('value')
        .then(snapshot => {
            console.log("snapshot ", snapshot.val());
            
            return snapshot.val().startDate.millitime;
        })
        .then( (milliTime) => {        
            console.log('time : ', milliTime);

            let now = new Date();

            let calcDate = new Date(now.getTime() - milliTime);
            
            return calcDate.getDate()
        })
        .then( (mililTime) => {
            navigation.setOptions({ headerTitle: props => {return <LogoutButton restDate={mililTime} userName={userName}/>}   });
        });
    };

    useEffect( () => {
        getData();
        console.log('---------------in useeffect');
    });

    const [pickedHourValue, setPickedHourValue] = useState(5);
    const [pickedMinValue, setPickedMinValue] = useState(5);
    const [flag, setFlag] = useState(false);

    (function setAlarmTime() {
        if(!flag){
            reference
            .orderByChild('order')
            .limitToLast(1)
            .once('value')
            .then(snapshot => {
                let alarmDataJson = snapshot.val();
                let alarmData = {};

                for(let key in alarmDataJson){
                    alarmData = alarmDataJson[key];
                }

                let order = parseInt(alarmData.order);

                if(order < 1){
                    const dt = new Date();
                    setPickedHourValue(dt.getUTCHours());
                    setPickedMinValue(dt.getUTCMinutes());
                }
                else{
                    setPickedHourValue(alarmData.setHour);
                    setPickedMinValue(alarmData.setMin);
                }

                setFlag(true);
            })
        }
    })();

    const saveAlarm = () => {
        reference
            .orderByChild('order')
            .limitToLast(1)
            .once('value')
            .then(snapshot => {
                const dt = new Date();
                dt.setHours(pickedHourValue);
                dt.setMinutes(pickedMinValue);

                console.log("alarm ISO time is ", dt.toISOString());
                alarmModule.diaryNotification(dt.toISOString());

                let alarmDataJson = snapshot.val();
                let alarmData = {};

                for(let key in alarmDataJson){
                    alarmData = alarmDataJson[key];
                }

                let order = parseInt(alarmData.order);
                order += 1;
                order = order.toString();

                var json = {};
                json[order] = {
                    setHour: pickedHourValue,
                    setMin: pickedMinValue,
                    saveTime: new Date().toUTCString(),
                    order: parseInt(order),
                };

                reference
                    .update(json)
                    .then(() => {
                        console.log("alarm saved");
                        navigation.navigate('AlarmMain');
                    });
            });
    };

    return (
        <View>
            <View style={styles.PickerContainer}>
                <ScrollPicker
                currentValue={pickedHourValue}
                extraData={pickedHourValue}
                list={HOUR_DATA}
                onItemPress={setPickedHourValue}
                />
            </View>
            <View style={styles.PickerContainer}>
                <ScrollPicker
                currentValue={pickedMinValue}
                extraData={pickedMinValue}
                list={MIN_DATA}
                onItemPress={setPickedMinValue}
                />
            </View>
            <View>
                <TouchableOpacity
                    style = {styles.buttonContainer}
                    onPress={() => navigation.navigate('AlarmMain')}
                >
                    <Text>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style = {styles.buttonContainer}
                    onPress={() => saveAlarm()}
                >
                    <Text>저장</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 10,
        width: 200,
        height: 60,
        backgroundColor: 'lightgreen',
        padding: 10,
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
    },
    PickerContainer: {
        height: 120,
        width: 100,
        alignItems: 'center',
        marginTop: 50,
    },
});
