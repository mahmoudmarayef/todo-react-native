import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface ProjectItemProps {
    project: {
      id: string,
      title: string,
      createdAt: string,
    }
}

const ProjectItem = ({ project }: ProjectItemProps) => {
  const navigation = useNavigation();

  const onPress = () => {
    navigation.navigate('Todo', { id: project.id })
  }
  return (
    <Pressable onPress={onPress} style={styles.root}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="file-outline" size={24} color="black" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.title}>{project.title}</Text>
          <Text style={styles.time}>{project.createdAt}</Text>
        </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      width: '100%',
      padding: 10
    },
  
    iconContainer: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
      backgroundColor: 'gray',
      marginRight: 10,
    },
  
    title: {
      fontSize: 20,
      marginRight: 4,
    },
  
    time: {
      color: 'black'
    },
});

export default ProjectItem