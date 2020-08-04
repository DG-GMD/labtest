import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import React, { Component, useState, useEffect } from 'react';
import {AsyncStorage, Button, TouchableOpacity, TouchableHighlight, View, Image, ScrollView, TextInput, StyleSheet } from 'react-native';

import { Text, RadioButton } from 'react-native-paper';
import database from '@react-native-firebase/database';

import { Table, TableWrapper, Row, Rows, Cell, Col } from 'react-native-table-component';

import Toast from 'react-native-simple-toast';


import { windowHeight, windowWidth } from '../utils/Dimensions';


let dbList;

let tempProblemList = [];
let tempAnswerList = [];
let tempProblemItemList = [];

export default class Test extends Component{
    constructor(props){
        super(props);
        this.changeChecked = this.changeChecked.bind(this);
        this.increaseCount = this.increaseCount.bind(this);
        this.decreaseCount = this.decreaseCount.bind(this);
        this.ProblemButton = this.ProblemButton.bind(this);
        this.TestStartButtonScreen = this.TestStartButtonScreen.bind(this);
        this.TestScreen = this.TestScreen.bind(this);
        this.Grading = this.Grading.bind(this);
        this.GradingScreen = this.GradingScreen.bind(this);

        this.state = {
            toastVisible: false,
            checked: '',
            count: 1,
            wordList: '',
            word: '',
            start: false,
            problemState: [[], [], [], [], [], []],
            checkedList: [-1, -1, -1, -1, -1, -1],
            problemDOM: [],
            answerList: [-1, -1, -1, -1, -1, -1],
            correctList: [false, false, false, false, false, false],
            testDone: false,
            problemItemList: [[], [], [], [], [], []],
            tableHead: ['', '단어 뜻', '내 답변', '결과'],
            tableTitle: [null, null, null, null, null],
            tableData: [
                [null, null, null],
                [null, null, null],
                [null, null, null],
                [null, null, null],
                [null, null, null],
            ],
            correctCount: 0
        };

        database()
        .ref('/words/day2')
        .once('value')
        .then(snapshot => {
            console.log('User data: ', snapshot.val());
            dbList = snapshot.val(); 
            this.setState({
                wordList: snapshot.val(),
            });
            this.setState({
                word: this.state.wordList[this.state.count].word
            });

        });
    }

    //사용자가 체크한 현재 문제의 답을 저장
    changeChecked(value){
        const _value = value;
        let _checkedList = [...this.state.checkedList];
        _checkedList[this.state.count] = _value;

        this.setState({
            checkedList: _checkedList,
            checked: _value
        });

        
        
    }
    increaseCount(){
        let _checkedList = [...this.state.checkedList];
        let _checked = _checkedList[this.state.count+1];
        if(_checked == -1){
            this.setState({
                count: this.state.count+1,
                word: this.state.wordList[this.state.count+1].word,
                checked: -1
            });
        }
        else{
            this.setState({
                checked: _checked,
                count: this.state.count+1,
                word: this.state.wordList[this.state.count+1].word
    
            });
        }
        // console.log(_checkedList);
        //console.log(this.state.wordList[1].word);
    }
    decreaseCount(){
        let _checkedList = [...this.state.checkedList];
        let _checked = _checkedList[this.state.count-1];
        if(_checked == -1){
            this.setState({
                count: this.state.count-1,
                word: this.state.wordList[this.state.count-1].word,
                checked: -1
            });
        }
        else{
            this.setState({
                checked: _checked,
                count: this.state.count-1,
                word: this.state.wordList[this.state.count-1].word
    
            });
        }
        // console.log(_checkedList);
    }

    componentDidMount(){
        console.log("in componentDidMount()");
        let problemDOM = tempProblemList;
        let _answerList = tempAnswerList;
        let _checkedList = [...this.state.checkedList];
        let _checked = _checkedList[this.state.count];

        
        let _probelmItemList = tempProblemItemList;
        this.setState({    
            checked: _checked,
            problemDOM : problemDOM,
            answerList: _answerList,
            problemItemList: _probelmItemList
        });
        // console.log("checkedState : " + this.state.checkedState[this.state.count]);
    }

