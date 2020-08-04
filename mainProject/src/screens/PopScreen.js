import React, { useContext } from 'react';
import { View, Text, Image, ScrollView, TextInput, Button } from 'react-native';
import { alarmModule } from '../utils/jvmodules'
import { AuthContext } from '../navigation/AuthProvider';

function startDict(admit) {
    console.log("admit", admit);
    alarmModule.startDict(admit);
}

export default function Pop(){
    const { setSkip } = useContext(AuthContext);
    return (  
        <View>
            <Button onPress = {() => {
                startDict(true);
                setSkip(true);
                }} title ="yes" />
            <Button onPress = {() => {
                startDict(false);
                setSkip(true);
                }} title ="no" />
        </View>
    );
}