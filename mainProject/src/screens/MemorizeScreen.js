import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {FormButton} from '../components/FormButton';
import React, { Component, useState, useEffect } from 'react';
import { Button, TouchableHighlight, View, Text, Image, ScrollView, TextInput, StyleSheet } from 'react-native';
import database from '@react-native-firebase/database';

const Stack = createStackNavigator();




export default class Memorize extends Component {
    constructor(props){
        super(props);
        this.state = { 
            count : 1 ,
            wordList : '',
            word : '',
            meaning :'',
            isWord: true
        };

        this._setToFirstWord = this._setToFirstWord.bind(this);
        this._IsLastWord = this._IsLastWord.bind(this);

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
            this._setToFirstWord;
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

    _setToFirstWord(){
        console.log('aaa');

        
        this.setState({
            count: 1,
            isWord: true,
            word: this.state.wordList[1].word
        });
        
    }

    _IsLastWord(props){
        const count = props.count;
        const flag = props.isWord;
        if(count == 5 && flag != true){
            //단어 테스트 여부 질의 버튼, 다시보기 버튼
            return (
                <View>
                    <Button title='다시 한번 학습할래요' onPress={ () => this._setToFirstWord() } />
                    <Button title='단어 테스트 볼래요' onPress={() => this.props.navigation.navigate('Test') } />
                </View>
            );
        }
        else{
            return <View></View>;
        }
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
                            <this._IsLastWord count={this.state.count} flag={this.state.isWord}></this._IsLastWord>
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
