import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatePicker } from '../../components';

const Tasks = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [kanbanData, setKanbanData] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);

  // Parâmetros da navegação
  const { selectedProjectId } = route.params || {};

  // Estados para criação/edição de tarefa
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'A_FAZER',
    startDatePlanned: '',
    endDatePlanned: '',
    startDateActual: '',
    endDateActual: '',
    progressPercentage: 0,
    priority: 1,
    estimatedHours: '',
    actualHours: '',
    notes: '',
    assignedUserId: null
  });

  // URLs da API
  const API_BASE = 'https://sgpc-api.koyeb.app/api';

  // Status das tarefas
  const taskStatuses = [
    { key: 'A_FAZER', label: 'A Fazer', color: '#6c757d', column: 'afazer' },
    { key: 'EM_ANDAMENTO', label: 'Em Andamento', color: '#007AFF', column: 'emAndamento' },
    { key: 'CONCLUIDA', label: 'Concluída', color: '#28a745', column: 'concluidas' },
    { key: 'BLOQUEADA', label: 'Bloqueada', color: '#ffc107', column: 'bloqueadas' },
    { key: 'CANCELADA', label: 'Cancelada', color: '#dc3545', column: 'canceladas' }
  ];

  // Prioridades
  const priorities = [
    { value: 1, label: 'Baixa', color: '#28a745' },
    { value: 2, label: 'Média', color: '#ffc107' },
    { value: 3, label: 'Alta', color: '#fd7e14' },
    { value: 4, label: 'Crítica', color: '#dc3545' }
  ];

  // Função para obter o token de autenticação
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  };

  // Função para criar headers com autenticação
  const getAuthHeaders = async () => {
    const token = await getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  // Carregar projetos
  const loadProjects = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  // Carregar dados do Kanban
  const loadKanbanData = async (projectId) => {
    setKanbanLoading(true);
    setKanbanData(null); // Limpar dados anteriores
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/${projectId}/tasks/kanban`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setKanbanData(data);
      } else {
        console.error('Erro na resposta da API:', response.status);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do Kanban:', error);
    } finally {
      setKanbanLoading(false);
    }
  };

  // Carregar usuários disponíveis
  const loadAvailableUsers = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/users`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  // Criar nova tarefa
  const createTask = async () => {
    if (!selectedProject) {
      Alert.alert('Erro', 'Selecione um projeto primeiro.');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/${selectedProject.id}/tasks`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          ...taskForm,
          progressPercentage: parseInt(taskForm.progressPercentage) || 0,
          priority: parseInt(taskForm.priority) || 1,
          estimatedHours: parseFloat(taskForm.estimatedHours) || 0,
          actualHours: parseFloat(taskForm.actualHours) || 0,
          assignedUserId: taskForm.assignedUserId || null
        }),
      });
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Tarefa criada com sucesso!');
        setShowCreateModal(false);
        resetForm();
        loadKanbanData(selectedProject.id);
      } else {
        Alert.alert('Erro', 'Falha ao criar tarefa.');
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      Alert.alert('Erro', 'Erro de conexão.');
    }
  };

  // Editar tarefa existente
  const editTask = async () => {
    if (!selectedProject || !selectedTask) {
      Alert.alert('Erro', 'Dados da tarefa não encontrados.');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/${selectedProject.id}/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          ...taskForm,
          progressPercentage: parseInt(taskForm.progressPercentage) || 0,
          priority: parseInt(taskForm.priority) || 1,
          estimatedHours: parseFloat(taskForm.estimatedHours) || 0,
          actualHours: parseFloat(taskForm.actualHours) || 0,
          assignedUserId: taskForm.assignedUserId || null
        }),
      });
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Tarefa atualizada com sucesso!');
        setShowEditModal(false);
        setSelectedTask(null);
        resetForm();
        loadKanbanData(selectedProject.id);
      } else {
        Alert.alert('Erro', 'Falha ao atualizar tarefa.');
      }
    } catch (error) {
      console.error('Erro ao editar tarefa:', error);
      Alert.alert('Erro', 'Erro de conexão.');
    }
  };

  // Atualizar status da tarefa (drag and drop)
  const updateTaskStatus = async (taskId, newStatus, notes = '') => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/${selectedProject.id}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
          status: newStatus,
          notes: notes
        }),
      });
      
      if (response.ok) {
        loadKanbanData(selectedProject.id);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  // Mover tarefa para outro status
  const moveTask = (task, newStatus) => {
    Alert.alert(
      'Mover Tarefa',
      `Mover "${task.title}" para ${taskStatuses.find(s => s.key === newStatus)?.label}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Mover', 
          onPress: () => updateTaskStatus(task.id, newStatus)
        }
      ]
    );
  };

  // Abrir modal de edição
  const openEditModal = (task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'A_FAZER',
      startDatePlanned: task.startDatePlanned || '',
      endDatePlanned: task.endDatePlanned || '',
      startDateActual: task.startDateActual || '',
      endDateActual: task.endDateActual || '',
      progressPercentage: task.progressPercentage || 0,
      priority: task.priority || 1,
      estimatedHours: task.estimatedHours?.toString() || '',
      actualHours: task.actualHours?.toString() || '',
      notes: task.notes || '',
      assignedUserId: task.assignedUserId || null
    });
    setShowEditModal(true);
  };

  // Deletar tarefa
  const deleteTask = async (taskId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              const headers = await getAuthHeaders();
              const response = await fetch(`${API_BASE}/projects/${selectedProject.id}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: headers,
              });
              
              if (response.ok) {
                Alert.alert('Sucesso', 'Tarefa excluída com sucesso!');
                loadKanbanData(selectedProject.id);
              }
            } catch (error) {
              console.error('Erro ao excluir tarefa:', error);
            }
          }
        }
      ]
    );
  };

  // Resetar formulário
  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      status: 'A_FAZER',
      startDatePlanned: '',
      endDatePlanned: '',
      startDateActual: '',
      endDateActual: '',
      progressPercentage: 0,
      priority: 1,
      estimatedHours: '',
      actualHours: '',
      notes: '',
      assignedUserId: null
    });
  };

  // Selecionar projeto
  const selectProject = (project) => {
    setSelectedProject(project);
    loadKanbanData(project.id);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await loadProjects();
      await loadAvailableUsers();
      
      // Se há um projeto pré-selecionado, carregá-lo
      if (selectedProjectId && projects.length > 0) {
        const project = projects.find(p => p.id === selectedProjectId);
        if (project) {
          setSelectedProject(project);
          await loadKanbanData(project.id);
        }
      }
      
      setLoading(false);
    };
    loadInitialData();
  }, [selectedProjectId]);

  // UseEffect separado para quando os projetos carregam
  useEffect(() => {
    if (selectedProjectId && projects.length > 0 && !selectedProject) {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        setSelectedProject(project);
        loadKanbanData(project.id);
      }
    }
  }, [projects, selectedProjectId]);

  // Função para obter cor da prioridade
  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : '#6c757d';
  };

  // Função para obter label da prioridade
  const getPriorityLabel = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.label : 'Baixa';
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // Se não há projeto selecionado, mostrar seleção de projeto
  if (!selectedProject) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Selecionar Projeto</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Escolha um projeto para gerenciar tarefas:</Text>
          
          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectCard}
              onPress={() => selectProject(project)}
            >
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#007AFF' }]}>
                  <Text style={styles.statusText}>{project.status}</Text>
                </View>
              </View>
              <Text style={styles.projectClient}>Cliente: {project.client}</Text>
              <View style={styles.projectInfo}>
                <Text style={styles.projectTeam}>{project.teamSize} membros</Text>
                <Text style={styles.projectProgress}>{project.progressPercentage}% concluído</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Renderizar card de tarefa
  const renderTaskCard = (task) => (
    <View key={task.id} style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <View style={styles.taskActions}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
            <Text style={styles.priorityText}>{getPriorityLabel(task.priority)}</Text>
          </View>
          <TouchableOpacity
            style={styles.editTaskButton}
            onPress={() => openEditModal(task)}
          >
            <Ionicons name="pencil-outline" size={16} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteTaskButton}
            onPress={() => deleteTask(task.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.taskDescription} numberOfLines={2}>{task.description}</Text>
      
      <View style={styles.taskMeta}>
        <Text style={styles.taskAssigned}>
          👤 {task.assignedUserName || 'Não atribuído'}
        </Text>
        <Text style={styles.taskProgress}>{task.progressPercentage}%</Text>
      </View>
      
      <View style={styles.taskDates}>
        <Text style={styles.taskDate}>📅 {formatDate(task.endDatePlanned)}</Text>
        {task.overdue && <Text style={styles.overdueText}>⚠️ Atrasada</Text>}
      </View>

      {/* Botões para mover entre status */}
      <View style={styles.moveButtons}>
        {taskStatuses
          .filter(status => status.key !== task.status)
          .slice(0, 3) // Mostrar apenas 3 opções principais
          .map((status) => (
            <TouchableOpacity
              key={status.key}
              style={[styles.moveButton, { backgroundColor: status.color + '20', borderColor: status.color }]}
              onPress={() => moveTask(task, status.key)}
            >
              <Text style={[styles.moveButtonText, { color: status.color }]}>
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );

  // Renderizar coluna do Kanban
  const renderKanbanColumn = (title, tasks, status, color) => (
    <View style={[styles.kanbanColumn, { borderTopColor: color }]}>
      <View style={[styles.columnHeader, { backgroundColor: color + '20' }]}>
        <Text style={[styles.columnTitle, { color: color }]}>{title}</Text>
        <Text style={[styles.columnCount, { color: color }]}>({tasks.length})</Text>
      </View>
      <ScrollView style={styles.columnContent} showsVerticalScrollIndicator={false}>
        {tasks.map(task => renderTaskCard(task))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedProject(null)}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Tarefas</Text>
          <Text style={styles.subtitle}>{selectedProject.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Loading do Kanban */}
      {kanbanLoading ? (
        <View style={styles.kanbanLoadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.kanbanLoadingText}>Carregando tarefas...</Text>
        </View>
      ) : (
        /* Quadro Kanban */
        kanbanData && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kanbanContainer}>
            {renderKanbanColumn('A Fazer', kanbanData.afazer || [], 'A_FAZER', '#6c757d')}
            {renderKanbanColumn('Em Andamento', kanbanData.emAndamento || [], 'EM_ANDAMENTO', '#007AFF')}
            {renderKanbanColumn('Concluídas', kanbanData.concluidas || [], 'CONCLUIDA', '#28a745')}
            {renderKanbanColumn('Bloqueadas', kanbanData.bloqueadas || [], 'BLOQUEADA', '#ffc107')}
            {renderKanbanColumn('Canceladas', kanbanData.canceladas || [], 'CANCELADA', '#dc3545')}
          </ScrollView>
        )
      )}

      {/* Mensagem quando não há dados do Kanban */}
      {!kanbanLoading && !kanbanData && (
        <View style={styles.emptyKanbanContainer}>
          <Ionicons name="clipboard-outline" size={64} color="#ccc" />
          <Text style={styles.emptyKanbanText}>Nenhuma tarefa encontrada</Text>
          <Text style={styles.emptyKanbanSubtext}>
            Crie sua primeira tarefa para este projeto
          </Text>
        </View>
      )}

      {/* Modal de Criar Tarefa */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nova Tarefa</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={createTask}
            >
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Título da Tarefa *</Text>
              <TextInput
                style={styles.formInput}
                value={taskForm.title}
                onChangeText={(text) => setTaskForm({...taskForm, title: text})}
                placeholder="Ex: Instalação do sistema elétrico"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={taskForm.description}
                onChangeText={(text) => setTaskForm({...taskForm, description: text})}
                placeholder="Descreva a tarefa..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Prioridade</Text>
                <View style={styles.prioritySelector}>
                  {priorities.map((priority) => (
                    <TouchableOpacity
                      key={priority.value}
                      style={[
                        styles.priorityOption,
                        { 
                          backgroundColor: taskForm.priority === priority.value ? priority.color : '#f8f9fa',
                          borderColor: priority.color 
                        }
                      ]}
                      onPress={() => setTaskForm({...taskForm, priority: priority.value})}
                    >
                      <Text style={[
                        styles.priorityOptionText,
                        { color: taskForm.priority === priority.value ? '#fff' : priority.color }
                      ]}>
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Status</Text>
                <View style={styles.statusSelector}>
                  {taskStatuses.slice(0, 3).map((status) => (
                    <TouchableOpacity
                      key={status.key}
                      style={[
                        styles.statusOption,
                        { 
                          backgroundColor: taskForm.status === status.key ? status.color : '#f8f9fa',
                          borderColor: status.color 
                        }
                      ]}
                      onPress={() => setTaskForm({...taskForm, status: status.key})}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        { color: taskForm.status === status.key ? '#fff' : status.color }
                      ]}>
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Horas Estimadas</Text>
                <TextInput
                  style={styles.formInput}
                  value={taskForm.estimatedHours}
                  onChangeText={(text) => setTaskForm({...taskForm, estimatedHours: text})}
                  placeholder="40"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Progresso (%)</Text>
                <TextInput
                  style={styles.formInput}
                  value={taskForm.progressPercentage.toString()}
                  onChangeText={(text) => setTaskForm({...taskForm, progressPercentage: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <DatePicker
                  label="Data Início Planejada"
                  value={taskForm.startDatePlanned}
                  onDateChange={(formattedDate) => setTaskForm({...taskForm, startDatePlanned: formattedDate})}
                  placeholder="Selecione a data"
                  style={{ marginBottom: 0 }}
                />
              </View>
              
              <View style={styles.formHalf}>
                <DatePicker
                  label="Data Fim Planejada"
                  value={taskForm.endDatePlanned}
                  onDateChange={(formattedDate) => setTaskForm({...taskForm, endDatePlanned: formattedDate})}
                  placeholder="Selecione a data"
                  minimumDate={taskForm.startDatePlanned ? new Date(taskForm.startDatePlanned + 'T00:00:00') : null}
                  style={{ marginBottom: 0 }}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Atribuir a</Text>
              <View style={styles.userSelector}>
                <TouchableOpacity
                  style={[
                    styles.userOption,
                    { backgroundColor: !taskForm.assignedUserId ? '#007AFF' : '#f8f9fa' }
                  ]}
                  onPress={() => setTaskForm({...taskForm, assignedUserId: null})}
                >
                  <Text style={[
                    styles.userOptionText,
                    { color: !taskForm.assignedUserId ? '#fff' : '#007AFF' }
                  ]}>
                    Não atribuído
                  </Text>
                </TouchableOpacity>
                {availableUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.userOption,
                      { backgroundColor: taskForm.assignedUserId === user.id ? '#007AFF' : '#f8f9fa' }
                    ]}
                    onPress={() => setTaskForm({...taskForm, assignedUserId: user.id})}
                  >
                    <Text style={[
                      styles.userOptionText,
                      { color: taskForm.assignedUserId === user.id ? '#fff' : '#007AFF' }
                    ]}>
                      {user.fullName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Observações</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={taskForm.notes}
                onChangeText={(text) => setTaskForm({...taskForm, notes: text})}
                placeholder="Observações adicionais..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Editar Tarefa */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowEditModal(false);
                setSelectedTask(null);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Tarefa</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={editTask}
            >
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Título da Tarefa *</Text>
              <TextInput
                style={styles.formInput}
                value={taskForm.title}
                onChangeText={(text) => setTaskForm({...taskForm, title: text})}
                placeholder="Ex: Instalação do sistema elétrico"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={taskForm.description}
                onChangeText={(text) => setTaskForm({...taskForm, description: text})}
                placeholder="Descreva a tarefa..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Prioridade</Text>
                <View style={styles.prioritySelector}>
                  {priorities.map((priority) => (
                    <TouchableOpacity
                      key={priority.value}
                      style={[
                        styles.priorityOption,
                        { 
                          backgroundColor: taskForm.priority === priority.value ? priority.color : '#f8f9fa',
                          borderColor: priority.color 
                        }
                      ]}
                      onPress={() => setTaskForm({...taskForm, priority: priority.value})}
                    >
                      <Text style={[
                        styles.priorityOptionText,
                        { color: taskForm.priority === priority.value ? '#fff' : priority.color }
                      ]}>
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Status</Text>
                <View style={styles.statusSelector}>
                  {taskStatuses.map((status) => (
                    <TouchableOpacity
                      key={status.key}
                      style={[
                        styles.statusOption,
                        { 
                          backgroundColor: taskForm.status === status.key ? status.color : '#f8f9fa',
                          borderColor: status.color 
                        }
                      ]}
                      onPress={() => setTaskForm({...taskForm, status: status.key})}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        { color: taskForm.status === status.key ? '#fff' : status.color }
                      ]}>
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Horas Estimadas</Text>
                <TextInput
                  style={styles.formInput}
                  value={taskForm.estimatedHours}
                  onChangeText={(text) => setTaskForm({...taskForm, estimatedHours: text})}
                  placeholder="40"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Horas Reais</Text>
                <TextInput
                  style={styles.formInput}
                  value={taskForm.actualHours}
                  onChangeText={(text) => setTaskForm({...taskForm, actualHours: text})}
                  placeholder="35"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Progresso (%)</Text>
                <TextInput
                  style={styles.formInput}
                  value={taskForm.progressPercentage.toString()}
                  onChangeText={(text) => setTaskForm({...taskForm, progressPercentage: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formHalf}>
                <DatePicker
                  label="Data Início Real"
                  value={taskForm.startDateActual}
                  onDateChange={(formattedDate) => setTaskForm({...taskForm, startDateActual: formattedDate})}
                  placeholder="Selecione a data"
                  style={{ marginBottom: 0 }}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <DatePicker
                  label="Data Início Planejada"
                  value={taskForm.startDatePlanned}
                  onDateChange={(formattedDate) => setTaskForm({...taskForm, startDatePlanned: formattedDate})}
                  placeholder="Selecione a data"
                  style={{ marginBottom: 0 }}
                />
              </View>
              
              <View style={styles.formHalf}>
                <DatePicker
                  label="Data Fim Planejada"
                  value={taskForm.endDatePlanned}
                  onDateChange={(formattedDate) => setTaskForm({...taskForm, endDatePlanned: formattedDate})}
                  placeholder="Selecione a data"
                  minimumDate={taskForm.startDatePlanned ? new Date(taskForm.startDatePlanned + 'T00:00:00') : null}
                  style={{ marginBottom: 0 }}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Atribuir a</Text>
              <View style={styles.userSelector}>
                <TouchableOpacity
                  style={[
                    styles.userOption,
                    { backgroundColor: !taskForm.assignedUserId ? '#007AFF' : '#f8f9fa' }
                  ]}
                  onPress={() => setTaskForm({...taskForm, assignedUserId: null})}
                >
                  <Text style={[
                    styles.userOptionText,
                    { color: !taskForm.assignedUserId ? '#fff' : '#007AFF' }
                  ]}>
                    Não atribuído
                  </Text>
                </TouchableOpacity>
                {availableUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.userOption,
                      { backgroundColor: taskForm.assignedUserId === user.id ? '#007AFF' : '#f8f9fa' }
                    ]}
                    onPress={() => setTaskForm({...taskForm, assignedUserId: user.id})}
                  >
                    <Text style={[
                      styles.userOptionText,
                      { color: taskForm.assignedUserId === user.id ? '#fff' : '#007AFF' }
                    ]}>
                      {user.fullName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Observações</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={taskForm.notes}
                onChangeText={(text) => setTaskForm({...taskForm, notes: text})}
                placeholder="Observações adicionais..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#007AFF',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  addButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  projectClient: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  projectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectTeam: {
    fontSize: 12,
    color: '#666',
  },
  projectProgress: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  kanbanContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  kanbanColumn: {
    width: 280,
    marginHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderTopWidth: 4,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  columnCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  columnContent: {
    flex: 1,
    padding: 12,
    maxHeight: 500,
  },
  taskCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  editTaskButton: {
    padding: 4,
    marginRight: 4,
  },
  deleteTaskButton: {
    padding: 4,
  },
  taskDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskAssigned: {
    fontSize: 11,
    color: '#666',
  },
  taskProgress: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
  },
  taskDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 11,
    color: '#666',
  },
  overdueText: {
    fontSize: 10,
    color: '#dc3545',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#007AFF',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  formHalf: {
    flex: 0.48,
  },
  prioritySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusSelector: {
    flexDirection: 'column',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  userSelector: {
    flexDirection: 'column',
    gap: 8,
  },
  userOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  userOptionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  kanbanLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  kanbanLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyKanbanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyKanbanText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  emptyKanbanSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  moveButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    gap: 4,
  },
  moveButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
  },
  moveButtonText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Tasks; 