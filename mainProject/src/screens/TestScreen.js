import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import React, { Component, useState, useEffect } from 'react';
import {AsyncStorage, Button, TouchableOpacity, TouchableHighlight, View, Image, ScrollView, TextInput, StyleSheet } from 'react-native';

import { Text, RadioButton } from 'react-native-paper';
import database from '@react-native-firebase/database';

import { Table, TableWrapper, Row, Rows, Cell, Col } from 'react-native-table-component';

import Toast from 'react-native-simple-toast';

import { windowHeight, windowWidth } from '../utils/Dimensions';

import LogoutButton from '../components/Logout';
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
        this.initTestResult = this.initTestResult.bind(this);

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
            correctCount: 0,
            jsonTestResult: null,
            isTestResultExist: false
        };

        database()
        .ref('/words/day2')
        .once('value')
        .then(snapshot => {
            // console.log('User data: ', snapshot.val());
            dbList = snapshot.val(); 
            this.setState({
                wordList: snapshot.val(),
            });
            this.setState({
                word: this.state.wordList[this.state.count].word
            });

        });

        //시험 결과를 일단 불러와봄
        // let jsonTestResult = readTesetResult();
        (async () => {
            try{
                let result = await AsyncStorage.getItem('testResult');
                // console.log("load test result", result);
                this.setState({
                    jsonTestResult: JSON.parse(result)
                });
                // return JSON.parse(result);
            }
            catch(e){
                // console.log("fail to load result", e);
                // return -1;
            }
        })()
        .then( () => {
            //불러올 시험 결과가 있다면
            if(this.state.jsonTestResult != null){
                let _savedTableData = this.state.jsonTestResult.tableData;
                let _savedTableTitle = this.state.jsonTestResult.tableTitle;
                let _savedCorrectCount = this.state.jsonTestResult.correctCount;

                // console.log('saved tabledata ::::::::', _savedTableData);
                // console.log('saved tableTtile::::', _savedTableTitle);
                this.setState({
                    isTestResultExist: true,
                    testDone: true,
                    start: true,
                    tableData: _savedTableData,
                    tableTitle: _savedTableTitle,
                    correctCount: _savedCorrectCount
                });

                // console.log('jsonTestResult ::::::::::: ', this.state.jsonTestResult);
                
            }else{
                // console.log('jsonResult is null');
            }
        });
        
        
        
        this.props.navigation.setOptions({ headerTitle: props => <Text style={{fontSize:20}}>Alarm Loading...</Text> });
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
        // console.log("in componentDidMount()");
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
                // console.log(randomNumberList);
            }
            // console.log("answerList : " + tempAnswerList);
            // console.log("problemitemlist : ");
            // console.log(tempProblemItemList);
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
                            오늘의 단어 테스트{"\n"}
                        {"\n"}

                        </Text>

                        <Text style={{
                            fontSize: 17
                        }}>

                        
                        {"\n"}
                        하단의 ‘테스트 시작’ 버튼을 누르시면 단어테스트를 시작합니다.{"\n"}
                        객관식의 총 5 문항입니다.{"\n"}
                        
                        </Text>
                    
                    </View>
                    
                    <View style={styles.warningButtonContainer}>
                        <TouchableOpacity
                            style={styles.buttonContainer}  
                            
                            
                            onPress={ () => { this.setState({ start: true }) } } 
                        >
                            <Text style={{
                                fontSize: 19
                            }}>
                                테스트 시작
                            </Text>
                        </TouchableOpacity>


                        
                    </View>  

                    <View style={styles.warningButtonContainer}>
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
                <View style={{flex: 1}}>
                    <BottomButton count={this.state.count} grading={this.Grading} increase={this.increaseCount} decrease={this.decreaseCount}/>
                </View>
                
            </View>
        );
    }

    GradingScreen(){
        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth();
        let date = today.getDate();
        

        return(
            <View style={{
                flex: 1,
                padding: 11
            }}>
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    padding: 10
                }}>
                    <Text style={{
                        fontSize: 30,
                        textAlign: 'center'
                    }}>
                        단어 테스트 결과
                    </Text>
                    <Text style={{
                        fontSize: 20,
                        textAlign: 'center'
                    }}>
                        {year}년 {month+1}월 {date}일
                    </Text>    
                </View>
                
                <View style={{
                    flex: 3,
                    justifyContent: 'center'

                }}>
                    <Table borderStyle={{borderWidth: 1}}>
                        <Row data={this.state.tableHead} flexArr={[1, 1, 1, 1]} style={styles.head} textStyle={styles.text}/>
                        <TableWrapper style={styles.wrapper}>
                            <Col data={this.state.tableTitle} style={{height: 60}} heightArr={[60,60,60,60,60]} textStyle={styles.text}/>
                            <Rows data={this.state.tableData} flexArr={[1, 1, 1]} style={styles.row} textStyle={styles.text}/>
                        </TableWrapper>
                    </Table>
                </View>

                <View style={{
                    flex: 1,
                    justifyContent: 'center'
                }}>
                    <Text style={{
                        fontSize: 20,
                        textAlign: 'center'
                    }}>
                        맞은 개수 : {this.state.correctCount}개
                    </Text>
                </View>

                <Button title="init data" onPress={() => {this.initTestResult() }}/>
            </View>
        );
    }

    initTestResult(){
        this.setState({
            tableTitle: [null, null, null, null, null],
            tableData: [
                [null, null, null],
                [null, null, null],
                [null, null, null],
                [null, null, null],
                [null, null, null],
            ],
            correctCount: 0,
            jsonTestResult: null,
            isTestResultExist: false
        });

        writeTestState('');

        try{
             AsyncStorage.removeItem('testResult');
        }
        catch(e){

        }
        
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

        //한 문제라도 안 풀려있다면 함수 종료
        if(!isAllProlbemChecked){    
            Toast.show('반드시 모든 문제를 풀어야 채점이 가능합니다!', Toast.LONG);
            return;
        }

        
        //오늘 시험을 처음 보는 것이라면
        if(!this.state.isTestResultExist){
            // console.log("checkedlist : " + this.state.checkedList);

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
            
            
            //Async로 쓸 데이터를 1개의 json 객체로 묶기
            let item = new Object();
            item.tableData = this.state.tableData;
            item.correctCount = _correctCount;
            item.tableTitle = this.state.tableTitle;
            
            writeTestResult(item);

            writeCorrectCount(_correctCount);
        }

        //이미 저장돼있는 시험 결과가 있다면 바로 여기로 와서 함수 종료


        
    }

    render() {
        return(
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <this.TestStartButtonScreen />
            </View>
        );
    }
}

