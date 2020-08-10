import React, { useContext } from 'react';
import { View, Text, Image, ScrollView, TextInput, Button, BackHandler } from 'react-native';
import { alarmModule } from '../utils/jvmodules'
import { AuthContext } from '../navigation/AuthProvider';

function startDict(admit) {
    console.log("admit", admit);
    alarmModule.startDict(admit);
}

export default function Pop({navigation}){
    const { setSkip } = useContext(AuthContext);
    return (
        <View>
            <View>
                <Text>
                    단어테스트를 보시겠습니까?
                </Text>
            </View>
            <View>
                <Button onPress = {() => {
                    startDict(true);
                    setSkip(2);
                    }} title ="yes" />
                <Button onPress = {() => {
                    startDict(false);
                    BackHandler.exitApp();
                    }} title ="no" />
            </View>
        </View>
    );
}