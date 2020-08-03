import React from 'react';
import { View, Text, Image, ScrollView, TextInput, Button } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

export default function Pop(){
    const startDict = (admit) => {
        console.log(admit);
    };

    return (  
        <View>
            <Button onPress = {startDict(true)} title ="yes" />
            <Button onPress = {startDict(false)} title ="no" />
        </View>
    );
}