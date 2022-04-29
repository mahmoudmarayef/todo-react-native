import { StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import React, { useState, useEffect } from 'react';

import TodoItem from '../components/TodoItem/Index';

let id = '4';

export default function TodoScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState([
    {
      id: '1',
      content: 'Buy ilk',
      isCompleted: true,
    },
    {
      id: '2',
      content: 'Buy Tea',
      isCompleted: true,
    },
    {
      id: '3',
      content: 'Pour milk',
      isCompleted: false,
    },
  ]);

  const createNewItem = (atIndex: number) => {
    const newTodos = [...todos];
    newTodos.splice(atIndex, 0, {
      id: id,
      content: "",
      isCompleted: false
    })
    setTodos(newTodos);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={'Title'}
        style={styles.title}
      />

      <FlatList
        data={todos}
        renderItem={({ item, index }) => <TodoItem todo={item} onSubmit={() => createNewItem(index + 1)} />}
        style={{ width: '100%' }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    color: 'black'
  },
  title: {
    width: '100%',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
