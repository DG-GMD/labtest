import React, {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import database from '@react-native-firebase/database';

import LogoutButton from '../components/Logout';

// LogBox.ignoreLogs(['Warning: ...']);
console.disableYellowBox = true;

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

export default class AlarmMain extends Component {
    constructor(props){
        super(props);

        this.state = {
            pickedHourValue: 0,
            pickedMinValue: 0,
            flag: false,
            testNumber: null,
        }
    };

    componentDidMount(){
        this.getData();

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

                    if(order > 0){
                        this.setState({
                            pickedHourValue: alarmData.setHour,
                            pickedMinValue: alarmData.setMin,
                            flag: true,
                        })
                    }
                })
            });
        }

        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            var prm = this.props.route.params;
            if((prm !== undefined) && !this.state.flage){
                this.setState({flag:true})
            }

            this.getData();
        });
    }

    componentWillUnmount() {
        this._unsubscribe();
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
        console.log('date1: ', _date1.toString());
        console.log('date2: ', _date2.toString());
        var diffDate_1 = _date1 instanceof Date ? _date1 :new Date(_date1);
        var diffDate_2 = _date2 instanceof Date ? _date2 :new Date(_date2);
     
        diffDate_1 =new Date(diffDate_1.getFullYear(), diffDate_1.getMonth()+1, diffDate_1.getDate());
        diffDate_2 =new Date(diffDate_2.getFullYear(), diffDate_2.getMonth()+1, diffDate_2.getDate());
     
        var diff = Math.abs(diffDate_2.getTime() - diffDate_1.getTime());
        diff = Math.ceil(diff / (1000 * 3600 * 24));
     
        return diff;
    }

    timeString = () => {
        var prm = this.props.route.params;
        var currentHour = (prm !== undefined ? prm.setHour : this.state.pickedHourValue);
        var currentMin = (prm !== undefined ? prm.setMin : this.state.pickedMinValue);

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

    render(){
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
                        // backgroundColor: 'red'
                    }}>
                        <Text style={{
                            fontSize: 18,
                            margin: 20,
                            // marginTop: 70,
                            // marginLeft: 40,
                            // padding: 20,
                            
                            textAlign: 'left',
                            // backgroundColor: 'red'
                        }}>
                            매일 단어 학습을 진행할 시간에 알람을 설정해주세요. 알람은 하루 한 번만 울립니다.
                        </Text>
                    </View>

                    <View elevation={10} style={{
                        flex: 2,
                        backgroundColor: 'white',
                        margin: 10,
                        borderRadius: 30,
                        shadowColor: "#000000",
                        shadowOpacity: 0.5,
                        shadowRadius: 2,
                        shadowOffset: {
                        height: 5,
                        width: 5
                        },
                        marginTop: 20,
                        marginBottom: 70
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
                            {this.state.flag && <Text style={{fontSize: 32}}>
                                매일 {this.timeString()}
                            </Text>}
                            {!this.state.flag && <Text style={{fontSize: 25}}>
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
                            onPress={() => this.props.navigation.navigate('AlarmSet')}
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
});