function writeTestResult(result){
    (async () => {
        try{
            //시험 결과를 1개의 json 객체에 넣어서 저장(String 형태로)
            await AsyncStorage.setItem('testResult', JSON.stringify(result));

            //시험 결과가 쓰여진 시간을 기록
            let now = new Date();
            await AsyncStorage.setItem('testResultTime', now.getTime().toString());
            // console.log("save test result", result);
        }
        catch(e){
            // console.log("fail to save result", e);
        }
    })();
}

function readTesetResult(thisClass){
    
}

function writeTestState(state){
    (async () => {
        try{
            await AsyncStorage.setItem('day1', state);
            // console.log("check day1 as", state);
        }
        catch(e){
            // console.log("fail to check day1 as", state);
        }
    })();
}

async function writeCorrectCount(item) {
    var now = new Date();

    // A post entry.
    var postData = {
      correctCount: item,
      date: now.toUTCString()
    };
  
    //현재 D+ 날짜 구하기
    let firstLoginTime = await AsyncStorage.getItem('firstLoginTime');
    let dDate = new Date(now.getTime() - firstLoginTime);

    //현재 D+ 날짜 저장
    await AsyncStorage.setItem('lastDate', dDate.getDate());


    // Get a key for a new Post.
    //var newPostKey = database().ref().child('users/1000/test' + now.getTime()).push().key;
  
    // Write the new post's data simultaneously in the posts list and the user's post list.
    let updates = {};
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
        <TouchableOpacity style={styles.problemButtonContainer} onPress={props.onPress}>
            <Text style={styles.problemButtonText}>
                다음
            </Text>
        </TouchableOpacity>
        
    );
}

function PrevButton(props){
    return (
        <TouchableOpacity style={styles.problemButtonContainer} onPress={props.onPress}>
            <Text style={styles.problemButtonText}>
                이전
            </Text>
        </TouchableOpacity>
    );
}

function GradingButton(props){
    return(
        <TouchableOpacity style={styles.gradingButtonContainer} onPress={props.onPress}>
            <Text style={styles.problemButtonText}>
                테스트 완료
            </Text>
        </TouchableOpacity>
    );
}

function BottomButton(props){
    const count = props.count;
    
    if(count == 5){
        return <View style={styles.problemBottomButton}>
            <PrevButton onPress={props.decrease}/><GradingButton onPress={props.grading} /></View>;
    }
    else if(count == 1){
        return <View style={styles.problemBottomButton}>
            <NextButton onPress={props.increase}/></View>;
    }
    else{
        return <View style={styles.problemBottomButton}>
            <PrevButton onPress={props.decrease}/><NextButton onPress={props.increase}/></View>;
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
    head: {  height: 40,  backgroundColor: 'darkseagreen'  },
    wrapper: { flexDirection: 'row' },
    title: { flex: 1, backgroundColor: 'darkseagreen' },
    row: {  height: 60  },
    text: { textAlign: 'center', fontSize: 15 },

    warningContainer: {
        flex: 1,
        padding: 40,
        backgroundColor: 'white'
    }, 
    warningWordsContainer: {
        flex: 3
        
    },
    warningButtonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center', alignItems: 'center',
        
    },
    buttonContainer: {
        marginTop: 10,
        width: 200,
        height: 60,
        backgroundColor: 'lightgreen',
        padding: 10,
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
    },
    problemButtonContainer: {  
        width: 100,
        height: 60,
        backgroundColor: 'lightgreen',
        padding: 10,
        marginLeft: 20,
        marginRight: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
    },
    problemButtonText:{
        fontSize: 16
    },
    gradingButtonContainer: {
        width: 100,
        height: 60,
        backgroundColor: 'sandybrown',
        padding: 10,
        marginLeft: 20,
        marginRight: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
    },
    problemMeaning:{
        fontSize: 15,
        margin: 5,
    },
    problemBottomButton:{
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'row'
    }
});