    ProblemButton() {
        if(this.state.problemDOM && this.state.problemDOM.length){
            let item;
            // console.log("DOM is existed : " + this.state.count);
            
            item = this.state.problemDOM[this.state.count];
            // console.log(item);
            return item;
        }
        else{
            writeTestState('testing');

            // console.log("in else");
            let randomNumber = 0;
            let randomNumberList = [];
            let flag = true;
            let returnDOM;
        
            tempAnswerList.push(-1);
            for(let k=0; k<6; k++){
                // //random 숫자 생성
                //생성된 숫자대로 단어 배열
                let wordMeaning, oneProblemItemList = [];
                returnDOM = [];
                randomNumberList = []
                for(let i=0; i<5; i++){
                    while(flag){
                        flag = false;
                        randomNumber = Math.floor(Math.random() * 5) + 1 ;
                        randomNumberList.forEach(element => {
                            if(element == randomNumber){
                                flag = true;
                                
                            }
                        });
            
                        if(!flag){
                            randomNumberList.push(randomNumber);
                        }
                    }
                    flag = true;
                    wordMeaning = this.state.wordList[randomNumber].meaning;

                    //삽입될 DOM의 뜻이 현재 문제 번호의 영단어와 일치한다면
                    //answerList에 문제번호 별로 답 번호 기록
                    if(this.state.wordList[k].meaning == wordMeaning){
                        tempAnswerList.push(i+1);
                    }

                    //단어 뜻이 적힌 객관식 문제 항목번호와 대응되는 단어 뜻을 기록
                    let item = [];
                    item.push(randomNumber);
                    item.push(wordMeaning);
                    oneProblemItemList.push(item);

                    returnDOM.push(<MeaningRadioButton number={i+1} meaning={wordMeaning}/>);
                }
                //한 문제의 5개 보기 정보를 저장
                tempProblemItemList.push(oneProblemItemList);
                
                //한 문제에 해당하는 DOM 저장
                
                tempProblemList.push(returnDOM);
                console.log(randomNumberList);
            }
            console.log("answerList : " + tempAnswerList);
            console.log("problemitemlist : ");
            console.log(tempProblemItemList);
            return tempProblemList[1];
        }
    }

    TestStartButtonScreen(){
        //단어 시작 버튼 페이지
        if(!this.state.start){
            return(
                
                <View style={styles.warningContainer}>
                    <View style={styles.warningWordsContainer}>
                        <Text style={{
                            fontSize: 25
                        }}>
                            하단의 테스트 시작 버튼을 누르면 단어 시험을 시작합니다.{"\n"}
                        {"\n"}

                        </Text>

                        <Text style={{
                            fontSize: 17
                        }}>

                        ⚠ 하단의 테스트 시작 버튼을 누르면 단어 시험을 시작합니다. ⚠{"\n"}
                        {"\n"}
                        1. 시험 도중에 앱을 완전 종료하셔도 다시 단어 시험으로 돌아올 수 있습니다.{"\n"}
                        2. 완전 종료 후 앱을 재실행해 단어시험을 보시면 기존의 시험 내용은 사라집니다.{"\n"}
                        3. 본 주의사항은 앱을 완전 종료하신 후 재접속하셔도 보실 수 있습니다.{"\n"}
                        {"\n"}
                        </Text>
                    
                    </View>
                    
                    <View style={styles.warningButtonContainer}>
                        <TouchableOpacity
                            style={styles.buttonContainer}  
                            
                            
                            onPress={ () => { this.setState({ start: true }) } } 
                        >
                            <Text>
                                테스트 시작
                            </Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={styles.buttonContainer}  
                            
                            
                            onPress={() => { writeTestState(''); this.props.navigation.navigate('Memorize');}  }
                        >
                            <Text>
                                로컬 파일 초기화
                            </Text>
                        </TouchableOpacity>
                    </View>  
                </View>
                
            );
        }
        //단어 시험 페이지
        else if(!this.state.testDone){
            return this.TestScreen();
        }
        //단어 채점 페이지
        else{
            return this.GradingScreen();
        }
    }
    TestScreen(){
        return(
            <View style={{flex: 1}}>
                <View style={{flex: 1, padding: 10, alignItems: 'center'}}>
                    <Text style={{fontSize: 20}}>
                        단어 테스트  {this.state.count} / 5
                    </Text>

                    <Text style={{fontSize : 50}}>
                        {this.state.word}

                    </Text>
                </View>
                <View style={{flex: 4, padding: 15}}>
                    <RadioButton.Group onValueChange={(value) => this.changeChecked(value)} value={this.state.checked}>
                        <this.ProblemButton />
                        
                    </RadioButton.Group>
                </View>
                <View style={{flex: 2}}>
                    <BottomButton count={this.state.count} grading={this.Grading} increase={this.increaseCount} decrease={this.decreaseCount}/>
                </View>
                
            </View>
        );
    }

    GradingScreen(){
        return(
            <View style={{
                flex: 1
            }}>
                <View style={{
                    flex: 1,
                    justifyContent: 'center'
                }}>
                    <Text>
                        단어 테스트 결과
                    </Text>
                    <Text>
                        2020년 8월 4일
                    </Text>    
                </View>
                
                <View style={{
                    flex: 2,
                    justifyContent: 'center'
                }}>
                    <Table borderStyle={{borderWidth: 1}}>
                        <Row data={this.state.tableHead} flexArr={[1, 1, 1, 1]} style={styles.head} textStyle={styles.text}/>
                        <TableWrapper style={styles.wrapper}>
                            <Col data={this.state.tableTitle} style={{height: 40, backgroundColor: '#f1f8ff'}} heightArr={[40,40,40,40,40]} textStyle={styles.text}/>
                            <Rows data={this.state.tableData} flexArr={[1, 1, 1]} style={styles.row} textStyle={styles.text}/>
                        </TableWrapper>
                    </Table>
                </View>

                <View style={{
                    flex: 1,
                    justifyContent: 'center'
                }}>
                    <Text>
                        맞은 개수 {this.state.correctCount}
                    </Text>
                </View>
            </View>
        );
    }

