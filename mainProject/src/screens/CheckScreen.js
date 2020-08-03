import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import React, { Component } from 'react';
import {StyleSheet, View, Text, Image, ScrollView, TextInput
    , TouchableOpacity, Alert, ImageBackground, Linking} from 'react-native';
    import database from '@react-native-firebase/database';

import { Table, TableWrapper, Row, Rows, Cell, Col } from 'react-native-table-component';

import Modal, {
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalButton,
  SlideAnimation,
  ScaleAnimation,
} from 'react-native-modals';

import * as Progress from 'react-native-progress';
import { Button } from 'react-native-paper';

export default class Check extends Component {
    constructor(props) {
      super(props);

      this.state = {
        tableData: [
          ['❌', '❌', '❌', '❌', '❌', '❌', '❌'],
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
                testList: snapshot.val(),
            });
        });
      
      database()
      .ref('/users/1000/test')
      .once('value')
      .then(snapshot => {
          console.log('test data: ', snapshot.val());
          
          this.setState({
              linkList: snapshot.val(),
          });
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
                justifyContent: 'center'
            }}>

                <View style={{
                    flex: 1,
                    backgroundColor: 'aqua'
                }}>
                    <Text style={{
                        fontSize: 40,
                        textAlign: 'center',
                        margin: 30
                        }}>
                        실험 n일차
                    </Text>
                </View>
                

                <View style={{
                    flex: 3,
                    justifyContent: 'center',
                    backgroundColor: 'crimson'
                }}>
                    <Table borderStyle={{borderWidth: 1}}>
                        <Row data={this.state.tableHead} flexArr={[1, 1, 1, 1]} style={styles.head} textStyle={styles.text}/>
                        <TableWrapper style={styles.wrapper}>
                            <Col data={this.state.tableTitle} style={{height: 40, backgroundColor: '#f1f8ff'}} heightArr={[40,40,40,40,40]} textStyle={styles.text}/>
                            <Rows data={this.state.tableData} flexArr={[1, 1, 1]} style={styles.row} textStyle={styles.text}/>
                        </TableWrapper>
                    </Table>
                </View>
                
                <View style={{ flex: 1}}>
                  <Button 
                    mode="outlined" onPress={ () => {this.setState({ visible: true })}}>
                    설문조사!!!
                  </Button>
                  

                  

                </View>
                <View style={{ flex: 1}}>
                  <Image style={{
                      alignItems: 'flex-end'
                  }}
                      source={require('../../img/logo.png')}
                  />
                </View>
                <View style={{ flex: 1}}>
                  <Button
                    title="Show Modal - Custom Background Style"
                    onPress={() => {
                      this.setState({
                        visible: true,
                      });
                    }}
                  />

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
                          key="button-1"
                        />
                      </ModalFooter>
                      }
                    >
                      <ModalContent
                        style={{ backgroundColor: '#fff' }}
                      >
                        <Text>하단의 설문조사 링크로 접속해주시기 바랍니다.</Text>
                        <Text style={{fontSize:20, color: 'blue'}} onPress={() => Linking.openURL(this.state.linkList[0].link)}>
                          설문조사 링크
                          </Text>
                      </ModalContent>
                    </Modal>
                </View>
          </View>
        </View>
      )
    }
  }
   
  const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#808B97' },
    text: { margin: 6 },
    row: { flexDirection: 'row', backgroundColor: 'honeydew', height: 45 },
    btn: { width: 58, height: 30, backgroundColor: '#78B7BB',  borderRadius: 2 },
    btnText: { textAlign: 'center', color: '#fff' }
  });