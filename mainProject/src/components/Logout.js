import React, { useContext, useState, useEffect }from 'react';
import { Dimensions, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'       
                
import { AuthContext } from '../navigation/AuthProvider';
             
var {height, width} = Dimensions.get('window');

//로그아웃 버튼, 상단 헤더 DOM 생성 후 출력
export default function LogoutButton({restDate, userName}) {
    const { logout } = useContext(AuthContext);
    const {name, setName} = useState('');
    const {date, setDate} = useState('');

    // console.log("----------------------in header", restDate, userName);

    return (
        <View style={{
            flex: 1,
            // position: 'relative',
            flexWrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'space-between',
            //alignContent: 'center',
            alignItems: 'center',
            // backgroundColor: 'yellow'
        }}>
            <Text style={{
                marginRight: 15,
                fontSize: 17
            }}>
                D+{restDate} 안녕하세요 {userName}님 
            </Text>
            <TouchableOpacity 
                style={styles.buttonContainer} onPress={ () => {logoutAndExit(); logout();} }>
                <Text style={{fontSize: 14}}>Logout</Text>
            </TouchableOpacity> 
        </View>
    );
}


  
const styles = StyleSheet.create({
    buttonContainer: {
        width: 80,
        // position: 'absolute',
        backgroundColor: '#F4DECB',
        padding: 10,
        alignItems: 'center',
        borderRadius: 30
      },
});

//local에 저장된 로그인 정보들을 삭제
function logoutAndExit(){
    
    
    
    // console.log("logout");
    const saveUser = async () => {
        try{
        await AsyncStorage.setItem('user', '');
        // console.log("save name to null");
        }
        catch(e){
        // console.log("fail to save name", e);
        }
    }
    const saveBirth = async () => {
        try{
        await AsyncStorage.setItem('birth', '');
        // console.log("save birth to null");
        }
        catch(e){
        // console.log("fail to save birth", e);
        }
    }
    const saveNumber = async () => {
        try{
        await AsyncStorage.setItem('testNumber', '');
        // console.log("save number to null");
        }
        catch(e){
        // console.log("fail to save number", e);
        }
    }

    saveUser();
    saveBirth();
    saveNumber();

    (async () => {
        await AsyncStorage.removeItem('firstLoginTime');
    })();
    
}
            