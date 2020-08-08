import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {FormButton} from '../components/FormButton';
import React, { Component, useState, useEffect } from 'react';
import { AsyncStorage, Button, TouchableHighlight, View, Text, Image, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import database from '@react-native-firebase/database';

import writeTestState from '../navigation/TestStack';

import LogoutButton from '../components/Logout';

const Stack = createStackNavigator();

let dbList;

function getDB(){
    return async () => await database()
        .ref('/words/day2')
        .once('value')
        .then(snapshot => {
            dbList = getDB();
            return snapshot.val();
        });
}


console.log('===========');
console.log(dbList);

export default class Memorize extends Component {
    constructor(props){
        super(props);
        
        this.state = { 
            count : 1 ,
            wordList : '',
            word : '',
            meaning :'',
            isWord: true,
            tochange: true,
        };


        this._setToFirstWord = this._setToFirstWord.bind(this);
        this._IsLastWord = this._IsLastWord.bind(this);
        this._BottomText = this._BottomText.bind(this);
        getDB();

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

        this.props.navigation.setOptions({ headerTitle: props => <LogoutButton /> });
        //writeTestState('before test');
    }
    componentDidMount(){
        
    }
    _onPressScreen(){
        //마지막 5번째 단어인지
        if(this.state.isWord == false && this.state.count == 5){
            //this._setToFirstWord;
        }

        //마지막 5번째 단어가 아니다
        else{
            //현재 영단어가 표기되고 있다면
            if(this.state.isWord){
                this.setState({
                    word: this.state.wordList[this.state.count].meaning,
                    isWord: false
                });
            }

            //현재 한글 뜻이 표기되고 있다면
            else{
                this.setState({
                    count: this.state.count+1,
                    word: this.state.wordList[this.state.count+1].word,
                    isWord: true
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
        const count = this.state.count;
        const flag = this.state.isWord;

        if(count == 5 && flag == false){
            //단어 테스트 여부 질의 버튼, 다시보기 버튼
            return (
                <View style={{justifyContent: 'center', flexDirection: 'row'}}>
                    <TouchableOpacity style={styles.buttonContainer} onPress={ () => this._setToFirstWord() } >
                        <Text>다시 한번 학습할래요</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonContainer} onPress={ () => { 
                        this.props.navigation.navigate('Test');
                        writeTestStateTesting(); 
                        
                    }} >
                        <Text>단어 테스트 볼래요</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        else{
            return <View></View>;
        }
    }

    //화면 하단 문구 DOM
    _BottomText(props){
        let bottomText = '';
        const flag =  this.state.isWord;
        //5번째 단어
        if(this.state.count == 5 && !flag){
            bottomText = '“단어학습이 완료되었습니다. 다시 한 번 학습하기 또는 단어테스트 보기 중 선택해주세요.';
            
        }
        //1~4번째 영단어
        else if(flag){
            bottomText = '화면을 탭하면 단어의 뜻이 나타납니다.';
        }
        //1~4번째 영단어의 한글 뜻
        else {
            bottomText = '화면을 탭하면 다음 영단어가 나타납니다.';
        }
        return(
            <Text style={{
                fontSize: 20,
                textAlign: 'center',
                color: 'dimgray'
            }}>{bottomText}</Text>
        );
    }

    
    render(){
        const { count, word } = this.state;

        
        return (  
            <View style={{
                flex: 1,
                backgroundColor: 'white',
                padding: 10
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
                            
                            justifyContent: 'center'
                        }}>
                            <this._BottomText />
                            <this._IsLastWord count={this.state.count} flag={this.state.isWord}></this._IsLastWord>
                        </View>

                        
                    
                    </View>
                    
            </View>
        );
    }
}
function writeTestStateTesting(){
    (async () => {
        try{
            await AsyncStorage.setItem('day1', "testing");
            
            console.log("check day1 as testing");
        }
        catch(e){
            
            console.log("ddd fail to check day1 as testing", e);

        }
    })();
}


const styles = StyleSheet.create({
    head:{
        flex: 1,
        
        justifyContent: 'center'
    },
    middle:{
        flex: 1,
        
        justifyContent: 'center'
    },
    end:{
        flex: 2,
        flexDirection: 'column',
        
    },
    bottom:{
        flex: 1,
    },
    buttonContainer: {
        marginTop: 10,
        width: 180,
        height: 50,
        backgroundColor: 'lightgreen',
        padding: 10,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
      },
});
