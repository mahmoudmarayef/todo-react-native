import { StyleSheet, FlatList } from 'react-native';
import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { useState } from 'react';

import ProjectItem from '../components/ProjectItem/Index';

export default function ProjectsScreen() {
  const [project, setProject] = useState([
    {
      id: '1',
      title: 'project 1',
      createdAt: '2d',
    },
    {
      id: '2',
      title: 'project 2',
      createdAt: '2d',
    },
    {
      id: '3',
      title: 'project 3',
      createdAt: '2d',
    },
  ]);

  return (
    <View style={styles.container}>
      {/* Project/Task List */}
      <FlatList
        data={project}
        renderItem={({item}) => <ProjectItem project={item} />}
        style={{ width: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
