import React, {useContext, useEffect, useState} from 'react';
import { AsyncStorage, View, Text, Image, ScrollView, TextInput, Button, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../navigation/AuthProvider';
import { alarmModule } from '../utils/jvmodules';
import DateTimePicker from '@react-native-community/datetimepicker';

import LogoutButton from '../components/Logout';

import database from '@react-native-firebase/database';

const Stack = createStackNavigator();

function AlarmMain({navigation}) {
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('time');
    const [show, setShow] = useState(false);

    //navigation.setOptions({ headerTitle: props => <LogoutButton /> });
    const onChange = (event, selectedDate) => {
        setShow(false);

        const currentDate = selectedDate || date;
        console.log(currentDate);
        setDate(currentDate);
    };

    const showMode = currentMode => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date');
    };

    const showTimepicker = () => {
        showMode('time');
    };

    const saveAlarm = () => {
        console.log(date.toISOString());
        alarmModule.diaryNotification(date.toISOString());
    };

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

    return (
        <View>
            <View>
                <Button onPress={showTimepicker} title = "알람시간 선택" />
            </View>
            <View>
                <Button onPress={saveAlarm} title = "저장" />
            </View>
            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={mode}
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                />
            )}
        </View>
    );
};

function AlarmSet({navigation}) {
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
    return (
        <ScrollView>
            <Text>Some text</Text>
            <View>
            <Text>Some more text</Text>
            <Image
            source={{
            uri: 'https://reactnative.dev/docs/assets/p_cat2.png',
            }}
            style={{ width: 200, height: 200 }}
            />
            </View>
            <TextInput
            style={{
            height: 40,
            borderColor: 'gray',
            borderWidth: 1
            }}
            defaultValue="You can type in me"
            />
        </ScrollView>
    );
}

export default function Alarm({navigation}){
    const { user, logout } = useContext(AuthContext); 

    return (  
    <Stack.Navigator>
        <Stack.Screen name="AlarmMain" component={AlarmMain} />
        <Stack.Screen name="AlarmSet" component={AlarmSet} />
    </Stack.Navigator>
    );
}