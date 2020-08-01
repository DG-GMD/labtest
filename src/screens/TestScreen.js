import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {FormButton} from '../components/FormButton';
import React, { Component, useState, useEffect } from 'react';
import { TouchableHighlight, View, Text, Image, ScrollView, TextInput, StyleSheet } from 'react-native';
import database from '@react-native-firebase/database';

const Stack = createStackNavigator();

//단어 테스트 여부 질의 버튼, 다시보기 버튼
function enterTest(props){
    return (
        <FormButton buttonTitle='다시 한번 학습할래요' onPress={() => } />
        <FormButton buttonTitle='단어 테스트 볼래요' onPress={() => } />
    );

    //여기 온 클릭에서 어떻게 this.state.count를 조작할지?
}


export default class Test extends Component {
    constructor(props){
        super(props);
        this.state = { 
            count : 1 ,
            wordList : '',
            word : '',
            meaning :'',
            isWord: true
        };

        database()
        .ref('/words/day2')
        .once('value')
        .then(snapshot => {
            console.log('User data: ', snapshot.val());
            
            this.setState({
                wordList: snapshot.val(),
            });
            this.setState({
                word: this.state.wordList[this.state.count].word
            });
        });
    }
    componentDidMount(){
        
    }
    _onPressScreen(){
        //마지막 5번째 단어인지
        if(this.state.isWord != false && this.state.count == 5){
            //단어 테스트 여부 질의 버튼, 다시보기 버튼
        }

        //마지막 5번째 단어가 아니다
        else{
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
                    count: this.state.count+1,
                    word: this.state.wordList[this.state.count+1].word,
                    isWord: !this.state.isWord
                });
            }
        }
        
    }

    
    render(){
        const { count, word } = this.state;
        let lastWordButton;

        if(this.state.isWord != false && this.state.count == 5){
            lastWordButton = enterTest;
        }
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
