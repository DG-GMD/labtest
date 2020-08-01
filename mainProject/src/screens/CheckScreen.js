import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import React, { Component } from 'react';
import {StyleSheet, View, Text, Image, ScrollView, TextInput
    , TouchableOpacity, Alert, ImageBackground} from 'react-native';

import { Table, TableWrapper, Row, Rows, Cell } from 'react-native-table-component';

import * as Progress from 'react-native-progress';

export default class Check extends Component {
    constructor(props) {
      super(props);
      this.state = {
        tableData: [
          ['1', '2', '3', '4', '4', '4', '4'],
          ['a', 'b', 'c', 'd', '4', '4', '4'],
        ]
      }
    }
   
    _alertIndex(index) {
      Alert.alert(`This is row ${index + 1}`);
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
                    backgroundColor: 'red'
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
                    flex: 2,
                    justifyContent: 'center'
                }}>
                    <Table borderStyle={{borderWidth: 1, borderColor: 'black'}}>
                    {
                        state.tableData.map((rowData, index) => (
                        <TableWrapper key={index} style={styles.row}>
                            {
                            rowData.map((cellData, cellIndex) => (
                                <Cell key={cellIndex} data={cellIndex <= 16 ? element() : cellData} textStyle={styles.text}/>
                            ))
                            }
                        </TableWrapper>
                        ))
                    }
                    </Table>
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
    row: { flexDirection: 'row', backgroundColor: '#FFF1C1', height: 45 },
    btn: { width: 58, height: 30, backgroundColor: '#78B7BB',  borderRadius: 2 },
    btnText: { textAlign: 'center', color: '#fff' }
  });