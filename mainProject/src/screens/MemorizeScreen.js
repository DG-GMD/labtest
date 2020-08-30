import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {FormButton} from '../components/FormButton';
import React, { Component, useState, useEffect } from 'react';
import { LogBox, Button, TouchableHighlight, View, Text, Image, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import database from '@react-native-firebase/database';

import AsyncStorage from '@react-native-community/async-storage'
import LogoutButton from '../components/Logout';

import RNFS from 'react-native-fs';

// LogBox.ignoreLogs(['Warning: ...']);
console.disableYellowBox = true;

const Stack = createStackNavigator();

export default class Memorize extends Component {
    constructor(props){
        super(props);
        
        
        this.ShowWordsAndMeaning = this.ShowWordsAndMeaning.bind(this);
        this._IsTestStart = this._IsTestStart.bind(this);
        this._setToFirstWord = this._setToFirstWord.bind(this);
        this._IsLastWord = this._IsLastWord.bind(this);
        this._BottomText = this._BottomText.bind(this);
        this.getData = this.getData.bind(this);
        this.MemorizeRouter = this.MemorizeRouter.bind(this);
        this._setPage = this._setPage.bind(this);

        this.state = { 
            count : 1 ,
            wordList : '',
            word : '',
            meaning :'',
            isWord: true,
            tochange: true,
            isPop: false
        };


        this._IsTestStart();

        //현재 D+Date를 구해서 해당 날짜의 단어 가져오기
        

        (async () =>{
            let nowdDate = await getCurrentDate();
            console.log(nowdDate);
            //console.log("Memorize Constructor:", await AsyncStorage.getItem('popTime'));
            return nowdDate;
        })()
        .then((nowdDate) => {
            database()
            .ref('/words/day' + nowdDate.toString())
            .once('value')
            .then(snapshot => {
                console.log('Memorize data: ', snapshot.val());
                this.setState({
                    wordList: snapshot.val(),
                });
                this.setState({
                    word: this.state.wordList[this.state.count].word
                });
            });
        });

        
        this._setPage();
        
        this.props.navigation.setOptions({ headerTitle: props => <Text style={{fontSize:20}}>Test Loading...</Text> });
       
        // this.props.navigation.getParam('countPage', 1);
        // console.log(this.props.navigation.state.params);
        
    }
    componentDidMount(){
        //header 수정
        this.getData();

        //popScreen이 떳는지 체크
        this._IsTestStart();

        this._setPage();
        // console.log('---------------in didmout');
      }
    _setPage(){
        (async () => {
            try{
                let countPage = await AsyncStorage.getItem("countPage");
                this.setState({
                    count: countPage
                });
            }
            catch{
                console.log("no countPage in AsyncStorage");
            }
        });
    }
    _IsTestStart(){
        (async () => {
            await RNFS.readDir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
            .then((result) => {
                //console.log('GOT RESULT', result);

                var i = 0, index = 0;
                result.forEach((element) => {
                    if(element.name.toString() === 'popTime.txt'){
                        //console.log('element', element);
                        index = i;
                    }
                    i++;
                });

                return Promise.all([RNFS.stat(result[index].path), result[index].path]);
            })
            .then((statResult) => {
                //console.log('statResult', statResult);
                if (statResult[0].isFile()) {
                    // if we have a file, read it
                    return RNFS.readFile(statResult[1], 'utf8');
                }

                return 'no file';
            })
            .then((contents) => {
                // log the file contents
                console.log('popTime', contents);

                //PopScreen이 표시된 시간 확인 확인
                let popScreenTime = contents;
                console.log('popScreenTime: ', popScreenTime);

                //popItem이 AsyncStorage에 없을 때
                if(popScreenTime == -1){
                    this.setState({
                        isPop: false
                    });
                    return;
                }
                //firstLoginTime 가져오기
                AsyncStorage.getItem('firstLoginTime')
                    .then((firstLoginTime)=>{
                        //현재 D+Date 구하기
                        let now = new Date();
                        let dDate = new Date(now.getTime() - firstLoginTime);
                        
                        //PopScreen이 마지막으로 표시된 D+Date
                        let popDate = new Date(popScreenTime - firstLoginTime);

                        console.log('현재 날짜 ', dDate.getDate(), 'pop 날짜 ', popDate.getDate());
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
                    })
            })
            .catch((err) => {
                console.log(err.message, err.code);
            });
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
            //현재 영단어가 표기되고 있다면 영단어와 한글뜻을 보여줘야 한다.
            if(this.state.isWord){
                this.setState({
                    word: this.state.wordList[this.state.count].word,
                    meaning: this.state.wordList[this.state.count].meaning,
                    isWord: false
                });
            }

            //현재 영단어와 한글 뜻이 표기되고 있다면 다음 차례의 영단어만 보여줘야 한다.
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
                    <TouchableOpacity style={styles.returnbuttonContainer} onPress={ () => this._setToFirstWord() } >
                        <Text style={styles.buttonText}>다시 학습</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonContainer} onPress={ () => { 
                        writeTestStateTesting(); 
                        this.props.navigation.navigate('TestScreen');
                    }} >
                        <Text style={styles.buttonText}>테스트 시작</Text>
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
            return(
                <View>
                    <Text style={{
                        fontSize: 23,
                        textAlign: 'center',
                        color: 'dimgray',
                        marginTop: 20
                    }}>
                        단어학습을 완료하였습니다.
                    </Text>
                    <Text style={{
                        fontSize: 15,
                        textAlign: 'center',
                        color: 'dimgray',
                        marginTop: 20
                    }}>
                        단어를 다시 확인하려면 '다시 학습'을, {'\n'}테스트를 진행하려면 '테스트 시작'을 눌러주세요.
                    </Text>
                </View>
            );
            //bottomText = '“단어학습이 완료되었습니다. 다시 한 번 학습하기 또는 단어테스트 보기 중 선택해주세요.';
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

    ShowWordsAndMeaning(){
        const flag = this.state.isWord;
        let returnDOM = null;
        const word = this.state.word;
        const meaning = this.state.meaning;

        //영단어만 보여줘야하는 차례
        if(flag){
            returnDOM = <View elevation={20} style={styles.middle}>
            <Text style={{
                fontSize: 40,
                textAlign: 'center'
            }}>{word}</Text>
            </View>; 
        }
        //영단어와 한글 뜻을 함께 보여줘야하는 차례
        else{
            // console.log('word and meaing ', word, meaning);
            returnDOM = <View elevation={20} style={styles.middle}>
            <Text style={{
                fontSize: 30,
                textAlign: 'center'
            }}>{word}</Text>
            <Text style={{
                fontSize: 40,
                marginTop: 20,
                textAlign: 'center'
            }}>{meaning}</Text>
            </View>;
        }
        // console.log('isWord is ', flag);
        
        return returnDOM;
    }
    MemorizeRouter(){
        //알람이 울리지않았다면
        if(!this.state.isPop){
            return(
                <View style={{
                    flex: 1,
                    backgroundColor: '#EFEFEF',
                    padding: 10,
                    }}
                >
                    <View elevation={10} style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: 40,
                        marginTop: 140,
                        marginBottom: 140,
                        backgroundColor: '#E67D60',
                        borderRadius: 30,
                        shadowColor: "#000000",
                        shadowOpacity: 0.4,
                        shadowRadius: 2,
                        shadowOffset: {
                        height: 5,
                        width: 5
                        }
                    }}>
                        <View style={{
                            flex: 1,
                            backgroundColor: 'white',
                            alignSelf: 'stretch',
                            borderTopLeftRadius: 30,
                            borderTopRightRadius: 30,
                            justifyContent: 'center',
                            padding: 20
                        }}>
                            <Text style={{
                                textAlign: 'center',
                                fontSize: 22,
                            }}>
                                ✋🙂
                            </Text>
                        </View>
                        <View style={{
                            flex:3,
                            borderBottomLeftRadius: 30,
                            borderBottomRightRadius: 30,
                            justifyContent: 'center',
                            padding: 20
                        }}>
                            <Text style={{
                                textAlign: 'center',
                                fontSize: 22,
                                
                            }}>
                                알람이 울리지 않아 {'\n'}
                                단어 시험을 시작할 수 없습니다.
                            </Text>
                        </View>
                        
                    </View>
                    {/* <Button title='set pop time' onPress={() => {testSetPoptime()}}/> */}
                </View>
            );
        }
        //알람이 울렸다면
        else{
            const { count, word } = this.state;
            return(
                <View style={{
                    flex: 1,
                    backgroundColor: '#8EE4AF'
                }}
                    onStartShouldSetResponder = { (PressEvent) => this._onPressScreen() }
                >
                    <View style={styles.head}>
                        <View style={{
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                fontSize: 20,
                                marginBottom: 10
                            }}>오늘의 단어</Text>
                            <Text style={{
                                fontSize: 15
                            }}>{count}/5</Text>
                        </View>
                    </View>
                                         
                    <this.ShowWordsAndMeaning />                           
    
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

// async function testSetPoptime(){
//     //popScreen이 표시된 시간을 로컬 저장소에 저장
    
//     let now = new Date();
//     try{
//         await AsyncStorage.setItem('popTime', now.getTime().toString());
//         console.log('save poptime to test', await AsyncStorage.getItem('popTime'));
//     }
//     catch(e){
//         console.log('fail to save poptime ', e);
//     }
    
// }

async function getCurrentDate(){
    let now = new Date();
    let firstLoginTime = await AsyncStorage.getItem('firstLoginTime');
    let dDate = new Date(now.getTime() - firstLoginTime);

    return dDate.getDate();
}


function writeTestStateTesting(){
    (async () => {
        let nowdDate = await getCurrentDate();
        return nowdDate;
    })()
    .then( (nowdDate) => {
        (async () => {
            try{
                await AsyncStorage.setItem('day' + nowdDate.toString(), "testing");
                // console.log("check day1 as", state);
            }
            catch(e){
                // console.log("fail to check day1 as", state);
            }
        });
    });
}

const styles = StyleSheet.create({
    head:{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.6)'
    },
    //단어, 뜻이 표기되는 짙은 박스
    middle:{
        flex: 2,
        justifyContent: 'center',
        shadowColor: "#000000",
        shadowOpacity: 0.7,
        shadowRadius: 2,
        shadowOffset: {
        height: 7,
        width: 0
        },
        backgroundColor: '#8EE4AF',
    },
    end:{
        flex: 2,
        flexDirection: 'column',
        backgroundColor: 'rgba(255,255,255,0.7)'
    },
    bottom:{
        flex: 1,
    },
    buttonContainer: {
        marginTop: 10,
        width: 100,
        height: 50,
        backgroundColor: 'lightgreen',
        padding: 10,
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
    },
    returnbuttonContainer: {
        marginTop: 10,
        width: 100,
        height: 50,
        backgroundColor: '#F4DECB',
        padding: 10,
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
    },
    buttonText:{
        fontSize: 15
    }
});
