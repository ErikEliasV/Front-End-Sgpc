import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useProjectStore, Project } from '@/store/useProjectStore';
import { useTheme } from '@/constants/theme';
import { Folder, Plus, Check } from 'lucide-react-native';

interface ProjectSelectionProps {
  onProjectSelected: (project: Project) => void;
}

export function ProjectSelection({ onProjectSelected }: ProjectSelectionProps) {
  const theme = useTheme();
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const {
    projects,
    isLoading,
    error,
    getProjects,
    createProject,
    selectProject,
  } = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    await getProjects();
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Erro', 'Nome do projeto é obrigatório');
      return;
    }

    try {
      await createProject(newProjectName, newProjectDescription);
      setNewProjectName('');
      setNewProjectDescription('');
      setIsAddingProject(false);
      Alert.alert('Sucesso', 'Projeto criado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o projeto');
    }
  };

  const handleSelectProject = async (project: Project) => {
    try {
      await selectProject(project.id);
      onProjectSelected(project);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar o projeto');
    }
  };

  const renderProjectCard = ({ item: project }: { item: Project }) => (
    <TouchableOpacity
      style={[
        styles.projectCard,
        { backgroundColor: theme.colors.card },
        project.isActive && { borderColor: theme.colors.primary, borderWidth: 2 }
      ]}
      onPress={() => handleSelectProject(project)}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectInfo}>
          <Folder size={24} color={theme.colors.primary} />
          <View style={styles.projectText}>
            <Text style={[styles.projectName, { color: theme.colors.text }]}>
              {project.name}
            </Text>
            <Text style={[styles.projectDescription, { color: theme.colors.textSecondary }]}>
              {project.description}
            </Text>
          </View>
        </View>
        {project.isActive && (
          <Check size={20} color={theme.colors.primary} />
        )}
      </View>
      
      <View style={styles.projectMeta}>
        <Text style={[styles.projectDate, { color: theme.colors.textSecondary }]}>
          Criado em: {new Date(project.createdAt).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderAddProjectForm = () => (
    <View style={[styles.addProjectForm, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.formTitle, { color: theme.colors.text }]}>
        Novo Projeto
      </Text>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Nome do projeto"
        placeholderTextColor={theme.colors.textSecondary}
        value={newProjectName}
        onChangeText={setNewProjectName}
      />
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Descrição (opcional)"
        placeholderTextColor={theme.colors.textSecondary}
        value={newProjectDescription}
        onChangeText={setNewProjectDescription}
        multiline
        numberOfLines={3}
      />
      
      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setIsAddingProject(false)}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleCreateProject}
        >
          <Text style={styles.saveButtonText}>Criar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Carregando projetos...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={loadProjects}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Projetos
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setIsAddingProject(true)}
        >
          <Plus size={20} color="white" />
          <Text style={styles.addButtonText}>Novo Projeto</Text>
        </TouchableOpacity>
      </View>

      {isAddingProject ? (
        renderAddProjectForm()
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProjectCard}
          keyExtractor={(project) => project.id}
          contentContainerStyle={styles.projectsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Folder size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Nenhum projeto encontrado
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Crie seu primeiro projeto para começar
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  projectsList: {
    paddingBottom: 20,
  },
  projectCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  projectText: {
    marginLeft: 12,
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  projectMeta: {
    marginTop: 8,
  },
  projectDate: {
    fontSize: 12,
  },
  addProjectForm: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 