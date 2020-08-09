import React, {useContext, useState} from 'react';
import { View, Text, Image, ScrollView, TextInput, Button, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../navigation/AuthProvider';
import { alarmModule } from '../utils/jvmodules';
import RNDateTimePicker from '@react-native-community/datetimepicker';

import LogoutButton from '../components/Logout';

const Stack = createStackNavigator();

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

    return (
        <View>
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

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('time');
    const [show, setShow] = useState(false);

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

    return (
        <View>
            <View>
                <RNDateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="time"
                    is24Hour={true}
                    display="spinner"
                    onChange={onChange}
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
});