import React, {Component} from 'react';
import { NativeModules, LogBox, View, Text, Image, ScrollView, TextInput, Button, Platform, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'

// import { alarmModule } from '../utils/jvmodules';
import DateTimePicker from '@react-native-community/datetimepicker';
import database from '@react-native-firebase/database';

import LogoutButton from '../components/Logout';
import NotifService from '../utils/NotifService';

import PushNotificationIOS from "@react-native-community/push-notification-ios";

import swiftAlarmModule from '../utils/swiftModule';

// LogBox.ignoreLogs(['Warning: ...']);
console.disableYellowBox = true;

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}



export default class AlarmSet extends Component {
    constructor(props){
        super(props);

        this.state = {
            date: new Date(),
            show: Platform.OS === 'ios',

            pickedHourValue: 0,
            pickedMinValue: 0,
            flag: false,
            testNumber: null,
        };

        this.notif = new NotifService(
            this.onRegister.bind(this),
            this.onNotif.bind(this),
        );
    }

    componentDidMount(){
        // this.getData();

        if(!this.state.flag){
            (async () => {
                let testNumber = await AsyncStorage.getItem('testNumber');
                return testNumber;
            })()
            .then((testNumber) => {
                this.setState({
                    testNumber: testNumber
                });
                
                database()
                .ref('/users/' + testNumber.toString() + '/alarm')
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
                    let hour = 0, min = 0;

                    if(order < 1){
                        hour = dt.getHours();
                        min = dt.getMinutes();
                    }
                    else{
                        hour = alarmData.setHour;
                        min = alarmData.setMin;

                        dt.setHours(alarmData.setHour);
                        dt.setMinutes(alarmData.setMin);
                    }

                    this.setState({
                        pickedHourValue: hour,
                        pickedMinValue: min,
                        flag: true,
                        date: dt,
                    });
                })
            });
        }
    }

    //헤더 수정 함수
    getData = async () => {
        const storageUserName = await AsyncStorage.getItem('user');
        const storageTestNumber = await AsyncStorage.getItem('testNumber');
        const storageFirstLoginTime = await AsyncStorage.getItem('firstLoginTime');

        this.setState({
            userName: storageUserName,
            userTestNumber: storageTestNumber
        });

        // console.log("storage ", storageTestNumber, storageUserName, storageFirstLoginTime);

        let now = new Date();

        let calcDate = new Date(now.getTime() - storageFirstLoginTime);
        this.setState({
            howLongDate: calcDate.getDate()
        });
        
        this.props.navigation.setOptions({ headerTitle: props => {return <LogoutButton restDate={this.state.howLongDate} userName={this.state.userName}/>}   });
    };

    saveAlarm = () => {
        database()
            .ref('/users/' + this.state.testNumber + '/alarm')
            .orderByChild('order')
            .limitToLast(1)
            .once('value')
            .then(snapshot => {
                const dt = new Date();
                dt.setHours(this.state.pickedHourValue);
                dt.setMinutes(this.state.pickedMinValue);

                // alarmModule.diaryNotification(dt.getTime().toString());

                this.notif.cancelNotif();
                this.notif.cancelAll();
                
                //date picker에 있는 시간 추출
                var pickerDate = new Date();
                pickerDate.setHours(this.state.pickedHourValue);
                pickerDate.setMinutes(this.state.pickedMinValue);

                console.log("now!!!!", pickerDate);

                //testNumber로 알람 소리 설정
                let soundName;
                //본인 목소리
                if(parseInt(this.state.testNumber/1000) == 1){
                    soundName = "Self-voice.aiff";
                }
                //컴퓨터 목소리
                else if(parseInt(this.state.testNumber/1000) == 2){
                    soundName = "other-voice.mp3";
                }
                //알람 벨
                else if(parseInt(this.state.testNumber/1000) == 3){
                    soundName = "Alarm-bell.aiff";
                }

                console.log('sound name is ', soundName);
                //date piker에 있는 시간으로 notification 설정
                this.notif.scheduleNotif(pickerDate, soundName);
                
                //pop init notification 
                //this.notif.popInitialNotification();
               
                // this.notif.getScheduledLocalNotifications((data)=>{
                //     console.log(data);
                // });

                //background alarm sound 설정
                // const swiftAlarmModule = NativeModules.swiftAlarmModule;
                
                swiftAlarmModule.setAlarmTime(this.state.pickedHourValue, this.state.pickedMinValue);

                //DB정보를 저장
                let alarmDataJson = snapshot.val();
                let alarmData = {};

                //key를 저장
                for(let key in alarmDataJson){
                    alarmData = alarmDataJson[key];
                }

                //order를 가져와 새로운 order 값 계산
                let order = parseInt(alarmData.order);
                order += 1;
                order = order.toString();

                //db에 넣을 데이터 생성
                var json = {};
                json[order] = {
                    setHour: this.state.pickedHourValue,
                    setMin: this.state.pickedMinValue,
                    saveTime: new Date().toString(),
                    order: parseInt(order),
                };

                //db에 json data upload
                database()
                    .ref('/users/' + this.state.testNumber + '/alarm')
                    .update(json)
                    .then(() => {
                        console.log("alarm saved");
                        this.props.navigation.navigate('AlarmMain',{
                            setHour: this.state.pickedHourValue,
                            setMin: this.state.pickedMinValue,
                        });
                    });
            });
    };

    timeString = () => {
        var currentHour = this.state.pickedHourValue;
        var currentMin = this.state.pickedMinValue;

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

    onChange = (event, selectedDate) => {
        const currentDate = selectedDate || this.state.date;

        this.setState({
            show: Platform.OS === 'ios',
            pickedHourValue: currentDate.getHours(),
            pickedMinValue: currentDate.getMinutes(),
            date: currentDate,
        });
    };

    render(){
        return (
            <View
                style={{
                    width:'100%',
                    flex: 1,
                    alignItems: 'center',
                    backgroundColor: 'rgba(142,228,175,0.3)',
                }}
            >
                {Platform.OS === 'android' && (
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
                )}

                {Platform.OS === 'android' && (
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
                    
                    <TouchableOpacity
                        style={{
                            alignSelf: 'center',
                        }}
                        onPress={() => this.setState({show: true})}
                    >
                        <Text
                            style = {{
                                fontSize: 60,
                            }}
                        >
                            {this.timeString()}
                        </Text>
                    </TouchableOpacity>
                </View>
                )}
                
                {this.state.show && (
                    <View
                        style={{
                            width: '100%',
                            flex:4,
                            backgroundColor: 'rgba(142,228,175,0.1)',
                            justifyContent: 'center',
                        }}
                    >
                        <DateTimePicker
                        testID="dateTimePicker"
                        value={this.state.date}
                        mode="time"
                        is24Hour={false}
                        display="spinner"
                        onChange={this.onChange}
                        />
                    </View>
                )}
                
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
                        onPress={() => this.props.navigation.navigate('AlarmMain')}
                    >
                        <Text style={{fontSize:20}}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style = {styles.setbuttonContainer}
                        onPress={() => this.saveAlarm()}
                    >
                        <Text style={{fontSize:20}}>저장</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    onRegister(token) {
        this.setState({registerToken: token.token, fcmRegistered: true});
    }

    onNotif(notif) {
        //console.log('onNotif ', notif);
        
    }
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
});

