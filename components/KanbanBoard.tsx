import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  PanResponder,
  Animated,
  FlatList,
} from 'react-native';
import { useTheme } from '@/constants/theme';
import { useKanbanStore } from '@/store/useKanbanStore';
import { useTeamStore } from '@/store/useTeamStore';
import { TaskCard } from '@/components/TaskCard';
import { DraggableTaskCard } from '@/components/DraggableTaskCard';
import { AddTaskModal } from '@/components/AddTaskModal';
import { TaskPriority, Task, Column, TaskStatus } from '@/types/task';
import { Plus } from 'lucide-react-native';

interface KanbanBoardProps {
  projectId: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const theme = useTheme();
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [dragTargetColumn, setDragTargetColumn] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    columns,
    tasks,
    addTask,
    moveTask,
    updateTask,
    deleteTask,
    initializeProjectColumns,
    getProjectColumns,
    getProjectTasks,
    canMemberPerformAction,
  } = useKanbanStore();

  const {
    teams,
    currentProjectId,
    currentMemberId,
    setCurrentProject,
    setCurrentMember,
    addTeam,
    addTeamForProject,
  } = useTeamStore();

  useEffect(() => {
    // Inicializar com um time padrão se não existir
    if (teams.length === 0) {
      const defaultMemberId = 'admin-member';
      
      console.log('🆕 Criando novo time para projeto:', projectId);
      addTeamForProject(projectId, 'Time do Projeto', 'Time padrão do projeto', defaultMemberId);
      setCurrentProject(projectId);
      setCurrentMember(defaultMemberId);
    } else {
      // Verificar se já existe um time para este projeto
      const existingTeam = teams.find(t => t.id === projectId);
      if (existingTeam) {
        console.log('✅ Time encontrado para projeto:', projectId);
        setCurrentProject(projectId);
        // Usar o primeiro membro (admin) do time
        if (existingTeam.members.length > 0) {
          setCurrentMember(existingTeam.members[0].id);
        }
      } else {
        console.log('🆕 Criando novo time para projeto:', projectId);
        const defaultMemberId = 'admin-member';
        addTeamForProject(projectId, 'Time do Projeto', 'Time padrão do projeto', defaultMemberId);
        setCurrentProject(projectId);
        setCurrentMember(defaultMemberId);
      }
    }
  }, [teams, currentProjectId, addTeam, addTeamForProject, setCurrentProject, setCurrentMember, projectId]);

  useEffect(() => {
    if (projectId) {
      initializeProjectColumns(projectId);
    }
  }, [projectId, initializeProjectColumns]);

  const handleAddTask = (taskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    assignees: string[];
  }) => {
    if (!projectId || !currentMemberId) return;
    if (!canMemberPerformAction(projectId, currentMemberId, 'canCreateTask')) {
      Alert.alert('Erro', 'Você não tem permissão para criar tarefas neste projeto');
      return;
    }

    // Pegar a primeira coluna do projeto para colocar a tarefa
    const projectColumns = getProjectColumns(projectId);
    const firstColumn = projectColumns[0];
    
    if (!firstColumn) {
      Alert.alert('Erro', 'Nenhuma coluna encontrada no projeto');
      return;
    }

    const newTask: Omit<Task, 'id'> = {
      title: taskData.title,
      description: taskData.description,
      status: 'todo' as TaskStatus,
      priority: taskData.priority,
      assigneeId: taskData.assignees[0] || currentMemberId, // Usar o primeiro responsável
      projectId: projectId,
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
  };

  const handleMoveTask = (taskId: string, sourceColumnId: string, targetColumnId: string) => {
    if (!projectId || !currentMemberId) return;
    if (!canMemberPerformAction(projectId, currentMemberId, 'canMoveTask')) {
      Alert.alert('Erro', 'Você não tem permissão para mover tarefas neste projeto');
      return;
    }
    moveTask(taskId, targetColumnId, currentMemberId);
  };

  const handleTaskMove = (taskId: string, targetColumnId: string) => {
    // Encontrar a coluna atual da tarefa
    const task = projectTasks.find(t => t.id === taskId);
    if (task) {
      // Feedback visual
      setDragTargetColumn(targetColumnId);
      setTimeout(() => setDragTargetColumn(null), 500);
      
      handleMoveTask(taskId, task.columnId, targetColumnId);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    console.log('🎯 Drag iniciado - destacando colunas');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragTargetColumn(null);
    console.log('🎯 Drag finalizado');
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    if (!projectId || !currentMemberId) return;
    if (!canMemberPerformAction(projectId, currentMemberId, 'canEditTask')) {
      Alert.alert('Erro', 'Você não tem permissão para editar tarefas neste projeto');
      return;
    }
    updateTask(taskId, updates, currentMemberId);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!projectId || !currentMemberId) return;
    if (!canMemberPerformAction(projectId, currentMemberId, 'canDeleteTask')) {
      Alert.alert('Erro', 'Você não tem permissão para excluir tarefas neste projeto');
      return;
    }
    deleteTask(taskId);
  };

  const canCreateTask = projectId && currentMemberId && 
    canMemberPerformAction(projectId, currentMemberId, 'canCreateTask');

  const projectColumns = getProjectColumns(projectId);
  const projectTasks = getProjectTasks(projectId);

  // Debug logs
  useEffect(() => {
    console.log('🏗️ Colunas do projeto:', projectColumns.map(c => `${c.title} (${c.order})`));
    console.log('📝 Tarefas do projeto:', projectTasks.map(t => `${t.title} -> ${t.columnId}`));
    console.log('👤 Membro atual:', currentMemberId);
    console.log('🏢 Times disponíveis:', teams.map(t => `${t.name} (${t.id})`));
    
    if (currentMemberId && projectId) {
      const canMove = canMemberPerformAction(projectId, currentMemberId, 'canMoveTask');
      const canCreate = canMemberPerformAction(projectId, currentMemberId, 'canCreateTask');
      const canEdit = canMemberPerformAction(projectId, currentMemberId, 'canEditTask');
      const canDelete = canMemberPerformAction(projectId, currentMemberId, 'canDeleteTask');
      
      console.log('🔐 Permissões do membro atual:');
      console.log('  - Mover tarefas:', canMove);
      console.log('  - Criar tarefas:', canCreate);
      console.log('  - Editar tarefas:', canEdit);
      console.log('  - Deletar tarefas:', canDelete);
    }
  }, [projectColumns, projectTasks, currentMemberId, teams, projectId, canMemberPerformAction]);

  if (projectColumns.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
          Nenhuma coluna encontrada para este projeto
        </Text>
        <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
          Configure as colunas do seu Kanban para começar
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.columnsContainer}
        contentContainerStyle={styles.columnsContent}
      >
        {projectColumns
          .sort((a, b) => a.order - b.order)
          .map((column) => (
          <View 
            key={column.id} 
            style={[
              styles.column, 
              { 
                backgroundColor: theme.colors.card,
                borderWidth: dragTargetColumn === column.id ? 3 : (isDragging ? 1 : 0),
                borderColor: dragTargetColumn === column.id ? theme.colors.primary : theme.colors.border,
                transform: [{ scale: dragTargetColumn === column.id ? 1.02 : 1 }],
                opacity: isDragging && dragTargetColumn !== column.id ? 0.7 : 1,
              }
            ]}
          >
            <View style={styles.columnHeader}>
              <Text style={[styles.columnTitle, { color: theme.colors.text }]}>
                {column.title}
              </Text>
              <Text style={[styles.columnCount, { color: theme.colors.textSecondary }]}>
                {projectTasks.filter((task) => task.columnId === column.id).length}
              </Text>
            </View>
            
            <FlatList
              data={projectTasks.filter((task) => task.columnId === column.id)}
              renderItem={({ item: task }) => (
                <DraggableTaskCard
                  task={task}
                  onDelete={handleDeleteTask}
                  onMove={handleTaskMove}
                  columnId={column.id}
                  columnOrder={column.order}
                  allColumns={projectColumns.map(col => ({
                    id: col.id,
                    order: col.order,
                    title: col.title
                  }))}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  canEdit={currentMemberId ? 
                    canMemberPerformAction(projectId!, currentMemberId, 'canEditTask') : 
                    false
                  }
                  canDelete={currentMemberId ? 
                    canMemberPerformAction(projectId!, currentMemberId, 'canDeleteTask') : 
                    false
                  }
                />
              )}
              keyExtractor={(task) => task.id}
              style={styles.tasksList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ))}
      </ScrollView>

      {/* Botão de adicionar tarefa */}
      <View style={{ position: 'absolute', bottom: 20, right: 20 }}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setIsAddTaskModalVisible(true)}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      <AddTaskModal
        visible={isAddTaskModalVisible}
        onClose={() => setIsAddTaskModalVisible(false)}
        onAddTask={handleAddTask}
        projectId={projectId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  columnsContainer: {
    flex: 1,
  },
  columnsContent: {
    padding: 16,
  },
  column: {
    width: 300,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  columnCount: {
    fontSize: 16,
  },
  tasksList: {
    flex: 1,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 