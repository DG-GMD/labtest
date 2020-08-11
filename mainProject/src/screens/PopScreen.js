import React, { useContext } from 'react';
import { View, Text, Image, ScrollView, TextInput, Button, BackHandler, StyleSheet, Platform, TouchableOpacity, AsyncStorage } from 'react-native';
import { alarmModule } from '../utils/jvmodules'
import { AuthContext } from '../navigation/AuthProvider';

function startDict(admit) {
    console.log("admit", admit);
    alarmModule.startDict(admit);
}

export default function Pop({navigation}){
    const { setSkip } = useContext(AuthContext);

    //popScreen이 표시된 시간을 로컬 저장소에 저장
    (async () => {
        let now = new Date();
        await AsyncStorage.setItem('popTime', now.getTime);
    })();

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
            }}
        >
            <View style={{margin: 20, flex:1, flexDirection: 'row'}}>
                <Text style={{fontSize: 25, alignSelf:'center'}}>
                    단어테스트를 보시겠습니까?
                </Text>
            </View>
            <View style={{
                flex:1,
                flexDirection: 'row',
                }}>
                <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress = {() => {
                        startDict(true);
                        setSkip(2);
                    }} 
                >
                    <Text>
                        예
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonContainer}
                    onPress = {() => {
                        startDict(false);
                        BackHandler.exitApp();
                    }} 
                >
                    <Text>
                        아니요
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 10,
        width: 80,
        height: 40,
        backgroundColor: 'lightgreen',
        padding: 10,
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    PickerContainer: {
        width: 100,
        height: 170,
        marginHorizontal: 20,
        alignItems: 'center',
    },
});
