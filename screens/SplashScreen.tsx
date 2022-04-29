import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = () => {

    const navigation = useNavigation(); 

    useEffect(() => {
      const checkUser = async () => {
        if(await isAuthenticated()) {
            navigation.navigate('Home');
        } else {
            navigation.navigate('SignIn');
        } 
      }

      checkUser();
    }, [])

    const isAuthenticated = async () => {
        //await AsyncStorage.removeItem('token');
        const token = await AsyncStorage.getItem('token');
        return !!token;
    }
    
  return (
    <View style={[styles.container, styles.horizontal]}>
      <ActivityIndicator size="small" color="#0000ff" />
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center"
    },
    horizontal: {
      flexDirection: "row",
      justifyContent: "space-around",
      padding: 10
    }
});

export default SplashScreen