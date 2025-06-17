import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useProjectStore, Project } from '@/store/useProjectStore';
import { useTheme } from '@/constants/theme';
import { ProjectSelection } from '@/components/ProjectSelection';
import { ProjectManagement } from '@/components/ProjectManagement';
import { KanbanBoard } from '@/components/KanbanBoard';
import { SimpleHeader } from '@/components/SimpleHeader';
import { Settings, Folder } from 'lucide-react-native';

export default function HomeScreen() {
  const theme = useTheme();
  const [showProjectManagement, setShowProjectManagement] = useState(false);
  const { currentProject, clearCurrentProject } = useProjectStore();

  console.log('HomeScreen render - currentProject:', currentProject);

  const handleProjectSelected = (project: Project) => {
    // Projeto já foi selecionado no store, não precisa fazer nada aqui
    console.log('Projeto selecionado:', project.name);
  };

  const handleOpenProjectManagement = () => {
    setShowProjectManagement(true);
  };

  const handleCloseProjectManagement = () => {
    setShowProjectManagement(false);
  };

  const handleBackToProjectSelection = () => {
    clearCurrentProject();
  };

  // Se não há projeto selecionado, mostrar tela de seleção
  if (!currentProject) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ProjectSelection onProjectSelected={handleProjectSelected} />
      </View>
    );
  }

  // Se há projeto selecionado, mostrar o Kanban
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SimpleHeader
        title={currentProject.name}
        onPress={handleOpenProjectManagement}
        onBackPress={handleBackToProjectSelection}
      />
      
      <View style={styles.content}>
        <KanbanBoard projectId={currentProject.id} />
      </View>

      <ProjectManagement
        visible={showProjectManagement}
        onClose={handleCloseProjectManagement}
        onProjectSelected={handleProjectSelected}
        isCurrentProjectManagement={true}
        currentProject={currentProject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  content: {
    flex: 1,
  },
});
