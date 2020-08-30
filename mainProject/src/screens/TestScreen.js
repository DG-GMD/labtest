import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import React, { Component, useState, useEffect } from 'react';
import { Platform, Dimensions, Yellow, Button, TouchableOpacity, TouchableHighlight, View, Image, ScrollView, TextInput, StyleSheet, LogBox } from 'react-native';
import {RadioButton, Text} from 'react-native-paper';
import database from '@react-native-firebase/database';

import { Table, TableWrapper, Row, Rows, Cell, Col } from 'react-native-table-component';

import Toast from 'react-native-simple-toast';

import { windowHeight, windowWidth } from '../utils/Dimensions';

import AsyncStorage from '@react-native-community/async-storage'
import LogoutButton from '../components/Logout';

// LogBox.ignoreLogs(['Warning: ...']);
console.disableYellowBox = true;

let dbList;

let tempProblemList = [];
let tempAnswerList = [];
let tempProblemItemList = [];

var {height, width} = Dimensions.get('window');

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
        this.initTest = this.initTest.bind(this);
        this.setProblemItems = this.setProblemItems.bind(this);
        this.getData = this.getData.bind(this);

        this.state = {
            toastVisible: false,
            checked: '',
            count: 1,
            wordList: '',
            word: '',
            start: false,
            problemState: [[], [], [], [], [], []],
            checkedList: [-1, -1, -1, -1, -1, -1],
            problemDOM: null,
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

        (async () =>{
            let nowdDate = await getCurrentDate();
            console.log(nowdDate);
            return nowdDate;
        })()
        .then( (nowdDate) => {
            database()
            .ref('/words/day' + nowdDate.toString())
            .once('value')
            .then(snapshot => {
                console.log('Word data: ', snapshot.val());
                dbList = snapshot.val(); 
                this.setState({
                    wordList: snapshot.val(),
                });
                this.setState({
                    word: this.state.wordList[this.state.count].word
                });
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
        this.props.navigation.setOptions({ headerTitle: props => <Text style={{fontSize:20}}>Test Loading...</Text> });
    }

    //header 수정
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
      };

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
                word: this.state.wordList[this.state.count+1].word,
                checked: -1
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
                word: this.state.wordList[this.state.count-1].word,
                checked: -1
            });
        }
        // console.log(_checkedList);
    }

    componentDidMount(){
        this.setProblemItems();
        this.getData();
    }

    setProblemItems(){
        let _problemDOM = tempProblemList;
        let _answerList = tempAnswerList;
        let _checkedList = [...this.state.checkedList];
        let _checked = _checkedList[this.state.count];

        
        let _probelmItemList = tempProblemItemList;
        this.setState({    
            checked: _checked,
            problemDOM : _problemDOM,
            answerList: _answerList,
            problemItemList: _probelmItemList
        });
    }
    ProblemButton() {
        if(this.state.problemDOM != null && this.state.problemDOM.length != 0){
            let item;
            console.log("DOM is existed : " + this.state.count);
            
            item = this.state.problemDOM[this.state.count];
            // console.log(item);
            return item;
        }
        else{
            writeTestState('testing');
            console.log('making new 5 Problems...');
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
            console.log('first prolbem ', tempProblemItemList[1]);
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
                            fontSize: 35,
                            color: 'midnightblue',
                            fontWeight: 'bold',
                            marginTop: 30,
                        }}>
                            오늘의 단어 테스트{"\n"}
                        </Text>
                        <Text style={{
                            color: '#605050',
                            fontSize: 23,
                            marginTop: 30,
                        }}>
                            {"\n"}
                            하단의 ‘테스트 시작’ 버튼을 누르시면 단어테스트를 시작합니다.{"\n"}
                            객관식의 총 5 문항입니다.{"\n"} 
                        </Text>

                        {/* <TouchableOpacity
                                    style={{width: 200, height: 50, }}  
                                    onPress={() => {returnToMemorize();}  }
                                >
                                    <Text style={{color: 'white'}}>
                                        단어 암기로 돌아가도록 초기화
                                    </Text>
                        </TouchableOpacity> */}
                    </View>
                    
                    <View elevator={10} style={{flex:1, backgroundColor:'#8EE4AF'}}>
                        <View style={styles.warningButtonContainer}>
                            <TouchableOpacity
                                style={styles.buttonContainer}  
                                onPress={ () => { this.setState({ start: true }) } } 
                            >
                                <Text style={{
                                    fontSize: 20
                                }}>
                                    테스트 시작
                                </Text>
                            </TouchableOpacity>
                        </View>
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
                <View style={styles.testTitle}>
                    <Text style={{fontSize: 15}}>
                        단어 테스트  {this.state.count} / 5
                    </Text>

                    <Text style={{fontSize : 40}}>
                        {this.state.word}

                    </Text>
                </View>
                <View style={styles.testProblem}>
                    <RadioButton.Group onValueChange={(value) => this.changeChecked(value)} value={this.state.checked}>
                        <this.ProblemButton />
                        
                    </RadioButton.Group>
                </View>
                <View style={styles.testButton}>
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
                backgroundColor: '#EFEFEF',
            }}>
                <View elevation={10} style={{
                    flex: 1,
                    backgroundColor: '#8EE4AF',
                    shadowColor: "#000000",
                    shadowOpacity: 0.7,
                    shadowRadius: 10,
                    shadowOffset: {
                    height: 3,
                    width: 5
                    },
                    borderBottomLeftRadius: 30,
                    borderBottomRightRadius: 30,
                }}>
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        margin: 20
                    }}>
                        <Text style={{
                            fontSize: 22,
                            textAlign: 'center',
                            margin:8
                        }}>
                            단어 테스트 결과
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            textAlign: 'center'
                        }}>
                            {year}년 {month+1}월 {date}일
                        </Text>    
                    </View>
                </View>
                
                <View style={{
                    flex: 6,
                    paddingLeft: 18,
                    paddingRight: 18,
                    // backgroundColor: '#EFEFEF',
                    
                
                }}>
                    <View style={{
                        flex: 6,
                        justifyContent: 'flex-end',
                        paddingBottom: 10,
                        // backgroundColor: 'green'
                    }}>
                        <Table borderStyle={{borderWidth: 1}}>
                            <Row data={this.state.tableHead} flexArr={[1, 1, 1, 1]} style={styles.head} textStyle={styles.text}/>
                            <TableWrapper style={styles.wrapper}>
                                <Col data={this.state.tableTitle} style={{height: 55}} heightArr={[55,55,55,55,55]} textStyle={styles.text}/>
                                <Rows data={this.state.tableData} flexArr={[1, 1, 1]} style={styles.row} textStyle={styles.text}/>
                            </TableWrapper>
                        </Table>
                    </View>


                    <View style={{
                        justifyContent: 'flex-start',
                        alignItems: 'flex-end',
                        flex: 1,
                        // backgroundColor: 'red'
                    }}>
                        <Text style={{
                            fontSize: 16,
                            textAlign: 'right'
                        }}>
                            맞은 개수 : {this.state.correctCount} / 5
                        </Text>
                    </View>

                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 1,
                        // backgroundColor: 'blue'
                    }}>
                        <Text style={{fontSize:17, textAlign:'center'}}>
                        오늘의 단어 학습을 모두 완료하셨습니다. {'\n'}수고하셨습니다
                        </Text>
                        
                    {/* <Button title="init testIndex" onPress={() => {this.initTestResult() }}/> */}
                </View>
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 1,
                        // backgroundColor: 'blue'
                    }}>
                        <TouchableOpacity style={styles.reMembuttonContainer} onPress={() => {this.initTest()}}>
                            <Text style={{fontSize: 15 , color: 'mediumseagreen', marginBottom: 10}}>
                                다시 학습하기
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
    initTest(){
        //local에 저장된 단어시험 결과들을 삭제
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
            isTestResultExist: false,
            checked: -1,
            count: 1,
            word: this.state.wordList[1].word,
            problemState: [[], [], [], [], [], []],
            checkedList: [-1, -1, -1, -1, -1, -1],
            problemDOM: null,
            answerList: [-1, -1, -1, -1, -1, -1],
            correctList: [false, false, false, false, false, false],
            problemItemList: [[], [], [], [], [], []],
        });

        writeTestState('');
        
        //단어 시험 종료 여부 flag 초기화
        this.setState({
            testDone: false,
            start: false
        });

        tempProblemList = [];
        tempAnswerList = [];
        tempProblemItemList = [];

        
        this.ProblemButton();
        this.setProblemItems();

        try{
            AsyncStorage.removeItem('testResult');
        }
        catch(e){

        }
        this.changeChecked(-1);

        this.props.navigation.navigate('MemorizeScreen');
    }

    //local에 저장된 단어시험결과 관련 저장소와 변수들을 초기화
    initTestResult(){
        this.initTest();
        try{
             AsyncStorage.removeItem('testIndex');
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
            

            //단어 시험결과를 저장
            (async () => {
                //Async에 쓸 데이터를 1개의 json 객체로 묶기
                let item = new Object();
                item.tableData = this.state.tableData;
                item.correctCount = _correctCount;
                item.tableTitle = this.state.tableTitle;

                return item;
            })().then( async (item) => {
                //가장 최근에 본 시험의 n회차인지 구하고 n+1을 반환한다
                let lastIndex = await writeIndexOfTestResult();

                //AsyncStorage에 단어 시험 결과 저장
                writeTestResultToLocal(item);

                //Firebase DB에 단어 시험 결과 저장
                writeTestResultToDB(_correctCount, lastIndex);
            });
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

async function returnToMemorize(){
    writeTestState(''); 
    await AsyncStorage.removeItem('popTime');
}

function writeTestResultToLocal(result){
    (async () => {
        try{
            //시험 결과를 1개의 json 객체에 넣어서 저장(String 형태로)
            await AsyncStorage.setItem('testResult', JSON.stringify(result));

            //시험 결과가 쓰여진 시간을 기록
            let now = new Date();
            await AsyncStorage.setItem('testResultTime', now.getTime().toString());
            // console.log("save test result", result);

            writeTestState('after test');
        }
        catch(e){
            // console.log("fail to save result", e);
        }
    })();
}

async function getCurrentDate(){
    let now = new Date();
    let firstLoginTime = await AsyncStorage.getItem('firstLoginTime');
    let dDate = new Date(now.getTime() - firstLoginTime);

    return dDate.getDate();
}

function writeTestState(state){
    (async () => {
        let nowdDate = await getCurrentDate();
        return nowdDate;
    })()
    .then( (nowdDate) => {
        (async () => {
            try{
                await AsyncStorage.setItem('day' + nowdDate.toString(), state);
                console.log("TestScreen : check day", nowdDate.toString());
            }
            catch(e){
                console.log("TestScreen : fail to check day test", e);
            }
        })();
    });
}

//오늘 n회차 시험인지 구한다.
//오늘 n+1회차 시험을 봤다고 기록한다.
//n+1을 반환한다.
//testIndex는 0부터 시작
async function writeIndexOfTestResult(){
    let testIndexArrayString = null;
    let testIndexArray = [];
    let lastIndex = -1;
    try{
        testIndexArrayString = await AsyncStorage.getItem('testIndex');
    }
    catch(e){
        console.log('there are no testIndex in AsyncStorage');
    }

    //testIndex가 한번도 기록이 안됐다면
    //= 처음 단어 시험 보는 것
    if(testIndexArrayString == null){
        lastIndex = 0;
        testIndexArray.push(lastIndex);
    }

    //testIndex가 기록된 적이 있음
    //= 가장 최근에 본 단어 시험의 회차를 구해야 함
    else{
        
        testIndexArray = JSON.parse(testIndexArrayString);
        let n = testIndexArray.length;
        testIndexArray.push(lastIndex);

        lastIndex = n;
        console.log('last index is', lastIndex-1, 'new last index is', lastIndex);
    }

    //최신 정보가 기록된 IndexArray를 AsyncStorage에 저장
    try{
        await AsyncStorage.setItem('testIndex', JSON.stringify(testIndexArray));
    }
    catch(e){
        console.log('fail to write IndexArray');
    }
    
    //가장 마지막 단어 시험 회차가 몇번째 단어시험인지 반환
    console.log('return lastIndex ', lastIndex);
    return lastIndex;
}

async function writeTestResultToDB(item, _lastIndex) {
    var now = new Date();

    // A post entry.
    var postData = {
      correctCount: item,
      date: now.toString()
    };
    try{
        //현재 D+ 날짜 구하기
        let firstLoginTime = await AsyncStorage.getItem('firstLoginTime');
        let dDate = new Date(now.getTime() - firstLoginTime);

        //현재 D+ 날짜 저장
        await AsyncStorage.setItem('lastDate', dDate.getDate().toString());

        //현재 로그인한 testNumber 구하기
        let testNumber = await AsyncStorage.getItem('testNumber');

        //실험 시작 n일째에서 몇번째 시험 결과를 저장할 것인지 확인
        let lastIndex = _lastIndex;
        console.log('before write to db, lastIndex=', lastIndex);

        //firebase db에 update
        var ref = database().ref('/users/' + testNumber.toString() + '/test/' + dDate.getDate().toString() + '/' + lastIndex);
        ref.update(postData);
        
        // let updates = {};
        // updates['/users/' + testNumber + '/test/' + dDate.getDate().toString()] = postData;
        // // updates['/user-posts/' + uid + '/' + newPostKey] = postData;
        // console.log('update test db', dDate.getDate());
        
        // database().ref().update(updates);
    }
    catch(e){
        console.log(e);
    }
}

function MeaningRadioButton(props){
    return (
        <View>
            <Text style={styles.problemMeaning}>{props.number}. {props.meaning}</Text>
            
            <RadioButton.IOS value={props.number} />
    
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
    head: {  height: 40,  backgroundColor: '#EBEFBF'  },
    wrapper: { flexDirection: 'row' },
    title: { flex: 1, backgroundColor: 'darkseagreen' },
    row: {  height: 55  },
    text: { textAlign: 'center', fontSize: 13 },

    warningContainer: {
        flex: 1,
        backgroundColor: 'white'
    }, 
    warningWordsContainer: {
        flex: 3,
        padding: 40,
        backgroundColor: '#8EE4AF',
        borderBottomLeftRadius: 40,
    },
    warningButtonContainer: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.46,
        shadowRadius: 11.14,

        elevation: 17,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'white',
        borderTopRightRadius: 40
    },
    buttonContainer: {
        width: 200,
        height: 60,
        backgroundColor: '#8EE4AF',
        padding: 10,
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
        shadowColor: "#000",
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,

        elevation: 5,
    },
    problemButtonContainer: {  
        width: 150,
        height: 60,
        // backgroundColor: 'red',
        padding: 10,
        marginLeft: 10,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
    },
    problemButtonText:{
        fontSize: 20
    },
    gradingButtonContainer: {
        width: 150,
        height: 60,
        // backgroundColor: 'sandybrown',
        padding: 10,
        marginLeft: 10,
        marginRight: 10,
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
    },
    testTitle:{
        flex: 1, padding: 30, alignItems: 'center',
        backgroundColor: '#8EE4AF',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.32,
        shadowRadius: 5.46,

        elevation: 9,
    },
    testProblem:{
        flex: 6, padding: 15,
        justifyContent: 'center'

    },
    testButton:{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#8EE4AF',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,

        elevation: 24,
    },
    reMembuttonContainer: {
        height: 40,
        backgroundColor: 'transparent',
        padding: 10,
        margin: height*0.01,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
});