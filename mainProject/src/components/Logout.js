import React, { useContext, useState, useEffect }from 'react';
import { View, StyleSheet, TouchableOpacity, Text, AsyncStorage } from 'react-native';          
                
import { AuthContext } from '../navigation/AuthProvider';
             
export default function LogoutButton({restDate, userName}) {
    const { logout } = useContext(AuthContext);
    const {name, setName} = useState('');
    const {date, setDate} = useState('');

    console.log("----------------------in header", restDate, userName);

    return (
        <View style={{
            flex: 1,
            flexDirection: 'row'
        }}>
            <View style={{
                flex: 3,
                justifyContent: 'center',
                
            }}>
                <Text style={{
                    fontSize: 20
                }}>
                    D+{restDate} 안녕하세요 {userName}님
                </Text>
            </View>
            
            <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-around',
                
                
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
        marginTop: 10,
        width: 100,
        height: 40,
        backgroundColor: 'lightgreen',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8
      },
});

//local에 저장된 로그인 정보들을 삭제
function logoutAndExit(){
    
    
    
    console.log("logout");
    const saveUser = async () => {
        try{
        await AsyncStorage.setItem('user', '');
        console.log("save name to null");
        }
        catch(e){
        console.log("fail to save name", e);
        }
    }
    const saveBirth = async () => {
        try{
        await AsyncStorage.setItem('birth', '');
        console.log("save birth to null");
        }
        catch(e){
        console.log("fail to save birth", e);
        }
    }
    const saveNumber = async () => {
        try{
        await AsyncStorage.setItem('testNumber', '');
        console.log("save number to null");
        }
        catch(e){
        console.log("fail to save number", e);
        }
    }

    saveUser();
    saveBirth();
    saveNumber();

    (async () => {
        await AsyncStorage.removeItem('firstLoginTime');
    })();
    
}
            