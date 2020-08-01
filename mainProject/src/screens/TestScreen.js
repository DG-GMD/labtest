import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {FormButton} from '../components/FormButton';
import React, { Component, useState, useEffect } from 'react';
import { TouchableHighlight, View, Text, Image, ScrollView, TextInput, StyleSheet } from 'react-native';
import database from '@react-native-firebase/database';

const Stack = createStackNavigator();




export default class Test extends Component {
    render(){
        return(
            <View>
                
            </View>
        );
    }
}

const styles = StyleSheet.create({
    head:{
        flex: 1,
        backgroundColor: 'powderblue',
        justifyContent: 'center'
    },
    middle:{
        flex: 2,
        backgroundColor: 'skyblue',
        justifyContent: 'center'
    },
    end:{
        flex: 2,
        flexDirection: 'column',
        backgroundColor: 'steelblue'
    },
    bottom:{
        flex: 1,
    }
});
