import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import React, { Component } from 'react';
import { AsyncStorage, Button, StyleSheet, View, Text, Image, ScrollView, TextInput
    , TouchableOpacity, Alert, ImageBackground, Linking} from 'react-native';
    import database from '@react-native-firebase/database';

import { Table, TableWrapper, Row, Rows, Cell, Col } from 'react-native-table-component';




import LogoutButton from '../components/Logout';


export default class Check extends Component {
    constructor(props) {
      super(props);

      this.getData = this.getData.bind(this);
      
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
        userName: '',
        userTestNumber: '',
        userDB: '',
        milliTime: 0,
        howLongDate: 0,
        nowDdate: 1
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
      .on('value', snapshot => {
          console.log('test data: ', snapshot.val());
          
          this.setState({
              testList: snapshot.val(),
          });
          
          (async () => {
            //해당 날짜에 시험을 수행했다면
            try{
              let testListLength = this.state.testList.length;
              console.log('testListLength : ', testListLength);
              //해당 날짜의 기호 변경
              let _tableData = [...this.state.tableData1];

              for(let i=1; i<=testListLength-1; i++){
                let correctCount = this.state.testList[i].correctCount;
                
                let dDate = await AsyncStorage.getItem('lastDate');

                //시험 정보가 있는 날(correctCount != -1 )
                if(correctCount != -1){
                  let x = parseInt((i-1) / 2);
                  let y = parseInt((i-1) % 2);
                  // console.log('count != -1, i : ', i, x, y);
                  _tableData[x][y] = '✅';
                }
                //시험 정보가 없는 날(correctCount == -1)
                else{
                  let x = i / 2;
                  let y = i % 2;
                  // console.log('count == -1, i : ', i);
                  _tableData[x][y] = '❌';
                }
              }
              
              this.setState({
                tableData1: _tableData
              })

              console.log("change check table!!");

              //현재 D+date구하기
              let now = new Date();
              let firstLoginTime = await AsyncStorage.getItem('firstLoginTime');
              
              console.log('현재시간, 최초로그인', now.getTime(), firstLoginTime);
              let _nowDdate = new Date(now.getTime() - firstLoginTime);
              this.setState({
                nowDdate: _nowDdate.getDate()
              });
            }
              //해당 날짜에 시험을 수행하지 않았다면
            catch{
              console.log("there's no test result");
            }
          })();
        });
      
      this.props.navigation.setOptions({ headerTitle: props => <Text style={{fontSize:20}}>Check Loading...</Text> });  
    }


    componentDidMount(){
      this.getData();
      // console.log('---------------in didmout');
    }
  
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
                        실험 {this.state.nowDdate}일차
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
                        {this.state.nowDdate} 일차 현황 진행표
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
                
                
                  
               <InvestigationLink nowDdate={this.state.nowDdate} link={this.state.linkList[0]} />
            <TouchableOpacity style={{width:80, backgroundColor:'beige'}} onPress={() => {initAsyncStorage()}}>
              <Text>
              delete AsyncStorage    
              </Text>
            </TouchableOpacity>   
                
                      
                
          </View>
        </View>
      )
    }
  }
async function initAsyncStorage(){
  try{
    await AsyncStorage.removeItem('popTime');
    console.log('remove popItem');
  }
  catch(e){
    console.log('fail to remove popItem');
  }
  
}
function InvestigationLink(props){
  let nowDdate = props.nowDdate;
  let link = props.link;

  let returnDOM = <View></View>;

  if(nowDdate == 14){
    returnDOM = <View style={{padding: 10}}>
      <Text style={{fontSize:18, alignContent:'center'}}>설문을 진행하시지 않은 피험자분들은 하단의 1주차 설문조사 링크로 접속해주시기 바랍니다. {"\n"}</Text>
      <Text style={{fontSize:20, color: 'blue', alignContent:'center', textAlign: 'center'}} onPress={() => Linking.openURL(link)}>
        설문조사 링크
      </Text>
    </View>;
  }

  return returnDOM;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 30, backgroundColor: 'white'},
  
  head: {  height: 30,  backgroundColor: 'palegreen'  },
  wrapper: { flexDirection: 'row' },
  title: { flex: 1, backgroundColor: '#f6f8fa' },
  row: {  height: 30  },
  text: { textAlign: 'center' },
  
  
  buttonContainer: {
    marginTop: 10,
    width: 200,
    height: 50,
    backgroundColor: 'lightseagreen',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8
  },
});