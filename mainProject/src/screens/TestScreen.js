import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import React, { Component, useState, useEffect } from 'react';
import { Button, TouchableHighlight, View, Image, ScrollView, TextInput, StyleSheet } from 'react-native';

import { Text, RadioButton } from 'react-native-paper';
import database from '@react-native-firebase/database';

import * as RNFS from 'react-native-fs';



export default class Test extends Component{
    constructor(props){
        super(props);
        this.changeChecked = this.changeChecked.bind(this);
        this.increaseCount = this.increaseCount.bind(this);
        this.decreaseCount = this.decreaseCount.bind(this);

        this.state = {
            checked: '',
            count: 1,
            wordList: '',
            word: ''
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
            
            let path = RNFS.DocumentDirectoryPath + '/db.json';
            let writeString = JSON.stringify(snapshot.val());
            console.log("write String");
            console.log(writeString);
            RNFS.writeFile(path, writeString, 'utf8').then(res => {
                console.log("success to write jsondddddddddddddddddddddddd");
                console.log(path);
            })
            .catch(err => {
                console.log("write errrrrrrrrrrrrrrdddddddddddrrrrr");
                console.log(err);
            });
        });
    }

    changeChecked(value){
        const _value = value;
        this.setState({
            checked: _value
        });
        console.log(_value);
    }
    increaseCount(){
        this.setState({
            count: this.state.count+1,
            word: this.state.wordList[1].word
        });
        console.log(this.state.wordList[1].word);
    }
    decreaseCount(){
        this.setState({
            count: this.state.count-1
            
        });
    }

    

    render() {
        const {count, checked, word, wordList} = this.state;
        return(
            <View>
                <Text>
                    단어 테스트  {count} / 5
                </Text>

                <Text style={{fontSize : 15}}>
                    {word}

                </Text>
                <RadioButton.Group onValueChange={(value) => this.changeChecked(value)} value={checked}>
                    <ProblemButton count={count} wordList={wordList}/>
                    
                </RadioButton.Group>
                
                <BottomButton count={this.state.count} increase={this.increaseCount} decrease={this.decreaseCount}/>

            </View>
        );
    }
}


function MeaningRadioButton(props){
    return (
        <View>
            <Text>{props.meaning}</Text>
            <RadioButton value={props.number} />
        </View>
    );
}


function ProblemButton(props){
    //let dbwordList;
    let dbList;
    var path = RNFS.DocumentDirectoryPath + '/db.json';

    let getDB = async => {
        return await RNFS.readFile(path, 'utf8').then(res => {
            console.log("success to readddddddddddd");
            console.log(res);
            console.log(res[2]);
            return JSON.parse(res);
        })
        .catch(err => {
        
            console.log(err.message, err.code);
        
        });
    }

    console.log("dbList1111111111111");
    dbList = getDB().then(res => {
        console.log("this is in func"); 
        console.log(res); 
        return res;
    });

    console.log("dbList selected");
    console.log(dbList);
    console.log(dbList[1]);
    
    
    let randomNumber = 0;
    let randomNumberList = [];
    let flag = true;
    let returnDOM = [];
    const wordList = props.wordList;
    //const dbwordList = JSON.parse(wordList);
    const temp = wordList[1];
    console.log("-------------------");
    //console.log(dbwordList);
    //const dbwordList = JSON.stringify(dbList);
    // const temp3 = JSON.parse(temp);
    // console.log(temp3);
    
    
    
    //random 숫자 생성
    //생성된 숫자대로 단어 배열
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
        //let wordMeaning = dbwordList[randomNumber]["meaning"];
        
        
        }
        flag = true;
        returnDOM.push(<MeaningRadioButton number={randomNumber} meaning={"dd"}/>);
        console.log("randomn n : " + randomNumber);
    }
    
    //console.log(wordList);
    //console.log(<MeaningRadioButton number={randomNumber} meaning={"ddd"}/>);    
    return returnDOM
}



function NextButton(props){
    return (
        <Button title="다음" onPress={props.onPress}>
            
        </Button>
    );
}

function PrevButton(props){
    return (
        <Button title="prev" onPress={props.onPress}>
            
        </Button>
    );
}

function BottomButton(props){
    const count = props.count;
    if(count == 1){
        return <NextButton onPress={props.increase}/>;
    }
    else if(count == 5){
        return <PrevButton onPress={props.decrease}/>;
    }
    else{
        return <View><NextButton onPress={props.increase}/><PrevButton onPress={props.decrease}/></View>;
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

