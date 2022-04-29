import { View, TextInput } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Checkbox from '../Checkbox/Index';

interface TodoItemProps {
    todo: {
        id: string;
        content: string;
        isCompleted: boolean;
    },
    onSubmit: () => void
}

const TodoItem = ({ todo, onSubmit }: TodoItemProps) => {
    const [isChecked, setIsChecked] = useState(true);
    const [content, setContent] = useState("");

    const input = useRef(null);

    useEffect(() => {
        if (!todo) { return }

        setIsChecked(todo.isCompleted);
        setContent(todo.content);
    }, [todo])

    useEffect(() => {
        // get foucs on input
        if (input.current) {
            input.current?.focus();
        }
    }, [input])
    
    const onKeyPress = ({ nativeEvent }) => {
        if (nativeEvent.key === 'Backspace' && content === '') {
            // Delete Item
            console.warn('Delete item');
        }
    }

  return (
    <View style={{ flexDirection: 'row', marginVertical: 3 }}>
        {/* Checkbox */}
        <Checkbox 
          isChecked={isChecked}
          onPress={() => { setIsChecked(!isChecked) }}
        />


        {/* Text Input */}
        <TextInput
          ref={input}
          value={content}
          onChangeText={setContent}
          style={{
            flex: 1,
            fontSize: 18,
            color: 'black',
            marginLeft: 12,
          }}
          multiline
          onSubmitEditing={onSubmit}
          blurOnSubmit
          onKeyPress={onKeyPress}
        />
    </View>
  )
}

export default TodoItem