import React, {Component} from 'react';
import { LogBox, View, Text, Image, ScrollView, TextInput, Button, Platform, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'

import { alarmModule } from '../utils/jvmodules';
import DateTimePicker from '@react-native-community/datetimepicker';
import database from '@react-native-firebase/database';

import RNFS from 'react-native-fs';

import LogoutButton from '../components/Logout';

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

        //let now = new Date();

        //let calcDate = new Date(now.getTime() - storageFirstLoginTime);
        this.setState({
            //howLongDate: calcDate.getDate()
            howLongDate: this.dateDiff(new Date(), new Date(Number(storageFirstLoginTime))) + 1
        });
        
        this.props.navigation.setOptions({ headerTitle: props => {return <LogoutButton restDate={this.state.howLongDate} userName={this.state.userName}/>}   });
    };

    dateDiff = (_date1, _date2) => {
        var diffDate_1 = _date1 instanceof Date ? _date1 :new Date(_date1);
        var diffDate_2 = _date2 instanceof Date ? _date2 :new Date(_date2);
     
        diffDate_1 =new Date(diffDate_1.getFullYear(), diffDate_1.getMonth()+1, diffDate_1.getDate());
        diffDate_2 =new Date(diffDate_2.getFullYear(), diffDate_2.getMonth()+1, diffDate_2.getDate());
     
        var diff = Math.abs(diffDate_2.getTime() - diffDate_1.getTime());
        diff = Math.ceil(diff / (1000 * 3600 * 24));
     
        return diff;
    }

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

                RNFS.readDir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
                .then((result) => {
                    //console.log('GOT RESULT', result);

                    var i = 0, index = 0;
                    result.forEach((element) => {
                        if(element.name.toString() === 'popTime.txt'){
                            //console.log('element', element);
                            index = i;
                        }
                        i++;
                    });

                    return Promise.all([RNFS.stat(result[index].path), result[index].path]);
                })
                .then((statResult) => {
                    //console.log('statResult', statResult);
                    if (statResult[0].isFile()) {
                        // if we have a file, read it
                        return RNFS.readFile(statResult[1], 'utf8');
                    }

                    return 'no file';
                })
                .then((contents) => {
                    // log the file contents
                    //console.log('popTime', contents);

                    //PopScreen이 표시된 시간 확인 확인
                    let popScreenTime = contents;
                    //console.log('popScreenTime: ', popScreenTime);

                    var nowDate = (new Date()).getDate();
                    var popDate = (new Date(popScreenTime - 0)).getDate();
                    //console.log('nowDate: ', nowDate)
                    //console.log('popDate: ', popDate)
                    if(popScreenTime == -1){
                        alarmModule.diaryNotification(dt.getTime().toString(), false);
                    }
                    else if(nowDate == popDate){
                        alarmModule.diaryNotification(dt.getTime().toString(), true);
                    }
                    else {
                        alarmModule.diaryNotification(dt.getTime().toString(), false);
                    }
                })
                .catch((err) => {
                    console.log(err.message, err.code);
                });

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
                    setHour: this.state.pickedHourValue,
                    setMin: this.state.pickedMinValue,
                    saveTime: new Date().toString(),
                    order: parseInt(order),
                };

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

