import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import * as React from 'react';
import { View, Text, Image, ScrollView, TextInput, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

export default function Test() {
    return (  
        <View style={{
            flex: 1
        }}>
            <View style={styles.head}>
                <View style={{
                    alignItems: 'center'
                }}>
                    <Text style={{
                        fontSize: 20
                    }}>오늘의 단어</Text>
                    <Text style={{
                        fontSize: 15
                    }}>1/5</Text>
                </View>
            </View>

            <View style={styles.middle}>
                <Text style={{
                    fontSize: 50,
                    textAlign: 'center'
                }}>Hello</Text>
            </View>

            
            <View style={styles.end}>
                
                <View style={{
                    flex: 1,
                    backgroundColor: 'green',
                    justifyContent: 'center'
                }}>
                    <Text style={{
                        fontSize: 25,
                        textAlign: 'center',
                    }}>화면을 탭하면 단어의 뜻이 나타납니다.</Text>
                </View>

                
                
            </View>
            <View style={styles.bottom}>
                <Image style={{
                    alignItems: 'flex-end'
                }}
                    source={require('../../img/logo.png')}
                />
            </View>
        </View>
    );
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
