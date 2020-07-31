import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import React, { Component, useState, useEffect } from 'react';
import { TouchableHighlight, View, Text, Image, ScrollView, TextInput, StyleSheet } from 'react-native';
import database from '@react-native-firebase/database';

const Stack = createStackNavigator();



export default class Test extends Component {
    constructor(props){
        super(props);
        this.state = { 
            count : 1 ,
            wordList : '',
            word : '',
            meaning :'',
            isWord: false
        };
    }
    componentDidMount(){
        database()
        .ref('/words/day1')
        .once('value')
        .then(snapshot => {
            console.log('User data: ', snapshot.val());
            
            this.setState({
                wordList: snapshot.val()
            });
        });
    }
    _onPressScreen(){
        //현재 영단어가 표기되고 있다면
        if(this.state.isWord){
            this.setState({
                word: this.state.wordList[this.state.count].meaning,
                isWord: !this.state.isWord
            });
        }

        //현재 한글 뜻이 표기되고 있다면
        else{
            this.setState({
                word: this.state.wordList[this.state.count].word,
                count: this.state.count+1,
                isWord: !this.state.isWord
            });
        }
        console.log(this.state.wordList);
    }

    
    render(){
        const { count, word } = this.state;
        return (  
            <View style={{
                flex: 1
            }}
                onStartShouldSetResponder = { (PressEvent) => this._onPressScreen() }
            >
                    <View style={styles.head}>
                        <View style={{
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                fontSize: 20
                            }}>오늘의 단어</Text>
                            <Text style={{
                                fontSize: 15
                            }}>{count}/5</Text>
                        </View>
                    </View>

                    <View style={styles.middle}>
                        <Text style={{
                            fontSize: 50,
                            textAlign: 'center'
                        }}>{word}</Text>
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
