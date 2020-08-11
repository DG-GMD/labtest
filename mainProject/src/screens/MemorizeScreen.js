import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {FormButton} from '../components/FormButton';
import React, { Component, useState, useEffect } from 'react';
import { AsyncStorage, Button, TouchableHighlight, View, Text, Image, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import database from '@react-native-firebase/database';


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
            isPop: false
        };


        this._setToFirstWord = this._setToFirstWord.bind(this);
        this._IsLastWord = this._IsLastWord.bind(this);
        this._BottomText = this._BottomText.bind(this);
        this.getData = this.getData.bind(this);
        this.MemorizeRouter = this.MemorizeRouter.bind(this);
        this.IsTestStart = this.IsTestStart.bind(this);
        getDB();

        IsTestStart();

        database()
        .ref('/words/day2')
        .once('value')
        .then(snapshot => {
            // console.log('User data: ', snapshot.val());
            this.setState({
                wordList: snapshot.val(),
            });
            this.setState({
                word: this.state.wordList[this.state.count].word
            });
        });

        this.props.navigation.setOptions({ headerTitle: props => <Text style={{fontSize:20}}>Test Loading...</Text> });
        //writeTestState('before test');
    }
    componentDidMount(){
        this.getData();
        // console.log('---------------in didmout');
      }
    
    IsTestStart(){
        (async () => {
            //PopScreen이 표시된 시간 확인 확인
            let popScreenTime = getPopScreenTime();

            //firstLoginTime 가져오기
            let firstLoginTime = await AsyncStorage.getItem('firstLoginTime');
            
            //현재 D+Date 구하기
            let now = new Date();
            let dDate = new Date(now.getTime() - firstLoginTime);
            
            //PopScreen이 마지막으로 표시된 D+Date
            let popDate = new Date(popScreenTime - firstLoginTime);

            //PopScreen이 뜬 날짜와 현재 날짜가 동일하다면
            if(dDate.getDate() == popDate.getDate()){
                //반드시 PopScreen이 오늘 떴던 것이므로 시험 시작 가능
                this.setState({
                    isPop: true
                });
            }
            //PopScreen이 뜬 날짜와 현재 날짜가 다르다면
            else{
                //PopScreen이 오늘 아직 뜨지 않았다.
                //= 아직 시험을 시작하면 안된다
                this.setState({
                    isPop: false
                });
            }
        })();
    }

    //로컬 저장소의 기존 로그인 정보들로 header title 수정
    getData = async () => {
        
        const storageUserName = await AsyncStorage.getItem('user');
        const storageTestNumber = await AsyncStorage.getItem('testNumber');
        const storageFirstLoginTime = await AsyncStorage.getItem('firstLoginTime');

        this.setState({
            userName: storageUserName,
            userTestNumber: storageTestNumber
        });

        // console.log("storage ", storageTestNumber, storageUserName, storageFirstLoginTime);

        let now = new Date();

        let calcDate = new Date(now.getTime() - storageFirstLoginTime);
        this.setState({
            howLongDate: calcDate.getDate()
        });
        
        this.props.navigation.setOptions({ headerTitle: props => {return <LogoutButton restDate={this.state.howLongDate} userName={this.state.userName}/>}   });
    

        // database()
        // .ref('/users/' + storageTestNumber)
        // .once('value')
        // .then(snapshot => {
        //     console.log("snapshot ", snapshot.val());
        //     this.setState({
        //     userDB: snapshot.val(),

        //     });
        //     return snapshot.val().startDate.millitime;
        // })
        // .then( (milliTime) => {        
        //     console.log('time : ', milliTime);

        //     let now = new Date();

        //     let calcDate = new Date(now.getTime() - milliTime);
        //     this.setState({
        //     howLongDate: calcDate.getDate()
        //     });
            
        // })
        // .then( () => {
        //     this.props.navigation.setOptions({ headerTitle: props => {return <LogoutButton restDate={this.state.howLongDate} userName={this.state.userName}/>}   });
        // });
    };

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
                        <Text style={styles.buttonText}>다시 한번 학습할래요</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonContainer} onPress={ () => { 
                        this.props.navigation.navigate('Test');
                        writeTestStateTesting(); 
                        
                    }} >
                        <Text style={styles.buttonText}>단어 테스트 볼래요</Text>
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
                color: 'dimgray',
                margin: 20
            }}>{bottomText}</Text>
        );
    }

    MemorizeRouter(){
        //알람이 울리지않았다면
        if(!this.state.isPop){
            return(
                <View style={{
                    flex: 1,
                    backgroundColor: 'white',
                    padding: 10
                    }}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20
                    }}>
                        <Text style={{
                            textAlign: 'center',
                            fontSize: 24
                        }}>
                            알람이 울리지 않아 단어 시험을 시작할 수 없습니다.
                        </Text>
                    </View>
                </View>
            );
        }
        //알람이 울렸다면
        else{
            const { count, word } = this.state;
            return(
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
                            fontSize: 40,
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
    
    render(){
        return (  
            <this.MemorizeRouter />
        );
    }
}

//popscreen이 떴는지 확인
async function getPopScreenTime(){
    let item;
    try{
        isPop = await AsyncStorage.getItem('popTime');
    }
    catch(e){
        console.log('fail to get popTime at MemorizeScreen', e);
    }
    return item;
}

function writeTestStateTesting(){
    (async () => {
        try{
            await AsyncStorage.setItem('day1', "testing");
            
            // console.log("check day1 as testing");
        }
        catch(e){
            
            // console.log("ddd fail to check day1 as testing", e);

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
        height: 60,
        backgroundColor: 'lightgreen',
        padding: 10,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
      },
    buttonText:{
        fontSize: 18
    }
});
