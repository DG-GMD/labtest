import React, { useContext, useState, useEffect }from 'react';
import { View, StyleSheet, TouchableOpacity, Text, AsyncStorage } from 'react-native';          
                
import { AuthContext } from '../navigation/AuthProvider';
             
//로그아웃 버튼, 상단 헤더 DOM 생성 후 출력
export default function LogoutButton({restDate, userName}) {
    const { logout } = useContext(AuthContext);
    const {name, setName} = useState('');
    const {date, setDate} = useState('');

    // console.log("----------------------in header", restDate, userName);

    return (
        <View style={{
            flex: 1,
            flexDirection: 'row',
        }}>
            <View style={{
                flex: 3,
                justifyContent: 'center',
                
            }}>
                <Text style={{
                    marginLeft: 10,
                    fontSize: 20
                }}>
                    D+{restDate} 안녕하세요 {userName}님
                </Text>
            </View>
            
            <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
            }}>
                <TouchableOpacity 
                    style={styles.buttonContainer} onPress={ () => {logoutAndExit(); logout();} }>
                    <Text>Log out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


  
const styles = StyleSheet.create({
    buttonContainer: {
        
        width: 100,
        height: 40,
        backgroundColor: '#F4DECB',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40
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
            