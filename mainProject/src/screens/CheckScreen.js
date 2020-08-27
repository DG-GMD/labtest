import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import React, { Component } from 'react';
import { LogBox, Button, StyleSheet, View, Text, Image, ScrollView, TextInput
    , TouchableOpacity, Alert, ImageBackground, Linking} from 'react-native';
    import database from '@react-native-firebase/database';

import { Table, TableWrapper, Row, Rows, Cell, Col } from 'react-native-table-component';

import AsyncStorage from '@react-native-community/async-storage'


import LogoutButton from '../components/Logout';

// LogBox.ignoreLogs(['Warning: ...']);
console.disableYellowBox = true;

export default class Check extends Component {
    constructor(props) {
      super(props);

      this.getData = this.getData.bind(this);
      this.MakeInvestigationLink = this.MakeInvestigationLink.bind(this);
      this.checkedTestDB = this.checkedTestDB.bind(this);

      this.state = {
        tableHead1: 
          ['1', '2', '3', '4', '5', '6', '7']
        ,
        tableHead2: 
          ['8', '9', '10', '11', '12', '13', '14']
        ,
        tableData1: 
          [['', '','', '', '', '', '', ]],
        tableData2: 
          [['', '','', '', '', '', '', ]],
        
        visible: false,
        linkList: [],
        testList: '',
        userName: '',
        userTestNumber: '',
        userDB: '',
        milliTime: 0,
        howLongDate: 0,
        nowDdate: 1,
        testNumber: -1
      };
      
      //현재 로그인한 사용자의 연구번호를 가져온다
      (async () => {
        let testNumber = await AsyncStorage.getItem('testNumber');
        // console.log("first testNumber ", testNumber);
        return testNumber;
      })()
      .then((testNumber) => {
        this.setState({
          testNumber: testNumber
        });
        //연구번호를 이용해 해당 유저의 시험 정보에 접근
        // console.log("second testNumber ", testNumber);
        database()
        .ref('/users/' + testNumber.toString() + '/test')
        .on('value', snapshot => {
          console.log('test data: ', snapshot.val());
          this.setState({
              testList: snapshot.val(),
          });
          
          //표 수정 기능
          (async () => {
            //해당 날짜에 시험을 수행했다면
            try{
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
      });

      database()
      .ref('/investigation')
      .once('value')
      .then(snapshot => {
          console.log('investigation data: ', snapshot.val());
          
          this.setState({
              linkList: snapshot.val(),
          });
          this.MakeInvestigationLink();
      });
      this.props.navigation.setOptions({ headerTitle: props => <Text style={{fontSize:20}}>Check Loading...</Text> });  
    }


    checkedTestDB(){
      //표 수정 기능
      (async () => {
        let testNumber = await AsyncStorage.getItem('testNumber');
        // console.log("first testNumber ", testNumber);
        return testNumber;
      })()
      .then((testNumber) => {
        console.log("checkpage : testNumber", testNumber);
        this.setState({
          testNumber: testNumber
        });
        database()
        .ref('/users/' + this.state.testNumber.toString() + '/test')
        .on('value', snapshot => {
          console.log('new test data: ', snapshot.val());
          this.setState({
              testList: snapshot.val(),
          });
          let _testList = snapshot.val();

          (async () => {
            //해당 날짜에 시험을 수행했다면
            try{
              let testListLength = Object.keys(_testList).length;
              console.log('testListLength : ', testListLength);

              let testListSample = _testList[0]
              //해당 날짜의 기호 변경
              let _tableData1 = [...this.state.tableData1];
              let _tableData2 = [...this.state.tableData2];

              //단어 시험을 본 날짜들을 가져온다
              let testDateList = [];
              let tempList = Object.keys(_testList);
              for(let i=0; i<tempList.length; i++){
                let date = tempList[i];
                testDateList.push(parseInt(date));
              }
              console.log(Object.keys(_testList), testDateList);

              //표의 모든 요소를 loop로 돌아본다
              for(let i=0; i<testDateList.length; i++){
                let date = testDateList[i];
                //testList의 i번째 데이터 = i번째 날짜의 시험 결과
                //여기에 정보가 존재한다면 i번째 날은 시험을 본 것이다.

               
                let dDate = await AsyncStorage.getItem('lastDate');

                //시험 정보가 있는 날(correctCount != -1 )
                if(date != 7 && date != 14){
                  // 0<=i<=6
                  if( ((date-1) / 7) < 1){
                    _tableData1[0][date-1] = 'v';  
                  }
                  // 7<=i<=13
                  else{
                    _tableData2[0][date-8] = 'v';  
                  }
                }
                //시험 정보가 있는 날인데 그 날이 7, 14일째라면
                else if( date == 7 || date == 14){
                  //체크 표시와 링크 문구를 함계 표에 표기해한다

                  //link DB를 가져온다
                  let linkDB = this.state.linkList;
                  //7일째라면
                  if(date==7){
                    let link1 = linkDB[0]["link"];
                    let returnDOM1;

                    returnDOM1 = <View >
                      {/* <Text style={{fontSize:14}}>v</Text> */}
                      <Text style={{fontSize:11, color: 'blue', alignContent:'center', textAlign: 'center'}} onPress={() => {OpenInvestigationLink(this.state.nowDdate, link1, 7)}}>
                        설문조사{"\n"}v
                      </Text>
                    </View>;

                    _tableData1[0][6] = returnDOM1;
                  }

                  //14일째라면
                  else if(date==14){
                    let link2 = linkDB[1]["link"];
                    let returnDOM2;

                    returnDOM2 = <View >
                      {/* <Text style={{fontSize:14}}>v</Text> */}
                      <Text style={{fontSize:11, color: 'blue', alignContent:'center', textAlign: 'center'}} onPress={() => {OpenInvestigationLink(this.state.nowDdate, link2, 14)}}>
                        설문조사{"\n"}v
                      </Text>
                    </View>;

                    _tableData2[0][6] = returnDOM2;
                  }
                }
                //시험 정보가 없는 날(correctCount == -1)
                else if(date != 7 && date != 14){
                  //do nothing
                }
              }
              
              this.setState({
                tableData1: _tableData1,
                tableData2: _tableData2
              })

              console.log("newwww change check table!!");
            }
              //해당 날짜에 시험을 수행하지 않았다면
            catch(e){
              console.log("there's no test result", e);
            }
          })();
        });
      });
    }
    componentDidMount(){
      //헤더를 수정
      this.getData();
      // console.log('---------------in didmout');

      this.checkedTestDB();
    }
  
    //헤더 수정 함수
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

    //설문조사 링크를 DOM으로 생성 후 표에 넣는 함수
    MakeInvestigationLink(){
      let linkDB = this.state.linkList;
    
      let link1 = linkDB[0]["link"];
      let link2 = linkDB[1]["link"];
    
      console.log('link1 link2', link1, link2);
      let returnDOM1;
      let returnDOM2;
    
      returnDOM1 = <View >
        <Text style={{fontSize:11, color: 'blue', alignContent:'center', textAlign: 'center'}} onPress={() => {OpenInvestigationLink(this.state.nowDdate, link1, 7)}}>
          설문조사
        </Text>
      </View>;
    
      returnDOM2 = <View >
        <Text style={{fontSize:11, color: 'blue', alignContent:'center', textAlign: 'center'}} onPress={() => {OpenInvestigationLink(this.state.nowDdate, link2, 14)}}>
          설문조사
        </Text>
      </View>;
      
      //class state에서 tabledata들을 복사k
      let _tableData1 = [...this.state.tableData1];
      let _tableData2 = [...this.state.tableData2];
      
      //7, 14일차 설문조사 링크 포함
      _tableData1[0][6] = returnDOM1;
      _tableData2[0][6] = returnDOM2;

      console.log("tabledata ", _tableData1, _tableData2);

      this.setState({
        tableData1: _tableData1,
        tableData2: _tableData2
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
                backgroundColor: '#8EE4AF',
                justifyContent: 'center', 
            }}>
                <View style={{
                    flex: 1,
                    
                    borderRadius: 10,
                    justifyContent: 'center'
                }}>
                    <Text style={{
                        fontSize: 35,
                        textAlign: 'center',
                        margin: 30
                        }}>
                        실험 {this.state.nowDdate}일차
                    </Text>
                </View>
                

                {/* 회색 바탕 */}
                <View elevation={10} style={{
                    flex: 4,
                    justifyContent: 'center',
                    backgroundColor: '#EFEFEF',
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    shadowColor: "#000000",
                    shadowOpacity: 0.9,
                    shadowRadius: 2,
                    shadowOffset: {
                    height: 10,
                    width: 10
                    }
                }}>
                  {/* 하얀색 카드 */}
                  <View elevation={10} style={{
                    margin: 15,
                    marginTop: 35,
                    padding: 5,
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                    borderBottomLeftRadius: 15,
                    borderBottomRightRadius: 15,
                    shadowColor: "#000000",
                    shadowOpacity: 0.4,
                    shadowRadius: 2,
                    shadowOffset: {
                    height: 5,
                    width: 5
                    }
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
                              <Col data={this.state.tableTitle} style={{height: 70, backgroundColor: '#f1f8ff'}} heightArr={[40,40,40,40,40]} textStyle={styles.text}/>
                              <Rows data={this.state.tableData1} flexArr={[1, 1, 1]} style={styles.row} textStyle={styles.text}/>
                          </TableWrapper>
                      </Table>
                    </View>
                    
                    <View style={{margin: 10}}>
                      <Table borderStyle={{borderWidth: 1}}>
                          <Row data={this.state.tableHead2} flexArr={[1, 1, 1, 1]} style={styles.head} textStyle={styles.text}/>
                          <TableWrapper style={styles.wrapper}>
                              <Col data={this.state.tableTitle} style={{height: 70, backgroundColor: '#f1f8ff'}} heightArr={[40,40,40,40,40]} textStyle={styles.text}/>
                              <Rows data={this.state.tableData2} flexArr={[1, 1, 1]} style={styles.row} textStyle={styles.text}/>
                          </TableWrapper>
                      </Table>
                    </View>
                    {/* <TouchableOpacity style={{width:80, backgroundColor:'beige'}} onPress={() => {initAsyncStorage()}}>
                      <Text>
                      delete AsyncStorage    
                      </Text>
                    </TouchableOpacity>   */}
                  </View>
              </View>
          </View>
        </View>
      )
    }
  }

//7, 14일차에만 링크가 열리도록
//targetDate로 7 혹은 14를 받음
function OpenInvestigationLink(nowDdate, link, targetDate){
  console.log("open link?? nowDdate is", nowDdate, targetDate);
  if(nowDdate == targetDate){
    Linking.openURL(link);  
  }
}

async function initAsyncStorage(){
  try{
    await AsyncStorage.removeItem('popTime');
    await AsyncStorage.removeItem('testResultTime');
    await AsyncStorage.removeItem('testResult');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('testNumber');
    await AsyncStorage.removeItem('birth');
    await AsyncStorage.removeItem('firstLoginTime');
    // console.log('remove popItem');
  }
  catch(e){
    // console.log('fail to remove popItem');
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white'},
  
  head: {  height: 30,  backgroundColor: '#8EE4AF'  },
  wrapper: { flexDirection: 'row' },
  title: { flex: 1, backgroundColor: '#f6f8fa' },
  row: {  height: 50  },
  text: { textAlign: 'center', fontSize: 15},
  
  
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