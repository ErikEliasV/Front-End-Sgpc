import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useProjectStore, Project } from '@/store/useProjectStore';
import { useKanbanStore } from '@/store/useKanbanStore';
import { Plus, X, Folder, Trash2, Users, Columns, List } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';
import { AddTaskModal } from '@/components/AddTaskModal';
import { ColumnManagement } from '@/components/ColumnManagement';
import { UserManagement } from '@/components/UserManagement';
import { Column, TeamMember } from '@/types/task';

interface ProjectManagementProps {
  visible: boolean;
  onClose: () => void;
  onProjectSelected: (project: Project) => void;
  isCurrentProjectManagement?: boolean;
  currentProject?: Project | null;
}

export function ProjectManagement({ 
  visible, 
  onClose, 
  onProjectSelected,
  isCurrentProjectManagement,
  currentProject
}: ProjectManagementProps) {
  const theme = useTheme();
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Estados para os novos modais
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showColumnManagement, setShowColumnManagement] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);

  // Usar o store do Kanban para colunas reais
  const { getProjectColumns, addColumn, updateColumn, deleteColumn, reorderColumns, addTask } = useKanbanStore();

  // Mock data para usuários (será substituído por dados reais)
  const [projectUsers, setProjectUsers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@email.com',
      role: 'admin',
      permissions: {
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: true,
        canMoveTask: true,
        canManageTeam: true,
      },
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      role: 'member',
      permissions: {
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: false,
        canMoveTask: true,
        canManageTeam: false,
      },
    },
  ]);

  // Obter colunas reais do projeto
  const projectColumns = currentProject ? getProjectColumns(currentProject.id) : [];

  const {
    projects,
    isLoading,
    error,
    getProjects,
    createProject,
    deleteProject,
  } = useProjectStore();

  useEffect(() => {
    if (visible) {
      loadProjects();
    }
  }, [visible]);

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

  const handleSelectProject = (project: Project) => {
    onProjectSelected(project);
    onClose();
  };

  const handleDeleteProject = (project: Project) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir o projeto "${project.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(project.id);
              Alert.alert('Sucesso', 'Projeto excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o projeto');
            }
          },
        },
      ]
    );
  };

  const handleAddTask = (taskData: {
    title: string;
    description: string;
    priority: any;
    assignees: string[];
  }) => {
    if (!currentProject) {
      Alert.alert('Erro', 'Projeto não encontrado');
      return;
    }

    // Pegar a primeira coluna do projeto para colocar a tarefa
    const firstColumn = projectColumns[0];
    
    if (!firstColumn) {
      Alert.alert('Erro', 'Nenhuma coluna encontrada no projeto');
      return;
    }

    // Criar a tarefa usando o store do Kanban
    const newTask = {
      title: taskData.title,
      description: taskData.description,
      status: 'todo' as any,
      priority: taskData.priority,
      assigneeId: taskData.assignees[0] || 'default-member',
      projectId: currentProject.id,
      columnId: firstColumn.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      estimatedHours: 1,
      spentHours: 0,
      materials: [],
      attachments: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTask(newTask);
    Alert.alert('Sucesso', 'Tarefa criada com sucesso!');
  };

  const handleSaveColumns = (columns: Column[]) => {
    // Atualizar as colunas no store do Kanban
    reorderColumns(columns);
    Alert.alert('Sucesso', 'Colunas atualizadas com sucesso!');
  };

  const handleSaveUsers = (users: TeamMember[]) => {
    setProjectUsers(users);
    Alert.alert('Sucesso', 'Usuários atualizados com sucesso!');
  };

  const renderProjectCard = ({ item: project }: { item: Project }) => (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor: theme.colors.card }]}
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
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
          onPress={() => handleDeleteProject(project)}
        >
          <Trash2 size={16} color={theme.colors.error} />
        </TouchableOpacity>
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

  const renderContent = () => {
    // Se for gerenciamento do projeto atual
    if (isCurrentProjectManagement && currentProject) {
      return renderCurrentProjectManagement();
    }

    // Se for gerenciamento geral de projetos
    if (isAddingProject) {
      return renderAddProjectForm();
    }

    return renderProjectsList();
  };

  const renderCurrentProjectManagement = () => (
    <View style={styles.currentProjectContainer}>
      <View style={styles.currentProjectHeader}>
        <Folder size={32} color={theme.colors.primary} />
        <View style={styles.currentProjectInfo}>
          <Text style={[styles.currentProjectTitle, { color: theme.colors.text }]}>
            {currentProject?.name}
          </Text>
          <Text style={[styles.currentProjectDescription, { color: theme.colors.textSecondary }]}>
            {currentProject?.description}
          </Text>
        </View>
      </View>

      <View style={styles.managementOptions}>
        <TouchableOpacity
          style={[styles.managementOption, { backgroundColor: theme.colors.card }]}
          onPress={() => {
            setShowAddTaskModal(true);
          }}
        >
          <List size={20} color={theme.colors.primary} />
          <Text style={[styles.managementOptionText, { color: theme.colors.text }]}>
            Adicionar Tarefa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.managementOption, { backgroundColor: theme.colors.card }]}
          onPress={() => {
            setShowColumnManagement(true);
          }}
        >
          <Columns size={20} color={theme.colors.primary} />
          <Text style={[styles.managementOptionText, { color: theme.colors.text }]}>
            Gerenciar Colunas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.managementOption, { backgroundColor: theme.colors.card }]}
          onPress={() => {
            setShowUserManagement(true);
          }}
        >
          <Users size={20} color={theme.colors.primary} />
          <Text style={[styles.managementOptionText, { color: theme.colors.text }]}>
            Gerenciar Usuários
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProjectsList = () => (
    <>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Gerenciar Projetos
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setIsAddingProject(true)}
        >
          <Plus size={20} color="white" />
          <Text style={styles.addButtonText}>Novo Projeto</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Carregando projetos...
          </Text>
        </View>
      ) : error ? (
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
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {isCurrentProjectManagement ? 'Gerenciar Projeto' : 'Gerenciar Projetos'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {renderContent()}
        </View>

        {/* Modais */}
        <AddTaskModal
          visible={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onAddTask={handleAddTask}
          projectId={currentProject?.id || ''}
        />

        <ColumnManagement
          visible={showColumnManagement}
          onClose={() => setShowColumnManagement(false)}
          onSaveColumns={handleSaveColumns}
          projectId={currentProject?.id || ''}
          currentColumns={projectColumns}
        />

        <UserManagement
          visible={showUserManagement}
          onClose={() => setShowUserManagement(false)}
          onSaveUsers={handleSaveUsers}
          projectId={currentProject?.id || ''}
          currentUsers={projectUsers}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
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
  deleteButton: {
    padding: 8,
    borderRadius: 6,
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
  currentProjectContainer: {
    flex: 1,
    padding: 20,
  },
  currentProjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentProjectInfo: {
    marginLeft: 12,
    flex: 1,
  },
  currentProjectTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentProjectDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  managementOptions: {
    gap: 12,
  },
  managementOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  managementOptionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
}); 