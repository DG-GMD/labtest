import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import React, { Component } from 'react';
import {Button, StyleSheet, View, Text, Image, ScrollView, TextInput
    , TouchableOpacity, Alert, ImageBackground, Linking} from 'react-native';
    import database from '@react-native-firebase/database';

import { Table, TableWrapper, Row, Rows, Cell, Col } from 'react-native-table-component';
import { windowHeight, windowWidth } from '../utils/Dimensions';

import Modal, {
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalButton,
  SlideAnimation,
  ScaleAnimation,
} from 'react-native-modals';

import * as Progress from 'react-native-progress';


export default class Check extends Component {
    constructor(props) {
      super(props);

      this.state = {
        tableHead1: 
          ['1', '2', '3', '4', '5', '6', '7']
        ,
        tableHead2: 
          ['8', '9', '10', '11', '12', '13', '14']
        ,
        tableData1: [
          ['❌', '❌', '❌', '❌', '❌', '❌', '❌'],
          
        ],
        tableData2: [
          ['❌', '❌', '❌', '❌', '❌', '❌', '❌'],
        ],
        visible: false,
        linkList: '',
        testList: '',
      }


      database()
        .ref('/investigation')
        .once('value')
        .then(snapshot => {
            console.log('investigation data: ', snapshot.val());
            
            this.setState({
                linkList: snapshot.val(),
            });
        });
      
        database()
        .ref('/users/1000/test')
        .once('value')
        .then(snapshot => {
            console.log('test data: ', snapshot.val());
            
            this.setState({
                testList: snapshot.val(),
            });
            
            //해당 날짜에 시험을 수행했다면
            try{
              let temp = this.state.testList[1].correctCount;
  
              //해당 날짜의 기호 변경
              let _tableData = [...this.state.tableData1];
              _tableData[0][0] = '✅';
              this.setState({
                tableData1: _tableData
              })
  
              console.log("change check table!!");
            }
            //해당 날짜에 시험을 수행하지 않았다면
            catch{
              console.log("there's no test result");
            }
        });
      
    }



    render() {
      const state = this.state;
      const element = () => (
        <View>
            <Text>
                STAMP!
            </Text>
        </View>
      );
   
      return (
        <View style={styles.container}>
            <View style={{
                flex: 1,
                justifyContent: 'center',
                
            }}>

                <View style={{
                    flex: 1,
                    
                }}>
                    <Text style={{
                        fontSize: 40,
                        textAlign: 'center',
                        margin: 30
                        }}>
                        실험 1일차
                    </Text>
                </View>
                

                <View style={{
                    flex: 4,
                    justifyContent: 'center',
                    
                }}>
                    <Text style={{
                        fontSize: 20,
                        textAlign: 'center',
                        margin: 10
                        }}>
                        1일차 현황 진행표
                    </Text>

                    <View style={{margin: 10}}>
                      <Table borderStyle={{borderWidth: 1}}>
                          <Row data={this.state.tableHead1} flexArr={[1, 1, 1, 1, 1, 1, 1]} style={styles.head} textStyle={styles.text}/>
                          <TableWrapper style={styles.wrapper}>
                              <Col data={this.state.tableTitle} style={{height: 40, backgroundColor: '#f1f8ff'}} heightArr={[40,40,40,40,40]} textStyle={styles.text}/>
                              <Rows data={this.state.tableData1} flexArr={[1, 1, 1]} style={styles.row} textStyle={styles.text}/>
                          </TableWrapper>
                      </Table>
                    </View>
                    
                    <View style={{margin: 10}}>
                      <Table borderStyle={{borderWidth: 1}}>
                          <Row data={this.state.tableHead2} flexArr={[1, 1, 1, 1]} style={styles.head} textStyle={styles.text}/>
                          <TableWrapper style={styles.wrapper}>
                              <Col data={this.state.tableTitle} style={{height: 40, backgroundColor: '#f1f8ff'}} heightArr={[40,40,40,40,40]} textStyle={styles.text}/>
                              <Rows data={this.state.tableData2} flexArr={[1, 1, 1]} style={styles.row} textStyle={styles.text}/>
                          </TableWrapper>
                      </Table>
                    </View>
                </View>
                
                <View style={{ flex: 2, flexDirection:"row", alignItems:'center', justifyContent: 'center'}}>
                  <TouchableOpacity 
                    style={styles.buttonContainer} onPress={ () => {this.setState({ visible: true })}} >
                    <Text>설문조사</Text>
                  </TouchableOpacity>

                  

                </View>
                <View style={{ flex: 1}}>
                  <Image style={{
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end'
                  }}
                      source={require('../../img/logo.png')}
                  />
                </View>
                
                  

                  <Modal
                    width={0.9}
                    visible={this.state.visible}
                    rounded
                    actionsBordered
                    onTouchOutside={() => {
                      this.setState({ visible: false });
                    }}
                    modalTitle={
                      <ModalTitle
                        title="설문조사 링크"
                        align="left"
                      />
                    }
                    footer={
                      <ModalFooter>
                        
                        <ModalButton
                          text="확인"
                          bordered
                          onPress={() => {
                            this.setState({ visible: false });
                          }}
                          
                        />
                      </ModalFooter>
                      }
                    >
                      <ModalContent
                        style={{ backgroundColor: '#fff' }}
                      >
                        <View style={{padding: 10}}>
                          <Text>설문을 진행하시지 않은 피험자분들은 하단의 1주차 설문조사 링크로 접속해주시기 바랍니다. {"\n"}</Text>
                          <Text style={{fontSize:20, color: 'blue', alignContent:'center'}} onPress={() => Linking.openURL(this.state.linkList[0].link)}>
                            설문조사 링크
                          </Text>
                        </View>
                      </ModalContent>

                    </Modal>
                
          </View>
        </View>
      )
    }
  }
   
  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 30, backgroundColor: 'white'},
    
    head: {  height: 40,  backgroundColor: 'mediumaquamarine'  },
    wrapper: { flexDirection: 'row' },
    title: { flex: 1, backgroundColor: '#f6f8fa' },
    row: {  height: 30  },
    text: { textAlign: 'center' },
    
    
    buttonContainer: {
      marginTop: 10,
      width: windowWidth / 2,
      height: windowHeight / 15,
      backgroundColor: 'lightseagreen',
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8
    },
  });