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
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatePicker } from '../../components';

const Projects = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);

  // Estados para criação/edição de projeto
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    startDatePlanned: '',
    endDatePlanned: '',
    startDateActual: '',
    endDateActual: '',
    totalBudget: '',
    client: '',
    status: 'PLANEJAMENTO',
    teamMemberIds: []
  });

  // URLs da API
  const API_BASE = 'https://sgpc-api.koyeb.app/api';

  // Status disponíveis
  const projectStatuses = [
    { key: 'TODOS', label: 'Todos', color: '#6c757d' },
    { key: 'PLANEJAMENTO', label: 'Planejamento', color: '#007AFF' },
    { key: 'EM_ANDAMENTO', label: 'Em Andamento', color: '#28a745' },
    { key: 'PAUSADO', label: 'Pausado', color: '#ffc107' },
    { key: 'CONCLUIDO', label: 'Concluído', color: '#6f42c1' },
    { key: 'CANCELADO', label: 'Cancelado', color: '#dc3545' }
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

  // Carregar todos os projetos
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
        setFilteredProjects(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        Alert.alert('Erro de Autenticação', 'Sessão expirada. Faça login novamente.');
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os projetos.');
    }
  };

  // Carregar projetos por status
  const loadProjectsByStatus = async (status) => {
    if (status === 'TODOS') {
      setFilteredProjects(projects);
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/status/${status}`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setFilteredProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos por status:', error);
    }
  };

  // Buscar projetos por nome
  const searchProjects = async (query) => {
    if (!query.trim()) {
      setFilteredProjects(projects);
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/search?name=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setFilteredProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    }
  };

  // Carregar detalhes do projeto
  const loadProjectDetails = async (projectId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedProject(data);
        setShowProjectDetails(true);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do projeto:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do projeto.');
    }
  };

  // Criar novo projeto
  const createProject = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          ...projectForm,
          totalBudget: parseFloat(projectForm.totalBudget) || 0
        }),
      });
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Projeto criado com sucesso!');
        setShowCreateModal(false);
        resetForm();
        loadProjects();
      } else {
        Alert.alert('Erro', 'Falha ao criar projeto.');
      }
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      Alert.alert('Erro', 'Erro de conexão.');
    }
  };

  // Editar projeto
  const editProject = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          ...projectForm,
          totalBudget: parseFloat(projectForm.totalBudget) || 0
        }),
      });
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Projeto atualizado com sucesso!');
        setShowEditModal(false);
        setShowProjectDetails(false);
        resetForm();
        loadProjects();
      } else {
        Alert.alert('Erro', 'Falha ao atualizar projeto.');
      }
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      Alert.alert('Erro', 'Erro de conexão.');
    }
  };

  // Deletar projeto
  const deleteProject = async (projectId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este projeto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              const headers = await getAuthHeaders();
              const response = await fetch(`${API_BASE}/projects/${projectId}`, {
                method: 'DELETE',
                headers: headers,
              });
              
              if (response.ok) {
                Alert.alert('Sucesso', 'Projeto excluído com sucesso!');
                loadProjects();
              } else {
                Alert.alert('Erro', 'Falha ao excluir projeto.');
              }
            } catch (error) {
              console.error('Erro ao excluir projeto:', error);
              Alert.alert('Erro', 'Erro de conexão.');
            }
          }
        }
      ]
    );
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

  // Adicionar membro ao projeto
  const addMemberToProject = async (userId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/${selectedProject.id}/team/${userId}`, {
        method: 'POST',
        headers: headers,
      });
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Membro adicionado ao projeto!');
        setShowAddMemberModal(false);
        loadProjectDetails(selectedProject.id);
      } else {
        Alert.alert('Erro', 'Falha ao adicionar membro.');
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      Alert.alert('Erro', 'Erro de conexão.');
    }
  };

  // Remover membro do projeto
  const removeMemberFromProject = async (userId) => {
    Alert.alert(
      'Remover Membro',
      'Tem certeza que deseja remover este membro do projeto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: async () => {
            try {
              const headers = await getAuthHeaders();
              const response = await fetch(`${API_BASE}/projects/${selectedProject.id}/team/${userId}`, {
                method: 'DELETE',
                headers: headers,
              });
              
              if (response.ok) {
                Alert.alert('Sucesso', 'Membro removido do projeto!');
                loadProjectDetails(selectedProject.id);
              } else {
                Alert.alert('Erro', 'Falha ao remover membro.');
              }
            } catch (error) {
              console.error('Erro ao remover membro:', error);
              Alert.alert('Erro', 'Erro de conexão.');
            }
          }
        }
      ]
    );
  };

  // Abrir modal de edição
  const openEditModal = () => {
    setProjectForm({
      name: selectedProject.name,
      description: selectedProject.description,
      startDatePlanned: selectedProject.startDatePlanned,
      endDatePlanned: selectedProject.endDatePlanned,
      startDateActual: selectedProject.startDateActual || '',
      endDateActual: selectedProject.endDateActual || '',
      totalBudget: selectedProject.totalBudget.toString(),
      client: selectedProject.client,
      status: selectedProject.status,
      teamMemberIds: selectedProject.teamMembers?.map(m => m.id) || []
    });
    setShowEditModal(true);
  };

  // Resetar formulário
  const resetForm = () => {
    setProjectForm({
      name: '',
      description: '',
      startDatePlanned: '',
      endDatePlanned: '',
      startDateActual: '',
      endDateActual: '',
      totalBudget: '',
      client: '',
      status: 'PLANEJAMENTO',
      teamMemberIds: []
    });
  };

  // Carregar dados iniciais
  const loadInitialData = async () => {
    setLoading(true);
    await loadProjects();
    setLoading(false);
  };

  // Refresh dos dados
  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  // Filtrar por status
  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    loadProjectsByStatus(status);
  };

  // Buscar projetos
  const handleSearch = (text) => {
    setSearchText(text);
    if (text.length > 2) {
      searchProjects(text);
    } else if (text.length === 0) {
      setFilteredProjects(projects);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Função para formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    const statusObj = projectStatuses.find(s => s.key === status);
    return statusObj ? statusObj.color : '#6c757d';
  };

  // Função para obter label do status
  const getStatusLabel = (status) => {
    const statusObj = projectStatuses.find(s => s.key === status);
    return statusObj ? statusObj.label : status;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando projetos...</Text>
      </View>
    );
  }

  const renderProject = ({ item }) => (
    <TouchableOpacity 
      style={styles.projectCard}
      onPress={() => loadProjectDetails(item.id)}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectTitleContainer}>
          <Text style={styles.projectTitle}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteProject(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>

      <Text style={styles.projectClient}>Cliente: {item.client}</Text>
      <Text style={styles.projectBudget}>Orçamento: {formatCurrency(item.totalBudget)}</Text>
      
      <View style={styles.projectInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {formatDate(item.startDatePlanned)} - {formatDate(item.endDatePlanned)}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.teamSize} membros</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progresso</Text>
          <Text style={styles.progressPercentage}>{item.progressPercentage}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${item.progressPercentage}%`,
                backgroundColor: item.isDelayed ? '#dc3545' : '#28a745'
              }
            ]} 
          />
        </View>
        {item.isDelayed && (
          <Text style={styles.delayedText}>⚠️ Projeto atrasado</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Projetos</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Busca */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar projetos..."
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Filtros de Status */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilters}
      >
        {projectStatuses.map((status) => (
          <TouchableOpacity
            key={status.key}
            style={[
              styles.statusFilter,
              { 
                backgroundColor: selectedStatus === status.key ? status.color : '#f8f9fa',
                borderColor: status.color 
              }
            ]}
            onPress={() => handleStatusFilter(status.key)}
          >
            <Text style={[
              styles.statusFilterText,
              { color: selectedStatus === status.key ? '#fff' : status.color }
            ]}>
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de Projetos */}
      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        style={styles.projectsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum projeto encontrado</Text>
            <Text style={styles.emptySubtext}>
              Crie seu primeiro projeto ou ajuste os filtros
            </Text>
          </View>
        }
      />

      {/* Modal de Criar Projeto */}
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
            <Text style={styles.modalTitle}>Novo Projeto</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={createProject}
            >
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome do Projeto *</Text>
              <TextInput
                style={styles.formInput}
                value={projectForm.name}
                onChangeText={(text) => setProjectForm({...projectForm, name: text})}
                placeholder="Ex: Construção Residencial"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={projectForm.description}
                onChangeText={(text) => setProjectForm({...projectForm, description: text})}
                placeholder="Descreva o projeto..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cliente *</Text>
              <TextInput
                style={styles.formInput}
                value={projectForm.client}
                onChangeText={(text) => setProjectForm({...projectForm, client: text})}
                placeholder="Nome do cliente"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Orçamento Total</Text>
              <TextInput
                style={styles.formInput}
                value={projectForm.totalBudget}
                onChangeText={(text) => setProjectForm({...projectForm, totalBudget: text})}
                placeholder="250000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <DatePicker
                  label="Data Início Planejada"
                  value={projectForm.startDatePlanned}
                  onDateChange={(formattedDate) => setProjectForm({...projectForm, startDatePlanned: formattedDate})}
                  placeholder="Selecione a data"
                  style={{ marginBottom: 0 }}
                />
              </View>
              
              <View style={styles.formHalf}>
                <DatePicker
                  label="Data Fim Planejada"
                  value={projectForm.endDatePlanned}
                  onDateChange={(formattedDate) => setProjectForm({...projectForm, endDatePlanned: formattedDate})}
                  placeholder="Selecione a data"
                  minimumDate={projectForm.startDatePlanned ? new Date(projectForm.startDatePlanned + 'T00:00:00') : null}
                  style={{ marginBottom: 0 }}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Status</Text>
              <View style={styles.statusSelector}>
                {projectStatuses.slice(1).map((status) => (
                  <TouchableOpacity
                    key={status.key}
                    style={[
                      styles.statusOption,
                      { 
                        backgroundColor: projectForm.status === status.key ? status.color : '#f8f9fa',
                        borderColor: status.color 
                      }
                    ]}
                    onPress={() => setProjectForm({...projectForm, status: status.key})}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      { color: projectForm.status === status.key ? '#fff' : status.color }
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Detalhes do Projeto */}
      <Modal
        visible={showProjectDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowProjectDetails(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Detalhes do Projeto</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalActionButton}
                onPress={openEditModal}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {selectedProject && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsTitle}>{selectedProject.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedProject.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(selectedProject.status)}</Text>
                </View>
              </View>

              <Text style={styles.detailsDescription}>{selectedProject.description}</Text>

              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Informações Gerais</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cliente:</Text>
                  <Text style={styles.detailValue}>{selectedProject.client}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Orçamento Total:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(selectedProject.totalBudget)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Orçamento Usado:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(selectedProject.budgetUsed || 0)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Saldo Restante:</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: (selectedProject.budgetRemaining || 0) >= 0 ? '#28a745' : '#dc3545' }
                  ]}>
                    {formatCurrency(selectedProject.budgetRemaining || 0)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Cronograma</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Início Planejado:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedProject.startDatePlanned)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fim Planejado:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedProject.endDatePlanned)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Início Real:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedProject.startDateActual)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fim Real:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedProject.endDateActual)}</Text>
                </View>
                {selectedProject.daysRemaining && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Dias Restantes:</Text>
                    <Text style={styles.detailValue}>{selectedProject.daysRemaining} dias</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Progresso</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Conclusão do Projeto</Text>
                    <Text style={styles.progressPercentage}>{selectedProject.progressPercentage}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${selectedProject.progressPercentage}%`,
                          backgroundColor: selectedProject.isDelayed ? '#dc3545' : '#28a745'
                        }
                      ]} 
                    />
                  </View>
                  {selectedProject.isDelayed && (
                    <Text style={styles.delayedText}>⚠️ Projeto atrasado</Text>
                  )}
                </View>
              </View>

              {/* Seção de Tarefas */}
              <View style={styles.detailsSection}>
                <View style={styles.tasksHeader}>
                  <Text style={styles.sectionTitle}>Tarefas do Projeto</Text>
                  <TouchableOpacity 
                    style={styles.viewTasksButton}
                    onPress={() => {
                      setShowProjectDetails(false);
                      navigation.navigate('Tasks', { selectedProjectId: selectedProject.id });
                    }}
                  >
                    <Ionicons name="list-outline" size={16} color="#007AFF" />
                    <Text style={styles.viewTasksText}>Ver Quadro Kanban</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tasksPreview}>
                  <Text style={styles.tasksPreviewText}>
                    Gerencie as tarefas deste projeto em um quadro Kanban interativo
                  </Text>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <View style={styles.teamHeader}>
                  <Text style={styles.sectionTitle}>Equipe ({selectedProject.teamSize} membros)</Text>
                  <TouchableOpacity 
                    style={styles.addMemberButton}
                    onPress={() => {
                      loadAvailableUsers();
                      setShowAddMemberModal(true);
                    }}
                  >
                    <Ionicons name="person-add-outline" size={16} color="#007AFF" />
                    <Text style={styles.addMemberText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>
                {selectedProject.teamMembers && selectedProject.teamMembers.map((member) => (
                  <View key={member.id} style={styles.teamMember}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.fullName}</Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                      <Text style={styles.memberPhone}>{member.phone}</Text>
                    </View>
                    <View style={styles.memberActions}>
                      <Text style={styles.memberRate}>
                        {formatCurrency(member.hourlyRate)}/h
                      </Text>
                      <TouchableOpacity 
                        style={styles.removeMemberButton}
                        onPress={() => removeMemberFromProject(member.id)}
                      >
                        <Ionicons name="person-remove-outline" size={16} color="#dc3545" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Modal de Editar Projeto */}
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
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Projeto</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={editProject}
            >
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome do Projeto *</Text>
              <TextInput
                style={styles.formInput}
                value={projectForm.name}
                onChangeText={(text) => setProjectForm({...projectForm, name: text})}
                placeholder="Ex: Construção Residencial"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={projectForm.description}
                onChangeText={(text) => setProjectForm({...projectForm, description: text})}
                placeholder="Descreva o projeto..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cliente *</Text>
              <TextInput
                style={styles.formInput}
                value={projectForm.client}
                onChangeText={(text) => setProjectForm({...projectForm, client: text})}
                placeholder="Nome do cliente"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Orçamento Total</Text>
              <TextInput
                style={styles.formInput}
                value={projectForm.totalBudget}
                onChangeText={(text) => setProjectForm({...projectForm, totalBudget: text})}
                placeholder="250000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <DatePicker
                  label="Data Início Planejada"
                  value={projectForm.startDatePlanned}
                  onDateChange={(formattedDate) => setProjectForm({...projectForm, startDatePlanned: formattedDate})}
                  placeholder="Selecione a data"
                  style={{ marginBottom: 0 }}
                />
              </View>
              
              <View style={styles.formHalf}>
                <DatePicker
                  label="Data Fim Planejada"
                  value={projectForm.endDatePlanned}
                  onDateChange={(formattedDate) => setProjectForm({...projectForm, endDatePlanned: formattedDate})}
                  placeholder="Selecione a data"
                  minimumDate={projectForm.startDatePlanned ? new Date(projectForm.startDatePlanned + 'T00:00:00') : null}
                  style={{ marginBottom: 0 }}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <DatePicker
                  label="Data Início Real"
                  value={projectForm.startDateActual}
                  onDateChange={(formattedDate) => setProjectForm({...projectForm, startDateActual: formattedDate})}
                  placeholder="Selecione a data"
                  style={{ marginBottom: 0 }}
                />
              </View>
              
              <View style={styles.formHalf}>
                <DatePicker
                  label="Data Fim Real"
                  value={projectForm.endDateActual}
                  onDateChange={(formattedDate) => setProjectForm({...projectForm, endDateActual: formattedDate})}
                  placeholder="Selecione a data"
                  minimumDate={projectForm.startDateActual ? new Date(projectForm.startDateActual + 'T00:00:00') : null}
                  style={{ marginBottom: 0 }}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Status</Text>
              <View style={styles.statusSelector}>
                {projectStatuses.slice(1).map((status) => (
                  <TouchableOpacity
                    key={status.key}
                    style={[
                      styles.statusOption,
                      { 
                        backgroundColor: projectForm.status === status.key ? status.color : '#f8f9fa',
                        borderColor: status.color 
                      }
                    ]}
                    onPress={() => setProjectForm({...projectForm, status: status.key})}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      { color: projectForm.status === status.key ? '#fff' : status.color }
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Adicionar Membro */}
      <Modal
        visible={showAddMemberModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAddMemberModal(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Adicionar Membro</Text>
            <View />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Usuários Disponíveis</Text>
            {availableUsers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum usuário disponível</Text>
              </View>
            ) : (
              availableUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userCard}
                  onPress={() => addMemberToProject(user.id)}
                >
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.fullName}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userPhone}>{user.phone}</Text>
                  </View>
                  <View style={styles.userActions}>
                    <Text style={styles.userRate}>
                      {formatCurrency(user.hourlyRate)}/h
                    </Text>
                    <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                  </View>
                </TouchableOpacity>
              ))
            )}
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
    backgroundColor: '#007AFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  statusFilters: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#fff',
    maxHeight: 50,
  },
  statusFilter: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusFilterText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  projectsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitleContainer: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  projectClient: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  projectBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 12,
  },
  projectInfo: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  delayedText: {
    fontSize: 12,
    color: '#dc3545',
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
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
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
  modalActions: {
    flexDirection: 'row',
  },
  modalActionButton: {
    padding: 8,
    marginLeft: 8,
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
  },
  formHalf: {
    flex: 0.48,
  },
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  detailsDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  teamMember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  memberPhone: {
    fontSize: 14,
    color: '#666',
  },
  memberActions: {
    alignItems: 'flex-end',
  },
  memberRate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 4,
  },
  removeMemberButton: {
    padding: 4,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addMemberText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  userActions: {
    alignItems: 'flex-end',
  },
  userRate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 8,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewTasksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  viewTasksText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  tasksPreview: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  tasksPreviewText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default Projects; 