import { LogBox, AsyncStorage, View, Text, Image, ScrollView, TextInput, Button, Platform, StyleSheet, TouchableOpacity } from 'react-native';
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

// LogBox.ignoreLogs(['Warning: ...']);
console.disableYellowBox = true;

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

    getData();

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
                backgroundColor: '#EFEFEF'
            }}
        >
            {/* 시간 표시 */}
            <View style={{
                flex: 4,
                backgroundColor: '#8EE4AF',
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomLeftRadius: 40
            }}>
                <View style={{
                    flex: 1,
                    marginTop: 20,
                    justifyContent: 'center',
                }}>
                    <Text style={{
                        fontSize: 25,
                        margin: 20,
                        textAlign: 'center'
                    }}>
                        단어 학습시간 알람
                    </Text>
                </View>

                <View elevation={10} style={{
                    flex: 2,
                    backgroundColor: 'white',
                    margin: 10,
                    borderRadius: 30,
                    shadowColor: "#000000",
                    shadowOpacity: 0.9,
                    shadowRadius: 2,
                    shadowOffset: {
                    height: 10,
                    width: 10
                    },
                    marginTop: 70,
                    marginBottom: 50
                }}>
                    <View style={{
                        flex: 1,
                        backgroundColor: '#659DBD',
                        borderTopLeftRadius: 30,
                        borderTopRightRadius: 30,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            fontSize: 18,
                            color: 'white'
                        }}>
                            설정된 알람 시간
                        </Text>
                    </View>
                    <View
                        style={{
                            flex: 2,
                            margin: 20,
                            
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {flag && <Text style={{fontSize: 32}}>
                            매일 {timeString()}
                        </Text>}
                        {!flag && <Text style={{fontSize: 25}}>
                            설정된 알람이 없습니다.
                        </Text>}
                    </View>
                </View>
                
                {/* <Button
                title = "storage test"
                onPress = {() => storageTest()}
                /> */}
            </View>

            {/* 하단 버튼 */}
            <View style={{
                flex:1,
                backgroundColor: '#8EE4AF'
            }}>
                <View elevation={10} style={{
                    flex: 1,
                    // borderTopLeftRadius: 30,
                    borderTopRightRadius: 40,
                    backgroundColor: '#EFEFEF',
                    shadowColor: "#000000",
                    shadowOpacity: 0.9,
                    shadowRadius: 2,
                    shadowOffset: {
                    height: 10,
                    width: 10
                    },
                    justifyContent: 'center',
                    alignItems: 'center'
                }}> 
                    <TouchableOpacity
                        style = {styles.buttonContainer}
                        onPress={() => navigation.navigate('AlarmSet')}
                    >
                        <Text style={{fontSize:20}}>알람 설정</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* <Button
                title = "popScreen test"
                onPress = {() => navigation.navigate("Pop")}
            /> */}
            
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

    getData();
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

                alarmModule.diaryNotification(dt.getTime().toString());

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
                width:'100%',
                flex: 1,
                alignItems: 'center',
                backgroundColor: 'rgba(142,228,175,0.3)',
            }}
        >
            <View style={{
                flex: 1,
                width: '100%',
                backgroundColor: '#8EE4AF',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text style={{
                    padding: 15,
                    fontSize: 16
                }}>
                    하단의 시간을 터치하여 설정을 시작해주세요.
                </Text>
            </View>
            <View
                style={{
                    width: '100%',
                    flex: 3,
                    flexDirection: 'row',
                    backgroundColor: 'rgba(142,228,175,0.1)',
                    justifyContent: 'center',
                    alignItems: 'center'
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
                    width: '100%',
                    flexDirection: 'row',
                    padding: 20,
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    backgroundColor: '#EFEFEF',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <TouchableOpacity
                    style = {styles.setbuttonContainer}
                    onPress={() => navigation.navigate('AlarmMain')}
                >
                    <Text style={{fontSize:20}}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style = {styles.setbuttonContainer}
                    onPress={() => saveAlarm()}
                >
                    <Text style={{fontSize:20}}>저장</Text>
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
        width: "50%",
        height: 60,
        backgroundColor: '#8EE4AF',
        padding: 10,
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,

        elevation: 5,
    },
    setbuttonContainer: {
        marginTop: 10,
        width: "35%",
        height: 50,
        backgroundColor: '#8EE4AF',
        padding: 10,
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,

        elevation: 5,
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