    Grading(){
        let isAllProlbemChecked = true;
        //모든 문제가 체크돼어있는지 확인
        //아니라면 상태 변화 없음
        for(let i=1; i<=5; i++){
            if(this.state.checkedList[i] == -1){
                isAllProlbemChecked = false;
            }
        }

        if(!isAllProlbemChecked){
            
            console.log("toastVisible");

            
            Toast.show('반드시 모든 문제를 풀어야 채점이 가능합니다!', Toast.LONG);
            
        
            return;
        }

        writeTestState("after test");

        console.log("checkedlist : " + this.state.checkedList);

        this.setState({
            testDone: true
        });
        let _correctList = [false, false, false, false, false, false];
        for(let i=1; i<=5; i++){
            //답안지와 체크한 항목이 일치한다면
            if(this.state.checkedList[i] == this.state.answerList[i]){
                _correctList[i] = true;
            }
        }
        this.setState({
            correctList: _correctList
        });
        
        let _correctCount = 0;

        for(let i=0; i<5; i++){
            //표의 title을 단어로 기입
            this.state.tableTitle[i] = this.state.wordList[i+1].word;

            //표의 data를 단어 뜻, 내 답변, 채점 결과로 기입

            //단어 뜻
            this.state.tableData[i][0] = this.state.wordList[i+1].meaning;

            //내 답변
            let myAnswerNumber = this.state.checkedList[i+1];
            console.log("myAnswerNumber : " + myAnswerNumber);
            this.state.tableData[i][1] = this.state.problemItemList[i+1][myAnswerNumber-1][1];

            //채점 결과
            //맞다면
            if(this.state.checkedList[i+1] == this.state.answerList[i+1]){
                this.state.tableData[i][2] = "O";
                _correctCount++;
            }
            else{
                this.state.tableData[i][2] = "X";
            }
        }

        this.setState({
            correctCount: _correctCount
        });

        writeCorrectCount(_correctCount);
    }

    render() {

        return(
            
            <View style={{flex: 1}}>
                <this.TestStartButtonScreen />
            </View>
        );
    }
}

function writeTestState(state){
    (async () => {
        try{
            await AsyncStorage.setItem('day1', state);
            console.log("check day1 as", state);
        }
        catch(e){
            console.log("fail to check day1 as", state);
        }
    })();
}

function writeCorrectCount(item) {
    var now = new Date();

    // A post entry.
    var postData = {
      correctCount: item,
      date: now.toUTCString()
    };
  
    // Get a key for a new Post.
    //var newPostKey = database().ref().child('users/1000/test' + now.getTime()).push().key;
  
    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/users/1000/test/' + '1'] = postData;
    // updates['/user-posts/' + uid + '/' + newPostKey] = postData;
  
    return database().ref().update(updates);
  }

function MeaningRadioButton(props){
    return (
        <View>
            <Text style={styles.problemMeaning}>{props.number}. {props.meaning}</Text>
            <RadioButton value={props.number} />
        </View>
    );
}



function NextButton(props){
    return (
        <TouchableOpacity style={styles.buttonContainer} onPress={props.onPress}>
            <Text>
                다음
            </Text>
        </TouchableOpacity>
        
    );
}

function PrevButton(props){
    return (
        <TouchableOpacity style={styles.buttonContainer} onPress={props.onPress}>
            <Text>
                이전
            </Text>
        </TouchableOpacity>
    );
}

function GradingButton(props){
    return(
        <TouchableOpacity style={styles.gradingButtonContainer} onPress={props.onPress}>
            <Text>
                채점하기
            </Text>
        </TouchableOpacity>
    );
}

function BottomButton(props){
    const count = props.count;
    if(count == 1){
        return <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <NextButton onPress={props.increase}/></View>;
    }
    else if(count == 5){
        return <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <PrevButton onPress={props.decrease}/><GradingButton onPress={props.grading} /></View>;
    }
    else{
        return <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <NextButton onPress={props.increase}/><PrevButton onPress={props.decrease}/></View>;
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
    },
    head: {  height: 40,  backgroundColor: '#f1f8ff'  },
    wrapper: { flexDirection: 'row' },
    title: { flex: 1, backgroundColor: '#f6f8fa' },
    row: {  height: 40  },
    text: { textAlign: 'center' },

    warningContainer: {
        
        padding: 40,
        backgroundColor: 'white'
    }, 
    warningWordsContainer: {
        
        
    },
    warningButtonContainer: {
        
        justifyContent: 'center', alignItems: 'center',
        
    },
    buttonContainer: {
        marginTop: 10,
        width: 250,
        height: 50,
        backgroundColor: 'lightgreen',
        padding: 10,
        margin: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
    },
    gradingButtonContainer: {
        marginTop: 10,
        width: 250,
        height: 50,
        backgroundColor: 'sandybrown',
        padding: 10,
        margin: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
    },
    problemMeaning:{
        fontSize: 15,
        margin: 5,
    }
});


