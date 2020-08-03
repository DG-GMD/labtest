import React from 'react';
import { View, Text, Image, ScrollView, TextInput, Button } from 'react-native';
import { AuthProvider } from '../navigation/AuthProvider';
import Routes from '../navigation/Routes';
import { alarmModule } from '../utils/jvmodules'

function startDict(admit) {
    console.log("admit", admit);
    alarmModule.startDict(admit);

    return (
        <AuthProvider>
            <Routes />
        </AuthProvider>
    );
}

export default function Pop(){

    return (  
        <View>
            <Button onPress = {() => startDict(true)} title ="yes" />
            <Button onPress = {() => startDict(false)} title ="no" />
        </View>
    );
}