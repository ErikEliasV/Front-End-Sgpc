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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CostManagement = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, services, tasks, projects
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Estados para dados da API
  const [services, setServices] = useState([]);
  const [taskServices, setTaskServices] = useState([]);
  const [projectBudget, setProjectBudget] = useState(null);
  const [overBudgetProjects, setOverBudgetProjects] = useState([]);
  const [budgetReport, setBudgetReport] = useState(null);
  const [taskReport, setTaskReport] = useState(null);

  // Estados para modais
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // URLs base da API
  const API_BASE = 'https://sgpc-api.koyeb.app/api/cost';
  


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

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
              await Promise.all([
        loadServices(),
        loadProjectBudget(2), // Usando projeto real: "Reforma Comercial Beta"
        loadOverBudgetProjects(),
        loadBudgetReport(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // Funções da API
  const loadServices = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/services`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        if (response.status === 401) {
          Alert.alert('Erro de Autenticação', 'Sessão expirada. Faça login novamente.');
        } else {
          Alert.alert('Erro', `Falha ao carregar serviços: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar com a API');
    }
  };

  const searchServices = async (query) => {
    // Busca local já que o endpoint de busca tem problemas
    const filteredServices = services.filter(service => 
      service.name.toLowerCase().includes(query.toLowerCase()) ||
      service.description.toLowerCase().includes(query.toLowerCase())
    );
    setServices(filteredServices);
  };

  const loadTaskServices = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE}/task/${taskId}/services`);
      if (response.ok) {
        const data = await response.json();
        setTaskServices(data);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços da tarefa:', error);
    }
  };

  const loadTaskReport = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE}/task/${taskId}/report`);
      if (response.ok) {
        const data = await response.json();
        setTaskReport(data);
      }
    } catch (error) {
      console.error('Erro ao carregar relatório da tarefa:', error);
    }
  };

  const loadProjectBudget = async (projectId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/${projectId}/budget`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjectBudget(data);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamento do projeto:', error);
    }
  };

  const loadOverBudgetProjects = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/over-budget`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setOverBudgetProjects(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos estourados:', error);
    }
  };

  const loadBudgetReport = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/budget-report`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        // Se for um array, calcula totais de todos os projetos
        if (Array.isArray(data) && data.length > 0) {
          const totalBudget = data.reduce((sum, project) => sum + (project.totalBudget || 0), 0);
          const totalRealized = data.reduce((sum, project) => sum + (project.realizedCost || 0), 0);
          const avgProgress = data.reduce((sum, project) => sum + (project.progressPercentage || 0), 0) / data.length;
          
          setBudgetReport({
            totalBudget,
            realizedCost: totalRealized,
            progressPercentage: Math.round(avgProgress),
            projects: data
          });
        } else {
          setBudgetReport(data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar relatório de orçamento:', error);
    }
  };

  const addServiceToTask = async (taskId, serviceData) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Serviço adicionado à tarefa com sucesso!');
        loadTaskServices(taskId);
      } else {
        Alert.alert('Erro', 'Falha ao adicionar serviço à tarefa');
      }
    } catch (error) {
      console.error('Erro ao adicionar serviço à tarefa:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  const removeServiceFromTask = async (taskId, serviceId) => {
    try {
      const response = await fetch(`${API_BASE}/task/${taskId}/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Serviço removido da tarefa!');
        loadTaskServices(taskId);
      } else {
        Alert.alert('Erro', 'Falha ao remover serviço');
      }
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  const recalculateTaskCosts = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/recalculate`, {
        method: 'POST',
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Custos da tarefa recalculados!');
        loadTaskReport(taskId);
      }
    } catch (error) {
      console.error('Erro ao recalcular custos:', error);
    }
  };

  const recalculateProjectCosts = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}/recalculate-cost`, {
        method: 'POST',
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Custos do projeto recalculados!');
        loadProjectBudget(projectId);
      }
    } catch (error) {
      console.error('Erro ao recalcular custos do projeto:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.length > 2) {
      searchServices(text);
    } else if (text.length === 0) {
      loadServices();
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Resumo Geral */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Ionicons name="wallet-outline" size={24} color="#007AFF" />
          <Text style={styles.summaryValue}>
            {budgetReport ? formatCurrency(budgetReport.totalBudget) : 'R$ 0,00'}
          </Text>
          <Text style={styles.summaryLabel}>Orçamento Total</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="trending-up" size={24} color="#28a745" />
          <Text style={styles.summaryValue}>
            {budgetReport ? formatCurrency(budgetReport.realizedCost) : 'R$ 0,00'}
          </Text>
          <Text style={styles.summaryLabel}>Custo Realizado</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="analytics" size={24} color="#ffc107" />
          <Text style={styles.summaryValue}>
            {budgetReport ? `${budgetReport.progressPercentage}%` : '0%'}
          </Text>
          <Text style={styles.summaryLabel}>Progresso</Text>
        </View>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveTab('services')}
          >
            <Ionicons name="construct" size={20} color="#007AFF" />
            <Text style={styles.actionText}>Gerenciar Serviços</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveTab('tasks')}
          >
            <Ionicons name="list" size={20} color="#28a745" />
            <Text style={styles.actionText}>Custos de Tarefas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveTab('projects')}
          >
            <Ionicons name="folder" size={20} color="#6f42c1" />
            <Text style={styles.actionText}>Orçamentos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => recalculateProjectCosts(2)}
          >
            <Ionicons name="refresh" size={20} color="#fd7e14" />
            <Text style={styles.actionText}>Recalcular</Text>
          </TouchableOpacity>
        </View>
      </View>



      {/* Lista de Todos os Projetos */}
      {budgetReport && budgetReport.projects && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Projetos Ativos</Text>
          {budgetReport.projects.slice(0, 3).map((project) => (
            <View key={project.projectId} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectTitle}>{project.projectName}</Text>
                <Text style={[
                  styles.projectStatus,
                  { color: project.isOverBudget ? '#dc3545' : '#28a745' }
                ]}>
                  {project.isOverBudget ? '⚠️ Estourado' : '✅ No Orçamento'}
                </Text>
              </View>
              <View style={styles.projectInfo}>
                <Text style={styles.projectDetail}>
                  💰 Orçamento: {formatCurrency(project.totalBudget)}
                </Text>
                <Text style={styles.projectDetail}>
                  📈 Realizado: {formatCurrency(project.realizedCost)}
                </Text>
                <Text style={styles.projectDetail}>
                  📊 Progresso: {project.progressPercentage}%
                </Text>
              </View>
            </View>
          ))}
          {budgetReport.projects.length > 3 && (
            <Text style={styles.moreProjectsText}>
              E mais {budgetReport.projects.length - 3} projetos...
            </Text>
          )}
        </View>
      )}

      {/* Projetos com Orçamento Estourado */}
      {overBudgetProjects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Projetos com Orçamento Estourado</Text>
          {overBudgetProjects.map((project, index) => (
            <View key={index} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>{project.projectName}</Text>
                <Text style={styles.alertBadge}>
                  {formatCurrency(Math.abs(project.budgetVariance))} acima
                </Text>
              </View>
              <Text style={styles.alertText}>
                Orçamento: {formatCurrency(project.totalBudget)} | 
                Realizado: {formatCurrency(project.realizedCost)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderServicesTab = () => (
    <View style={styles.tabContent}>
      {/* Busca de Serviços */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar serviços..."
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      

      {/* Lista de Serviços */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddServiceModal(true)}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Carregando serviços...</Text>
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum serviço encontrado</Text>
            <Text style={styles.emptySubtext}>
              Verifique sua conexão ou tente novamente
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadServices}
            >
              <Text style={styles.retryText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceTitle}>{service.name}</Text>
                <Text style={styles.servicePrice}>
                  {formatCurrency(service.totalUnitCost || 0)}/{service.unitOfMeasurement}
                </Text>
              </View>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <View style={styles.serviceCosts}>
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>Mão de obra:</Text>
                  <Text style={styles.costValue}>{formatCurrency(service.unitLaborCost || 0)}</Text>
                </View>
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>Material:</Text>
                  <Text style={styles.costValue}>{formatCurrency(service.unitMaterialCost || 0)}</Text>
                </View>
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>Equipamento:</Text>
                  <Text style={styles.costValue}>{formatCurrency(service.unitEquipmentCost || 0)}</Text>
                </View>
              </View>

            </View>
          ))
        )}
      </View>
    </View>
  );

  const renderTasksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gerenciamento de Custos por Tarefa</Text>
        
        <TouchableOpacity
          style={styles.taskButton}
          onPress={() => {
            setSelectedTaskId(1);
            setShowTaskDetailsModal(true);
            loadTaskServices(1);
            loadTaskReport(1);
          }}
        >
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>Escavação da fundação</Text>
            <Text style={styles.taskSubtitle}>Ver custos e serviços</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.taskButton}
          onPress={() => {
            setSelectedTaskId(2);
            setShowTaskDetailsModal(true);
            loadTaskServices(2);
            loadTaskReport(2);
          }}
        >
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>Concretagem da laje</Text>
            <Text style={styles.taskSubtitle}>Ver custos e serviços</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProjectsTab = () => (
    <View style={styles.tabContent}>
      {projectBudget && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{projectBudget.projectName}</Text>
          
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetTitle}>Resumo Orçamentário</Text>
              <TouchableOpacity
                onPress={() => recalculateProjectCosts(projectBudget.projectId)}
              >
                <Ionicons name="refresh" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Orçamento Total:</Text>
              <Text style={styles.budgetValue}>
                {formatCurrency(projectBudget.totalBudget)}
              </Text>
            </View>

            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Custo Realizado:</Text>
              <Text style={[
                styles.budgetValue,
                { color: projectBudget.isOverBudget ? '#dc3545' : '#28a745' }
              ]}>
                {formatCurrency(projectBudget.realizedCost)}
              </Text>
            </View>

            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Variação:</Text>
              <Text style={[
                styles.budgetValue,
                { color: projectBudget.budgetVariance < 0 ? '#dc3545' : '#28a745' }
              ]}>
                {formatCurrency(projectBudget.budgetVariance)}
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Uso do Orçamento</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(projectBudget.budgetUsagePercentage, 100)}%`,
                      backgroundColor: projectBudget.isOverBudget ? '#dc3545' : '#007AFF'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {projectBudget.budgetUsagePercentage}%
              </Text>
            </View>

            <View style={styles.tasksInfo}>
              <View style={styles.tasksSummary}>
                <Text style={styles.tasksCount}>{projectBudget.completedTasks}</Text>
                <Text style={styles.tasksLabel}>Concluídas</Text>
              </View>
              <View style={styles.tasksSummary}>
                <Text style={styles.tasksCount}>{projectBudget.pendingTasks}</Text>
                <Text style={styles.tasksLabel}>Pendentes</Text>
              </View>
              <View style={styles.tasksSummary}>
                <Text style={styles.tasksCount}>{projectBudget.totalTasks}</Text>
                <Text style={styles.tasksLabel}>Total</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Visão Geral
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'services' && styles.activeTab]}
          onPress={() => setActiveTab('services')}
        >
          <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
            Serviços
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
            Tarefas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'projects' && styles.activeTab]}
          onPress={() => setActiveTab('projects')}
        >
          <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>
            Projetos
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando dados de custos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão de Custos</Text>
        <Text style={styles.subtitle}>Controle financeiro de projetos</Text>
      </View>

      {renderTabs()}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'services' && renderServicesTab()}
        {activeTab === 'tasks' && renderTasksTab()}
        {activeTab === 'projects' && renderProjectsTab()}
      </ScrollView>

      {/* Modal de Detalhes da Tarefa */}
      <Modal
        visible={showTaskDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Detalhes da Tarefa {selectedTaskId}
            </Text>
            <TouchableOpacity
              onPress={() => setShowTaskDetailsModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {taskReport && (
              <View style={styles.taskReportCard}>
                <Text style={styles.taskReportTitle}>{taskReport.taskTitle}</Text>
                <View style={styles.taskCosts}>
                  <View style={styles.costRow}>
                    <Text>Mão de obra:</Text>
                    <Text>{formatCurrency(taskReport.laborCost)}</Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text>Material:</Text>
                    <Text>{formatCurrency(taskReport.materialCost)}</Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text>Equipamento:</Text>
                    <Text>{formatCurrency(taskReport.equipmentCost)}</Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(taskReport.totalCost)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Serviços da Tarefa</Text>
              {taskServices.map((service) => (
                <View key={service.id} style={styles.taskServiceCard}>
                  <View style={styles.taskServiceHeader}>
                    <Text style={styles.taskServiceName}>{service.serviceName}</Text>
                    <TouchableOpacity
                      onPress={() => removeServiceFromTask(selectedTaskId, service.serviceId)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#dc3545" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.taskServiceDesc}>{service.serviceDescription}</Text>
                  <View style={styles.taskServiceInfo}>
                    <Text>Qtd: {service.quantity} {service.unitOfMeasurement}</Text>
                    <Text>Total: {formatCurrency(service.totalCost)}</Text>
                  </View>
                  {service.notes && (
                    <Text style={styles.taskServiceNotes}>Obs: {service.notes}</Text>
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.recalculateButton}
              onPress={() => recalculateTaskCosts(selectedTaskId)}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.recalculateText}>Recalcular Custos</Text>
            </TouchableOpacity>
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
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
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
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginBottom: 10,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
  },
  alertBadge: {
    backgroundColor: '#ffc107',
    color: '#856404',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  alertText: {
    fontSize: 14,
    color: '#856404',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    padding: 8,
  },
  serviceCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  serviceCosts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costItem: {
    flex: 1,
  },
  costLabel: {
    fontSize: 12,
    color: '#666',
  },
  costValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  taskButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  budgetCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  budgetLabel: {
    fontSize: 16,
    color: '#666',
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  tasksInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  tasksSummary: {
    alignItems: 'center',
  },
  tasksCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  tasksLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  taskReportCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskReportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  taskCosts: {
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
    paddingTop: 15,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#007AFF',
  },
  taskServiceCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskServiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskServiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  taskServiceDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskServiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskServiceNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  recalculateButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  recalculateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  projectCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  projectStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectInfo: {
    gap: 5,
  },
  projectDetail: {
    fontSize: 14,
    color: '#666',
  },
  moreProjectsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
});

export default CostManagement;