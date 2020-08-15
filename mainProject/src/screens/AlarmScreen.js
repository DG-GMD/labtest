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

import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

const Stack = createStackNavigator();

function AlarmMain({navigation, route}) {
    const { testNumber } = useContext(AuthContext);
    const reference = database().ref('/users/' + testNumber + '/alarm');

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

    const storageTest = () => {
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
        })

        RNFS.readDir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
        .then((result) => {
            console.log('GOT RESULT', result);

            // stat the first file
            return Promise.all([RNFS.stat(result[0].path), result[0].path]);
        })
        .then((statResult) => {
            if (statResult[0].isFile()) {
            // if we have a file, read it
            return RNFS.readFile(statResult[1], 'utf8');
            }

            return 'no file';
        })
        .then((contents) => {
            // log the file contents
            console.log(contents);
        })
        .catch((err) => {
            console.log(err.message, err.code);
        });
    };

    const timeString = () => {
        var currentHour = (route.params !== undefined ? route.params.setHour : pickedHourValue);
        var currentMin = (route.params !== undefined ? route.params.setMin : pickedMinValue);

        var str = "";
        
        if(currentHour > 12)
            str += (currentHour-12).pad();
        else
            str += (currentHour).pad();
        
        str += " : "+(currentMin).pad();

        if(currentHour > 11)
            str += " PM";
        else
            str += " AM";

        return str;
    };

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
                    매일 {timeString()}
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
            {/* <Button
                title = "popScreen test"
                onPress = {() => navigation.navigate("Pop")}
            /> */}
            <Button
                title = "storage test"
                onPress = {() => storageTest()}
            />
        </View>
    );
};

function AlarmSet({navigation}) {
    const { testNumber } = useContext(AuthContext);
    const reference = database().ref('/users/' + testNumber + '/alarm');

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
                    setPickedHourValue(dt.getHours());
                    setPickedMinValue(dt.getMinutes());
                }
                else{
                    setPickedHourValue(alarmData.setHour);
                    setPickedMinValue(alarmData.setMin);

                    dt.setHours(alarmData.setHour);
                    dt.setMinutes(alarmData.setMin);
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
                    saveTime: new Date().toString(),
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
        setPickedHourValue(currentDate.getHours());
        setPickedMinValue(currentDate.getMinutes());
        setDate(currentDate);
    };

    const timeString = () => {
        var currentHour = pickedHourValue;
        var currentMin = pickedMinValue;

        var str = "";
        
        if(currentHour > 12)
            str += (currentHour-12).pad();
        else
            str += (currentHour).pad();
        
        str += " : "+(currentMin).pad();

        if(currentHour > 11)
            str += " PM";
        else
            str += " AM";

        return str;
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
                        {timeString()}
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
                is24Hour={false}
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
        {/* <Stack.Screen name="Pop" component={PopScreen} /> */}
    </Stack.Navigator>
    );
}
