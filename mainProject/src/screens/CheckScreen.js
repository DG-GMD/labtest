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
      this.MakeInvestigationLink = this.MakeInvestigationLink.bind(this);

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
        nowDdate: 1
      };
      
      //현재 로그인한 사용자의 연구번호를 가져온다
      (async () => {
        let testNumber = await AsyncStorage.getItem('testNumber');
        // console.log("first testNumber ", testNumber);
        return testNumber;
      })()
      .then((testNumber) => {
        //연구번호를 이용해 해당 유저의 시험 정보에 접근
        // console.log("second testNumber ", testNumber);
        database()
        .ref('/users/' + testNumber + '/test')
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
                if(correctCount != -1 && i != 7 && i != 14){
                  let x = parseInt((i-1) / 2);
                  let y = parseInt((i-1) % 2);
                  // console.log('count != -1, i : ', i, x, y);
                  _tableData[x][y] = '✅';
                }
                //시험 정보가 없는 날(correctCount == -1)
                else if(i != 7 && i != 14){
                  let x = i / 2;
                  let y = i % 2;
                  // console.log('count == -1, i : ', i);
                  _tableData[x][y] = '';
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

    MakeInvestigationLink(){
      let linkDB = this.state.linkList;
    
      let link1 = linkDB[0]["link"];
      let link2 = linkDB[1]["link"];
    
      console.log('link1 link2', link1, link2);
      let returnDOM1;
      let returnDOM2;
    
      returnDOM1 = <View style={{padding: 10}}>
        <Text style={{fontSize:13, color: 'blue', alignContent:'center', textAlign: 'center'}} onPress={() => {OpenInvestigationLink(this.state.nowDdate, link1, 7)}}>
          설문조사
        </Text>
      </View>;
    
      returnDOM2 = <View style={{padding: 10}}>
        <Text style={{fontSize:13, color: 'blue', alignContent:'center', textAlign: 'center'}} onPress={() => {OpenInvestigationLink(this.state.nowDdate, link2, 14)}}>
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
                  <View elevation={10} style={{
                    margin: 25,
                    padding: 10,
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                    borderBottomLeftRadius: 15,
                    borderBottomRightRadius: 15,
                    shadowColor: "#000000",
                    shadowOpacity: 0.9,
                    shadowRadius: 2,
                    shadowOffset: {
                    height: 10,
                    width: 10
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
                    <TouchableOpacity style={{width:80, backgroundColor:'beige'}} onPress={() => {initAsyncStorage()}}>
              <Text>
              delete AsyncStorage    
              </Text>
            </TouchableOpacity>  
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
    console.log('remove popItem');
  }
  catch(e){
    console.log('fail to remove popItem');
  }
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white'},
  
  head: {  height: 30,  backgroundColor: '#8EE4AF'  },
  wrapper: { flexDirection: 'row' },
  title: { flex: 1, backgroundColor: '#f6f8fa' },
  row: {  height: 50  },
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