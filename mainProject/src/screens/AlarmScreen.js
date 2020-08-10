import { AsyncStorage, View, Text, Image, ScrollView, TextInput, Button, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import React, {useContext, useEffect, useState} from 'react';

import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../navigation/AuthProvider';
import { alarmModule } from '../utils/jvmodules';
import DateTimePicker from '@react-native-community/datetimepicker';
import {ScrollPicker} from 'react-native-value-picker';
import database from '@react-native-firebase/database';

import {HOUR_DATA, MIN_DATA} from '../utils/timeData';
import LogoutButton from '../components/Logout';

import PopScreen from './PopScreen';
import { Row } from 'react-native-table-component';

const Stack = createStackNavigator();
const reference = database().ref('/users/1000/alarm');

function AlarmMain({navigation, route}) {
    navigation.setOptions({ headerTitle: props => <Text style={{fontSize:20}}>Alarm Loading...</Text> });

    async function getData() {
        const storageUserName = await AsyncStorage.getItem('user');
        const storageTestNumber = await AsyncStorage.getItem('testNumber');
        const storageFirstLoginTime = await AsyncStorage.getItem('firstLoginTime');

        // console.log("storage ", storageTestNumber, storageUserName, storageFirstLoginTime);

        let now = new Date();

        let calcDate = new Date(now.getTime() - storageFirstLoginTime);
        
        navigation.setOptions({ headerTitle: props => {return <LogoutButton restDate={calcDate.getDate()} userName={storageUserName}/>}   });
    };

    useEffect( () => {
        getData();
        // console.log('---------------in useeffect');
    });

    const [pickedHourValue, setPickedHourValue] = useState(0);
    const [pickedMinValue, setPickedMinValue] = useState(0);
    const [flag, setFlag] = useState(false);

    (function setAlarmMainTime() {
        //console.log("setAlarmMainTime");
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

                if(order > 0){
                    setPickedHourValue(alarmData.setHour);
                    setPickedMinValue(alarmData.setMin);

                    setFlag(true);
                }
            })
        }
    })();

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
            }}
        >
            <View style={{marginTop: 20}}>
                <Text style={{fontSize: 30}}>
                    단어 학습시간 알람
                </Text>
            </View>
            <View
                style={{
                    width: "80%",
                    margin: 30,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: "grey",
                }}
            >
                {flag && <Text style={{fontSize: 35}}>
                    매일 {route.params !== undefined ? route.params.setHour : pickedHourValue} : {route.params !== undefined ? route.params.setMin : pickedMinValue}
                </Text>}
                {!flag && <Text style={{fontSize: 25}}>
                    설정된 알람이 없습니다.
                </Text>}
            </View>
            <View>
                <TouchableOpacity
                    style = {styles.buttonContainer}
                    onPress={() => navigation.navigate('AlarmSet')}
                >
                    <Text>알람 설정</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

function AlarmSet({navigation}) {
    //set loading header title
    navigation.setOptions({ headerTitle: props => <Text style={{fontSize:20}}>Alarm Loading...</Text> });


    //set full header title
    async function getData() {
        const storageUserName = await AsyncStorage.getItem('user');
        const storageTestNumber = await AsyncStorage.getItem('testNumber');
        const storageFirstLoginTime = await AsyncStorage.getItem('firstLoginTime');

        // console.log("storage ", storageTestNumber, storageUserName, storageFirstLoginTime);

        let now = new Date();
        let calcDate = new Date(now.getTime() - storageFirstLoginTime);
        
        navigation.setOptions({ headerTitle: props => {return <LogoutButton restDate={calcDate.getDate()} userName={storageUserName}/>}   });
    };

    
    useEffect( () => {
        getData();
        // console.log('---------------in useeffect');
    });

    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);

    const [pickedHourValue, setPickedHourValue] = useState(0);
    const [pickedMinValue, setPickedMinValue] = useState(0);
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

                let dt = new Date();
                if(order < 1){
                    setPickedHourValue(dt.getUTCHours());
                    setPickedMinValue(dt.getUTCMinutes());
                }
                else{
                    setPickedHourValue(alarmData.setHour);
                    setPickedMinValue(alarmData.setMin);

                    dt.setUTCHours(alarmData.setHour);
                    dt.setUTCMinutes(alarmData.setMin);
                }

                setFlag(true);
                setDate(dt);
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
                        navigation.navigate('AlarmMain',{
                            setHour: pickedHourValue,
                            setMin: pickedMinValue,
                        });
                    });
            });
    };

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        
        setShow(Platform.OS === 'ios');
        setPickedHourValue(currentDate.getUTCHours());
        setPickedMinValue(currentDate.getUTCMinutes());
        setDate(currentDate);
    };

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
            }}
        >
            <View
                style={{
                    marginTop: 30,
                    flex: 1,
                    flexDirection: 'row',
                }}
            >
                {/* <View style={styles.PickerContainer}>
                    <ScrollPicker
                        currentValue={pickedHourValue}
                        list={HOUR_DATA}
                        onItemPress={setPickedHourValue}
                    />
                </View>
                <Text 
                    style = {{
                        alignSelf: 'center',
                        fontSize: 40,
                    }}
                >
                    :
                </Text>
                <View style={styles.PickerContainer}>
                    <ScrollPicker
                        currentValue={pickedMinValue}
                        list={MIN_DATA}
                        onItemPress={setPickedMinValue}
                    />
                </View> */}
                <TouchableOpacity
                    style={{
                        alignSelf: 'center',
                    }}
                    onPress={()=>setShow(true)}
                >
                    <Text
                        style = {{
                            fontSize: 60,
                        }}
                    >
                        {pickedHourValue} : {pickedMinValue}
                    </Text>
                </TouchableOpacity>
            </View>
            <View
                style={{
                    flex: 2,
                    flexDirection: 'row',
                }}
            >
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
            {show && (
                <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={onChange}
                />
            )}
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
        borderRadius: 8
    },
    PickerContainer: {
        width: 100,
        height: 170,
        marginHorizontal: 20,
        alignItems: 'center',
    },
});

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
