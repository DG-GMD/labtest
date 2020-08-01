import React, {useContext, useState} from 'react';
import { View, Text, Image, ScrollView, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../navigation/AuthProvider';

const Stack = createStackNavigator();

function AlarmMain() {
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

function AlarmSet() {
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

export default function Alarm(){
    const { user, logout } = useContext(AuthContext); 
    return (  
    <Stack.Navigator>
        <Stack.Screen name="AlarmMain" component={AlarmMain} />
        <Stack.Screen name="AlarmSet" component={AlarmSet} />
    </Stack.Navigator>
    );
}