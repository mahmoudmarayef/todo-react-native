import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useMutation, gql } from '@apollo/client';

const SIGN_UP_MUTATION = gql`
    mutation signUp($email: String!, $password: String!, $name: String!) {
        signUp(input: {
        email: $email,
        password: $password,
        name: $name,
        }) {
        token
        user {
            id
            name
        }
        }
    }
`;

const SignUpScreen = () => {
    const [name, seName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigation = useNavigation();

    // mutation[0] : A function to trigger the mutation
    // mutation[1] : result object
    // { data, error, loading }
    const [signUp, { data, error, loading }] = useMutation(SIGN_UP_MUTATION);

    if (error) {
        Alert.alert('Error Signing up');
    }

    if (data) {
        AsyncStorage.setItem('token', data.signUp.token).then(() => {navigation.navigate('Home')});
    }

    const onSubmit = () => {
        signUp({variables: { email, name, password }})
    }

  return (
    <View style={{ padding: 20 }}>
        <TextInput
            placeholder='example@example.com'
            value={email}
            onChangeText={setEmail}
            style={{
                color: 'black',
                fontSize: 18,
                width: '100%',
                marginVertical: 25,
            }}
        />


        <TextInput
            placeholder='Name'
            value={name}
            onChangeText={seName}
            style={{
                color: 'black',
                fontSize: 18,
                width: '100%',
                marginVertical: 25,
            }}
        />

        <TextInput
            placeholder='Password'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
                color: 'black',
                fontSize: 18,
                width: '100%',
                marginVertical: 25,
            }}
        />

        <Pressable 
            onPress={onSubmit}
            style={{
                backgroundColor: '#e33062',
                height: 50,
                borderRadius: 5,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 30,
            }}
        >
            {loading && <ActivityIndicator />}
            <Text 
                style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'bold'
                }}
            >
                Sign Up
            </Text>
        </Pressable>

        <Pressable 
            disabled={loading}
            onPress={() => navigation.navigate('SignIn')}
            style={{
                backgroundColor: '#e33062',
                height: 50,
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 30,
            }}
        >
            <Text 
                style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'bold'
                }}
            >
                Already have an account, Sign In
            </Text>
        </Pressable>
    </View>
  )
}

export default SignUpScreen