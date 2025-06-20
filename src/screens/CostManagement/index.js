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
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);

  // Estados para modais
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showAddServiceToTaskModal, setShowAddServiceToTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Estados para formulários
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    unitOfMeasurement: '',
    unitLaborCost: '',
    unitMaterialCost: '',
    unitEquipmentCost: '',
    isActive: true
  });

  const [progressUpdate, setProgressUpdate] = useState({
    progressPercentage: '',
    notes: '',
    actualHours: ''
  });

  const [serviceToTask, setServiceToTask] = useState({
    serviceId: null,
    quantity: '',
    unitCostOverride: '',
    notes: ''
  });

  // URLs base da API - CORRIGIDAS
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
        loadProjects(),
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

  // NOVO: Carregar projetos disponíveis
  const loadProjects = async () => {
    try {
      const headers = await getAuthHeaders();
      console.log('🔍 Carregando projetos...');
      
      const response = await fetch('https://sgpc-api.koyeb.app/api/projects', {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Projetos carregados:', data.length);
        setProjects(data);
        
        // Seleciona automaticamente o primeiro projeto se houver
        if (data.length > 0 && !selectedProject) {
          const firstProject = data[0];
          setSelectedProject(firstProject);
          await loadProjectBudget(firstProject.id);
          await loadProjectTasks(firstProject.id);
        }
      } else {
        console.error('❌ Erro ao carregar projetos:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar projetos:', error);
    }
  };

  // NOVO: Carregar tarefas do projeto
  const loadProjectTasks = async (projectId) => {
    try {
      const headers = await getAuthHeaders();
      console.log('🔍 Carregando tarefas do projeto:', projectId);
      
      // Tentar diferentes endpoints para obter tarefas do projeto
      const endpoints = [
        `https://sgpc-api.koyeb.app/api/projects/${projectId}/tasks/kanban`,
        `https://sgpc-api.koyeb.app/api/projects/${projectId}/tasks`,
        `https://sgpc-api.koyeb.app/api/tasks/project/${projectId}`,
        `https://sgpc-api.koyeb.app/api/tasks`
      ];
      
      let projectTasksData = [];
      let foundTasks = false;
      
      for (const endpoint of endpoints) {
        try {
          console.log('🌐 Tentando endpoint de tarefas:', endpoint);
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: headers,
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('📊 Resposta do endpoint', endpoint, ':', data);
            
            // Se for o endpoint kanban, extrair tarefas de todas as colunas
            if (endpoint.includes('/kanban') && data) {
              const allTasks = [];
              Object.keys(data).forEach(column => {
                if (Array.isArray(data[column])) {
                  allTasks.push(...data[column]);
                }
              });
              
              if (allTasks.length > 0) {
                console.log('✅ Tarefas encontradas via kanban:', allTasks.length);
                projectTasksData = allTasks;
                foundTasks = true;
                break;
              }
            }
            // Se for array de tarefas
            else if (Array.isArray(data)) {
              // Se for o endpoint /tasks (todas as tarefas), filtrar por projectId
              if (endpoint.includes('/tasks') && !endpoint.includes('/projects/')) {
                const filteredTasks = data.filter(task => 
                  task.projectId === projectId || 
                  task.project?.id === projectId ||
                  task.projectName === selectedProject?.name
                );
                
                if (filteredTasks.length > 0) {
                  console.log('✅ Tarefas filtradas por projeto:', filteredTasks.length, 'de', data.length, 'total');
                  projectTasksData = filteredTasks;
                  foundTasks = true;
                  break;
                }
              }
              // Para outros endpoints, usar dados diretamente
              else if (data.length > 0) {
                console.log('✅ Tarefas encontradas via', endpoint, ':', data.length);
                projectTasksData = data;
                foundTasks = true;
                break;
              }
            }
            // Se for objeto com propriedades de tarefas
            else if (data && typeof data === 'object') {
              const possibleTaskArrays = ['tasks', 'data', 'items'];
              for (const prop of possibleTaskArrays) {
                if (Array.isArray(data[prop])) {
                  console.log('✅ Tarefas encontradas em', prop, ':', data[prop].length);
                  projectTasksData = data[prop];
                  foundTasks = true;
                  break;
                }
              }
              if (foundTasks) break;
            }
          } else {
            console.log('⚠️ Endpoint', endpoint, 'retornou status:', response.status);
          }
        } catch (endpointError) {
          console.log('❌ Erro no endpoint', endpoint, ':', endpointError.message);
        }
      }
      
      if (foundTasks) {
        console.log('✅ Total de tarefas do projeto carregadas:', projectTasksData.length);
        
        // Log detalhado das tarefas para debug
        projectTasksData.forEach((task, index) => {
          console.log(`📋 Tarefa ${index + 1}:`, {
            id: task.id,
            title: task.title,
            status: task.status,
            totalCost: task.totalCost,
            projectId: task.projectId,
            projectName: task.projectName
          });
        });
        
        // Tentar carregar custos das tarefas se não estiverem presentes
        const tasksWithCosts = await Promise.all(
          projectTasksData.map(async (task) => {
            if (!task.totalCost && task.id) {
              try {
                console.log('💰 Carregando custo da tarefa:', task.id);
                const taskReportResponse = await fetch(`${API_BASE}/tasks/${task.id}/report`, {
                  method: 'GET',
                  headers: headers,
                });
                
                if (taskReportResponse.ok) {
                  const reportData = await taskReportResponse.json();
                  console.log('💰 Custo carregado para tarefa', task.id, ':', reportData.totalCost);
                  return { ...task, totalCost: reportData.totalCost || 0 };
                }
              } catch (error) {
                console.log('⚠️ Erro ao carregar custo da tarefa', task.id, ':', error.message);
              }
            }
            return task;
          })
        );
        
        setProjectTasks(tasksWithCosts);
        return tasksWithCosts; // Retornar as tarefas carregadas
      } else {
        console.log('⚠️ Nenhuma tarefa encontrada para o projeto:', projectId);
        setProjectTasks([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao carregar tarefas do projeto:', error);
      setProjectTasks([]);
      return [];
    }
  };

  // Funções da API - TODAS CORRIGIDAS
  const loadServices = async () => {
    try {
      const headers = await getAuthHeaders();
      console.log('🔍 Carregando serviços...');
      
      const response = await fetch(`${API_BASE}/services`, {
        method: 'GET',
        headers: headers,
      });
      
      console.log('📡 Status da resposta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Serviços carregados:', data.length);
        setServices(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao carregar serviços:', response.status, errorText);
        
        if (response.status === 401) {
          Alert.alert('Erro de Autenticação', 'Sessão expirada. Faça login novamente.');
        } else {
          Alert.alert('Erro', `Falha ao carregar serviços: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro de conexão ao carregar serviços:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar com a API');
    }
  };

  // NOVO: Busca de serviços usando a API
  const searchServices = async (query) => {
    if (!query || query.length < 2) {
      loadServices();
      return;
    }

    try {
      const headers = await getAuthHeaders();
      console.log('🔍 Buscando serviços:', query);
      
      const response = await fetch(`${API_BASE}/services/search?name=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Busca realizada:', data.length, 'resultados');
        setServices(data);
      } else {
        console.error('❌ Erro na busca:', response.status);
        // Fallback para busca local se a API falhar
        const filteredServices = services.filter(service => 
          service.name.toLowerCase().includes(query.toLowerCase()) ||
          service.description.toLowerCase().includes(query.toLowerCase())
        );
        setServices(filteredServices);
      }
    } catch (error) {
      console.error('❌ Erro na busca de serviços:', error);
      // Fallback para busca local
      const filteredServices = services.filter(service => 
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        service.description.toLowerCase().includes(query.toLowerCase())
      );
      setServices(filteredServices);
    }
  };

  // CORRIGIDO: URL da API
  const loadTaskServices = async (taskId) => {
    try {
      const headers = await getAuthHeaders();
      console.log('🔍 Carregando serviços da tarefa:', taskId);
      
      const response = await fetch(`${API_BASE}/tasks/${taskId}/services`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Serviços da tarefa carregados:', data.length);
        setTaskServices(data);
      } else {
        console.error('❌ Erro ao carregar serviços da tarefa:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar serviços da tarefa:', error);
    }
  };

  // CORRIGIDO: URL da API
  const loadTaskReport = async (taskId) => {
    try {
      const headers = await getAuthHeaders();
      console.log('🔍 Carregando relatório da tarefa:', taskId);
      
      const response = await fetch(`${API_BASE}/tasks/${taskId}/report`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Relatório da tarefa carregado:', data);
        setTaskReport(data);
      } else {
        console.error('❌ Erro ao carregar relatório da tarefa:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar relatório da tarefa:', error);
    }
  };

  const loadProjectBudget = async (projectId, tasksArray = null) => {
    try {
      const headers = await getAuthHeaders();
      console.log('🔍 [DEBUG] Carregando orçamento do projeto:', projectId);
      
      // Tentar múltiplos endpoints para orçamento
      const budgetEndpoints = [
        `${API_BASE}/projects/${projectId}/budget`,
        `${API_BASE}/projects/${projectId}/costs`,
        `${API_BASE}/projects/${projectId}` // Endpoint básico do projeto
      ];
      
      let budgetData = null;
      let foundBudget = false;
      
      for (const endpoint of budgetEndpoints) {
        try {
          console.log('🌐 Tentando endpoint de orçamento:', endpoint);
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: headers,
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('📊 Resposta do endpoint', endpoint, ':', data);
            
            // Se for o endpoint básico do projeto, extrair dados de orçamento
            if (endpoint.includes(`/projects/${projectId}`) && !endpoint.includes('/budget') && !endpoint.includes('/costs')) {
              if (data.budget || data.totalBudget) {
                budgetData = {
                  totalBudget: data.budget || data.totalBudget || 0,
                  realizedCost: data.realizedCost || 0,
                  budgetVariance: (data.budget || data.totalBudget || 0) - (data.realizedCost || 0),
                  budgetUsagePercentage: data.budget ? Math.round(((data.realizedCost || 0) / data.budget) * 100) : 0,
                  isOverBudget: (data.realizedCost || 0) > (data.budget || data.totalBudget || 0),
                  completedTasks: data.completedTasks || 0,
                  pendingTasks: data.pendingTasks || 0,
                  totalTasks: data.totalTasks || 0
                };
                foundBudget = true;
                break;
              }
            }
            // Se for endpoint específico de orçamento
            else if (data && (data.totalBudget !== undefined || data.budget !== undefined)) {
              budgetData = data;
              foundBudget = true;
              break;
            }
          } else {
            console.log('⚠️ Endpoint', endpoint, 'retornou status:', response.status);
          }
        } catch (endpointError) {
          console.log('❌ Erro no endpoint', endpoint, ':', endpointError.message);
        }
      }
      
      if (foundBudget && budgetData) {
        console.log('✅ Orçamento do projeto carregado:', budgetData);
        
        // SEMPRE usar o cálculo local das tarefas (mais confiável)
        const tasksCost = calculateTotalTasksCost(tasksArray);
        console.log('🔄 [PRIORITY] Usando sempre custo das tarefas:', tasksCost);
        console.log('🔄 [COMPARE] API retornou:', budgetData.realizedCost, '| Tarefas calculadas:', tasksCost);
        console.log('🔄 [STATE] Tarefas no estado atual:', projectTasks.length);
        console.log('🔄 [PARAM] Tarefas passadas por parâmetro:', tasksArray?.length || 0);
        
        // Sobrescrever com dados calculados localmente
        budgetData.realizedCost = tasksCost;
        budgetData.budgetVariance = budgetData.totalBudget - tasksCost;
        budgetData.budgetUsagePercentage = budgetData.totalBudget > 0 ? 
          Math.round((tasksCost / budgetData.totalBudget) * 100) : 0;
        budgetData.isOverBudget = tasksCost > budgetData.totalBudget;
        
        setProjectBudget(budgetData);
      } else {
        console.log('⚠️ Nenhum orçamento encontrado, usando dados do projeto selecionado');
        // Fallback: usar dados básicos do projeto selecionado
        if (selectedProject) {
          const tasksCost = calculateTotalTasksCost(tasksArray);
          const tasksCount = tasksArray?.length || projectTasks.length;
          const fallbackBudget = {
            totalBudget: selectedProject.budget || 0,
            realizedCost: tasksCost,
            budgetVariance: (selectedProject.budget || 0) - tasksCost,
            budgetUsagePercentage: selectedProject.budget > 0 ? 
              Math.round((tasksCost / selectedProject.budget) * 100) : 0,
            isOverBudget: tasksCost > (selectedProject.budget || 0),
            completedTasks: 0,
            pendingTasks: 0,
            totalTasks: tasksCount
          };
          console.log('🔄 Usando dados de fallback com custos das tarefas:', fallbackBudget);
          setProjectBudget(fallbackBudget);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar orçamento do projeto:', error);
    }
  };

  const loadOverBudgetProjects = async () => {
    try {
      const headers = await getAuthHeaders();
      console.log('🔍 Carregando projetos estourados...');
      
      const response = await fetch(`${API_BASE}/projects/over-budget`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Projetos estourados carregados:', data);
        setOverBudgetProjects(Array.isArray(data) ? data : [data]);
      } else {
        console.error('❌ Erro ao carregar projetos estourados:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar projetos estourados:', error);
    }
  };

  const loadBudgetReport = async () => {
    try {
      const headers = await getAuthHeaders();
      console.log('🔍 Carregando relatório de orçamento...');
      
      // Primeiro tentar a API
      // Primeiro tentar API (agora corrigida) depois fallback local
      try {
        const response = await fetch(`${API_BASE}/projects/budget-report`, {
          method: 'GET',
          headers: headers,
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ [COST] Relatório de orçamento carregado da API:', data);
          
          // A API retorna um ARRAY com dados de cada projeto
          if (Array.isArray(data) && data.length > 0) {
            console.log('✅ [COST] Processando array de projetos da API');
            
            // Calcular totais de todos os projetos
            const totalBudget = data.reduce((sum, project) => sum + (project.totalBudget || 0), 0);
            const totalRealized = data.reduce((sum, project) => sum + (project.realizedCost || 0), 0);
            const avgProgress = data.reduce((sum, project) => sum + (project.progressPercentage || 0), 0) / data.length;
            
            setBudgetReport({
              totalBudget,
              realizedCost: totalRealized,
              progressPercentage: Math.round(avgProgress),
              projects: data
            });
            
            console.log('✅ [COST] Relatório da API processado (após recálculo):', {
              totalProjects: data.length,
              totalBudget: totalBudget,
              realizedCost: totalRealized,
              progressPercentage: Math.round(avgProgress)
            });
            return;
          }
        }
      } catch (apiError) {
        console.log('⚠️ API de relatório falhou, calculando localmente...');
      }
      
      // Fallback: calcular com base nos projetos e tarefas carregados
      console.log('🔄 Calculando relatório de orçamento localmente...');
      const calculatedTotals = await calculateAllProjectsCosts();
      
      setBudgetReport({
        totalBudget: calculatedTotals.totalBudget,
        realizedCost: calculatedTotals.realizedCost,
        progressPercentage: calculatedTotals.progressPercentage,
        projects: projects.map(project => ({
          projectId: project.id,
          projectName: project.name,
          totalBudget: project.budget || 0,
          realizedCost: 0, // Será calculado individualmente se necessário
          progressPercentage: 0
        }))
      });
      
      console.log('✅ Relatório calculado localmente:', calculatedTotals);
    } catch (error) {
      console.error('❌ Erro ao carregar relatório de orçamento:', error);
    }
  };

  // NOVO: Criar serviço
  const createService = async () => {
    try {
      const headers = await getAuthHeaders();
      console.log('➕ Criando serviço:', newService);
      
      // Validações
      if (!newService.name.trim()) {
        Alert.alert('Erro', 'Nome do serviço é obrigatório');
        return;
      }
      
      if (!newService.unitOfMeasurement.trim()) {
        Alert.alert('Erro', 'Unidade de medida é obrigatória');
        return;
      }

      const serviceData = {
        ...newService,
        unitLaborCost: parseFloat(newService.unitLaborCost) || 0,
        unitMaterialCost: parseFloat(newService.unitMaterialCost) || 0,
        unitEquipmentCost: parseFloat(newService.unitEquipmentCost) || 0,
      };

      const response = await fetch(`${API_BASE}/services`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Serviço criado:', data);
        Alert.alert('Sucesso', 'Serviço criado com sucesso!');
        setShowAddServiceModal(false);
        resetNewServiceForm();
        loadServices();
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao criar serviço:', errorData);
        Alert.alert('Erro', errorData.mensagem || 'Falha ao criar serviço');
      }
    } catch (error) {
      console.error('❌ Erro ao criar serviço:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  const addServiceToTask = async (taskId, serviceData) => {
    try {
      const headers = await getAuthHeaders();
      console.log('➕ [DEBUG] Adicionando serviço à tarefa:');
      console.log('   - TaskID:', taskId);
      console.log('   - ServiceData:', serviceData);
      console.log('   - URL:', `${API_BASE}/tasks/${taskId}/services`);
      
      const response = await fetch(`${API_BASE}/tasks/${taskId}/services`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Serviço adicionado à tarefa:', data);
        Alert.alert('Sucesso', 'Serviço adicionado à tarefa com sucesso!');
        
        // Recarregar dados relacionados
        await Promise.all([
          loadTaskServices(taskId),
          loadTaskReport(taskId),
        ]);
        
        // Recarregar lista de tarefas e orçamento para atualizar custos
        if (selectedProject) {
          console.log('🔄 Recarregando tarefas e orçamento do projeto...');
          // Ordem sequencial para garantir que tarefas sejam carregadas antes do orçamento
          const reloadedTasks = await loadProjectTasks(selectedProject.id);
          await loadProjectBudget(selectedProject.id, reloadedTasks);
          
          // Recarregar também o relatório geral
          console.log('🔄 Atualizando relatório geral...');
          await loadBudgetReport();
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao adicionar serviço à tarefa:', errorData);
        Alert.alert('Erro', errorData.mensagem || 'Falha ao adicionar serviço à tarefa');
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar serviço à tarefa:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  // NOVO: Adicionar serviço à tarefa via modal
  const handleAddServiceToTask = async () => {
    console.log('🔧 [DEBUG] handleAddServiceToTask iniciado');
    console.log('   - selectedTaskId:', selectedTaskId);
    console.log('   - serviceToTask:', serviceToTask);
    
    if (!selectedTaskId) {
      Alert.alert('Erro', 'Nenhuma tarefa selecionada');
      return;
    }

    if (!serviceToTask.serviceId) {
      Alert.alert('Erro', 'Selecione um serviço');
      return;
    }

    if (!serviceToTask.quantity || parseFloat(serviceToTask.quantity) <= 0) {
      Alert.alert('Erro', 'Quantidade deve ser maior que zero');
      return;
    }

    const serviceData = {
      serviceId: serviceToTask.serviceId,
      quantity: parseFloat(serviceToTask.quantity),
      unitCostOverride: serviceToTask.unitCostOverride ? parseFloat(serviceToTask.unitCostOverride) : null,
      notes: serviceToTask.notes || null
    };

    console.log('🚀 [DEBUG] Chamando addServiceToTask com:', selectedTaskId, serviceData);
    await addServiceToTask(selectedTaskId, serviceData);
    setShowAddServiceToTaskModal(false);
    resetServiceToTaskForm();
  };

  // CORRIGIDO: URL da API
  const removeServiceFromTask = async (taskId, serviceId) => {
    try {
      const headers = await getAuthHeaders();
      console.log('🗑️ Removendo serviço da tarefa:', taskId, serviceId);
      
      const response = await fetch(`${API_BASE}/tasks/${taskId}/services/${serviceId}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (response.ok) {
        console.log('✅ Serviço removido da tarefa');
        Alert.alert('Sucesso', 'Serviço removido da tarefa!');
        
        // Recarregar dados relacionados
        await Promise.all([
          loadTaskServices(taskId),
          loadTaskReport(taskId),
        ]);
        
        // Recarregar lista de tarefas e orçamento para atualizar custos
        if (selectedProject) {
          console.log('🔄 Recarregando tarefas e orçamento após remoção...');
          // Ordem sequencial para garantir que tarefas sejam carregadas antes do orçamento
          const reloadedTasks = await loadProjectTasks(selectedProject.id);
          await loadProjectBudget(selectedProject.id, reloadedTasks);
          
          // Recarregar também o relatório geral
          console.log('🔄 Atualizando relatório geral...');
          await loadBudgetReport();
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao remover serviço:', errorData);
        Alert.alert('Erro', errorData.mensagem || 'Falha ao remover serviço');
      }
    } catch (error) {
      console.error('❌ Erro ao remover serviço:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  const recalculateTaskCosts = async (taskId) => {
    try {
      const headers = await getAuthHeaders();
      console.log('🔄 Recalculando custos da tarefa:', taskId);
      
      const response = await fetch(`${API_BASE}/tasks/${taskId}/recalculate`, {
        method: 'POST',
        headers: headers,
      });

      if (response.ok) {
        console.log('✅ Custos da tarefa recalculados');
        Alert.alert('Sucesso', 'Custos da tarefa recalculados!');
        loadTaskReport(taskId);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao recalcular custos:', errorData);
        Alert.alert('Erro', errorData.mensagem || 'Falha ao recalcular custos');
      }
    } catch (error) {
      console.error('❌ Erro ao recalcular custos:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  const recalculateProjectCosts = async (projectId) => {
    try {
      const headers = await getAuthHeaders();
      console.log('🔄 [DEBUG] Recalculando custos do projeto:', projectId);
      
      // Tentar múltiplos endpoints para recálculo
      const recalcEndpoints = [
        `${API_BASE}/projects/${projectId}/recalculate-cost`,
        `${API_BASE}/projects/${projectId}/recalculate`,
        `${API_BASE}/projects/${projectId}/costs/recalculate`
      ];
      
      let recalculated = false;
      
      for (const endpoint of recalcEndpoints) {
        try {
          console.log('🌐 Tentando endpoint de recálculo:', endpoint);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
          });

          if (response.ok) {
            console.log('✅ Custos do projeto recalculados via', endpoint);
            recalculated = true;
            break;
          } else {
            console.log('⚠️ Endpoint', endpoint, 'retornou status:', response.status);
          }
        } catch (endpointError) {
          console.log('❌ Erro no endpoint', endpoint, ':', endpointError.message);
        }
      }
      
      if (recalculated) {
        Alert.alert('Sucesso', 'Custos do projeto recalculados!');
      } else {
        console.log('⚠️ Nenhum endpoint de recálculo funcionou, forçando recarregamento...');
        Alert.alert('Info', 'Atualizando dados do projeto...');
      }
      
      // Sempre recarregar dados após tentativa de recálculo
      console.log('🔄 Recarregando todos os dados do projeto...');
      // Ordem sequencial para garantir consistência
      const reloadedTasks = await loadProjectTasks(projectId);
      await loadProjectBudget(projectId, reloadedTasks);
      
    } catch (error) {
      console.error('❌ Erro ao recalcular custos do projeto:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  // NOVO: Atualizar progresso da tarefa
  const updateTaskProgress = async () => {
    try {
      const headers = await getAuthHeaders();
      console.log('📈 Atualizando progresso da tarefa:', selectedTaskId, progressUpdate);
      
      // Validações
      const progress = parseFloat(progressUpdate.progressPercentage);
      if (isNaN(progress) || progress < 0 || progress > 100) {
        Alert.alert('Erro', 'Progresso deve ser entre 0 e 100%');
        return;
      }

      const updateData = {
        progressPercentage: progress,
        notes: progressUpdate.notes || '',
        actualHours: parseFloat(progressUpdate.actualHours) || 0,
      };

      const response = await fetch(`${API_BASE}/tasks/${selectedTaskId}/progress`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Progresso atualizado:', data);
        Alert.alert('Sucesso', 'Progresso da tarefa atualizado!');
        setShowProgressModal(false);
        resetProgressForm();
        loadTaskReport(selectedTaskId);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao atualizar progresso:', errorData);
        Alert.alert('Erro', errorData.mensagem || 'Falha ao atualizar progresso');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar progresso:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  // NOVO: Selecionar projeto
  const selectProject = async (project) => {
    console.log('📌 [DEBUG] Selecionando projeto:', {
      id: project.id,
      name: project.name,
      budget: project.budget,
      originalData: project
    });
    
    setSelectedProject(project);
    setShowProjectSelector(false);
    
    // Carrega dados completos do projeto selecionado
    console.log('🔄 Carregando dados completos do projeto...');
    
    // Primeiro carregar tarefas, depois orçamento (ordem importante)
    console.log('🔄 Carregando tarefas do projeto ID:', project.id);
    const loadedTasks = await loadProjectTasks(project.id);
    console.log('✅ Tarefas carregadas. Total retornado:', loadedTasks.length);
    console.log('✅ Tarefas no estado:', projectTasks.length);
    
    console.log('🔄 Carregando orçamento do projeto...');
    await loadProjectBudget(project.id, loadedTasks);
    console.log('✅ Orçamento recalculado com base nas tarefas');
  };

  // Funções auxiliares
  const resetNewServiceForm = () => {
    setNewService({
      name: '',
      description: '',
      unitOfMeasurement: '',
      unitLaborCost: '',
      unitMaterialCost: '',
      unitEquipmentCost: '',
      isActive: true
    });
  };

  const resetProgressForm = () => {
    setProgressUpdate({
      progressPercentage: '',
      notes: '',
      actualHours: ''
    });
  };

  const resetServiceToTaskForm = () => {
    setServiceToTask({
      serviceId: null,
      quantity: '',
      unitCostOverride: '',
      notes: ''
    });
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

  // Função para calcular o total dos custos das tarefas
  const calculateTotalTasksCost = (tasksArray = null) => {
    const tasks = tasksArray || projectTasks;
    console.log('🧮 [DEBUG] Calculando total dos custos das tarefas:');
    console.log('   - Projeto selecionado:', selectedProject?.name, '(ID:', selectedProject?.id, ')');
    console.log('   - Tarefas para calcular:', tasks.length);
    console.log('   - Usando array passado:', tasksArray ? 'SIM' : 'NÃO (estado)');
    
    if (tasks.length === 0) {
      console.log('⚠️ Nenhuma tarefa disponível para calcular custos');
      return 0;
    }
    
    const total = tasks.reduce((sum, task) => {
      const taskCost = task.totalCost || 0;
      console.log(`   - Tarefa "${task.title}" (ID: ${task.id}): R$ ${taskCost}`);
      return sum + taskCost;
    }, 0);
    console.log('💰 Total calculado das tarefas:', total);
    return total;
  };

  // Função para calcular custos de TODOS os projetos
  const calculateAllProjectsCosts = async () => {
    try {
      console.log('🌍 [DEBUG] Calculando custos de todos os projetos...');
      const headers = await getAuthHeaders();
      
      let totalBudget = 0;
      let totalRealizedCost = 0;
      let totalCompleted = 0;
      let totalPending = 0;
      
      // Primeiro tentar usar endpoints individuais de orçamento por projeto
      for (const project of projects) {
        console.log(`🔍 Processando projeto: ${project.name} (ID: ${project.id})`);
        
        // SEMPRE calcular com base nas tarefas (API tem valores incorretos)
        console.log(`🔄 [COST] Calculando via tarefas para projeto: ${project.name}`);
        const projectTasksData = await loadProjectTasksForCalculation(project.id);
        
        // Calcular custo das tarefas
        const projectCost = projectTasksData.reduce((sum, task) => sum + (task.totalCost || 0), 0);
        
        // Contar tarefas
        const completedTasks = projectTasksData.filter(task => 
          task.status === 'COMPLETED' || task.status === 'Concluída'
        ).length;
        const pendingTasks = projectTasksData.length - completedTasks;
        
        console.log(`💰 Projeto "${project.name}": Orçamento R$ ${project.budget || 0} | Custo R$ ${projectCost} | Tarefas: ${completedTasks}/${projectTasksData.length}`);
        
        totalBudget += project.budget || 0;
        totalRealizedCost += projectCost;
        totalCompleted += completedTasks;
        totalPending += pendingTasks;
      }
      
      console.log('🎯 TOTAIS CALCULADOS:');
      console.log(`   - Orçamento Total: R$ ${totalBudget}`);
      console.log(`   - Custo Realizado Total: R$ ${totalRealizedCost}`);
      console.log(`   - Tarefas Concluídas: ${totalCompleted}`);
      console.log(`   - Tarefas Pendentes: ${totalPending}`);
      
      return {
        totalBudget,
        realizedCost: totalRealizedCost,
        progressPercentage: totalBudget > 0 ? Math.round((totalRealizedCost / totalBudget) * 100) : 0,
        completedTasks: totalCompleted,
        pendingTasks: totalPending,
        totalTasks: totalCompleted + totalPending
      };
    } catch (error) {
      console.error('❌ Erro ao calcular custos de todos os projetos:', error);
      return { 
        totalBudget: 0, 
        realizedCost: 0, 
        progressPercentage: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalTasks: 0
      };
    }
  };

  // Função auxiliar para carregar tarefas sem afetar o estado
  const loadProjectTasksForCalculation = async (projectId) => {
    try {
      const headers = await getAuthHeaders();
      
      // Tentar diferentes endpoints para obter tarefas do projeto
      const endpoints = [
        `https://sgpc-api.koyeb.app/api/projects/${projectId}/tasks/kanban`,
        `https://sgpc-api.koyeb.app/api/projects/${projectId}/tasks`,
        `https://sgpc-api.koyeb.app/api/tasks/project/${projectId}`,
        `https://sgpc-api.koyeb.app/api/tasks`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: headers,
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Se for o endpoint kanban, extrair tarefas de todas as colunas
            if (endpoint.includes('/kanban') && data) {
              const allTasks = [];
              Object.keys(data).forEach(column => {
                if (Array.isArray(data[column])) {
                  allTasks.push(...data[column]);
                }
              });
              
              if (allTasks.length > 0) {
                return allTasks;
              }
            }
            // Se for array de tarefas
            else if (Array.isArray(data)) {
              // Se for o endpoint /tasks (todas as tarefas), filtrar por projectId
              if (endpoint.includes('/tasks') && !endpoint.includes('/projects/')) {
                const filteredTasks = data.filter(task => 
                  task.projectId === projectId || 
                  task.project?.id === projectId
                );
                
                if (filteredTasks.length > 0) {
                  return filteredTasks;
                }
              }
              // Para outros endpoints, usar dados diretamente
              else if (data.length > 0) {
                return data;
              }
            }
          }
        } catch (endpointError) {
          console.log('❌ Erro no endpoint', endpoint, ':', endpointError.message);
        }
      }
      
      return [];
    } catch (error) {
      console.error('❌ Erro ao carregar tarefas para cálculo:', error);
      return [];
    }
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
            onPress={() => selectedProject && recalculateProjectCosts(selectedProject.id)}
          >
            <Ionicons name="refresh" size={20} color="#fd7e14" />
            <Text style={styles.actionText}>Recalcular</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={async () => {
              console.log('🔄 Forçando atualização de todos os totais...');
              await loadBudgetReport();
              Alert.alert('Sucesso', 'Totais atualizados com base nos custos reais das tarefas!');
            }}
          >
            <Ionicons name="calculator" size={20} color="#28a745" />
            <Text style={styles.actionText}>Atualizar Totais</Text>
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
      {/* Seletor de Projeto */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Projeto Selecionado</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => selectedProject && loadProjectTasks(selectedProject.id)}
            >
              <Ionicons name="refresh" size={20} color="#28a745" />
              <Text style={styles.refreshButtonText}>Atualizar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowProjectSelector(true)}
            >
              <Ionicons name="swap-horizontal" size={20} color="#007AFF" />
              <Text style={styles.selectButtonText}>Trocar</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {selectedProject ? (
          <View style={styles.selectedProjectCard}>
            <Text style={styles.selectedProjectName}>{selectedProject.name}</Text>
            <Text style={styles.selectedProjectDesc}>
              {projectTasks.length} tarefa(s) disponível(is)
            </Text>
          </View>
        ) : (
          <Text style={styles.noProjectText}>Nenhum projeto selecionado</Text>
        )}
      </View>

      {/* Lista de Tarefas do Projeto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tarefas do Projeto</Text>
        
        {projectTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
            <Text style={styles.emptySubtext}>
              {selectedProject ? 'Este projeto não possui tarefas' : 'Selecione um projeto primeiro'}
            </Text>
          </View>
        ) : (
          projectTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskButton}
              onPress={() => {
                setSelectedTaskId(task.id);
                setShowTaskDetailsModal(true);
                loadTaskServices(task.id);
                loadTaskReport(task.id);
              }}
            >
              <View style={styles.taskInfo}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {(!task.totalCost || task.totalCost === 0) && (
                    <View style={styles.noCostBadge}>
                      <Ionicons name="warning-outline" size={12} color="#f39c12" />
                      <Text style={styles.noCostText}>S/ Custos</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.taskSubtitle}>
                  Status: {task.statusDescription || task.status} • 
                  Progresso: {task.progressPercentage || 0}%
                </Text>
                <Text style={styles.taskCost}>
                  Custo: {formatCurrency(task.totalCost || 0)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );

  const renderProjectsTab = () => (
    <View style={styles.tabContent}>
      {/* Seletor de Projeto */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Projeto Selecionado</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowProjectSelector(true)}
          >
            <Ionicons name="swap-horizontal" size={20} color="#007AFF" />
            <Text style={styles.selectButtonText}>Trocar</Text>
          </TouchableOpacity>
        </View>
        
        {selectedProject ? (
          <View style={styles.selectedProjectCard}>
            <Text style={styles.selectedProjectName}>{selectedProject.name}</Text>
            <Text style={styles.selectedProjectDesc}>
              💰 Orçamento Original: {formatCurrency(selectedProject.budget || 0)}
            </Text>
            {projectBudget && (
              <Text style={styles.selectedProjectDesc}>
                📊 Orçamento Sistema: {formatCurrency(projectBudget.totalBudget || 0)}
              </Text>
            )}
            <Text style={styles.projectDebugInfo}>
              🔍 Debug - ID: {selectedProject.id} | Budget: {selectedProject.budget}
            </Text>
          </View>
        ) : (
          <Text style={styles.noProjectText}>Nenhum projeto selecionado</Text>
        )}
      </View>

      {projectBudget && selectedProject && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Orçamentário</Text>
          
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetTitle}>Resumo Orçamentário</Text>
              <View style={styles.budgetActions}>
                <TouchableOpacity
                  style={styles.syncButton}
                  onPress={async () => {
                    if (selectedProject) {
                      console.log('🔄 [SYNC] Forçando sincronização completa...');
                      
                      // Primeiro recarregar tarefas, depois orçamento
                      const syncedTasks = await loadProjectTasks(selectedProject.id);
                      console.log('✅ [SYNC] Tarefas recarregadas');
                      
                      await loadProjectBudget(selectedProject.id, syncedTasks);
                      console.log('✅ [SYNC] Orçamento recalculado');
                      
                      Alert.alert('Sucesso', `Dados sincronizados!\nCusto das tarefas: ${formatCurrency(calculateTotalTasksCost())}`);
                    }
                  }}
                >
                  <Ionicons name="sync" size={16} color="#28a745" />
                  <Text style={styles.syncText}>Sync</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => selectedProject && recalculateProjectCosts(selectedProject.id)}
                >
                  <Ionicons name="refresh" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
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
                {formatCurrency(projectBudget.realizedCost || calculateTotalTasksCost())}
              </Text>
            </View>

            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Variação:</Text>
              <Text style={[
                styles.budgetValue,
                { color: (projectBudget.budgetVariance || (projectBudget.totalBudget - calculateTotalTasksCost())) < 0 ? '#dc3545' : '#28a745' }
              ]}>
                {formatCurrency(projectBudget.budgetVariance || (projectBudget.totalBudget - calculateTotalTasksCost()))}
              </Text>
            </View>

            {calculateTotalTasksCost() > 0 && (
              <View style={styles.calculatedCostNotice}>
                <Ionicons name="calculator" size={16} color="#28a745" />
                <Text style={styles.calculatedCostText}>
                  ✅ Custos calculados em tempo real com base nas tarefas
                </Text>
              </View>
            )}

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
              <View style={styles.sectionHeader}>
                <Text style={styles.modalSectionTitle}>Serviços da Tarefa</Text>
                <TouchableOpacity
                  style={styles.addServiceToTaskButton}
                  onPress={() => setShowAddServiceToTaskModal(true)}
                >
                  <Ionicons name="add" size={20} color="#007AFF" />
                  <Text style={styles.addServiceButtonText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
              
              {taskServices.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="construct-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>Nenhum serviço associado</Text>
                  <Text style={styles.emptySubtext}>
                    Adicione serviços para calcular os custos da tarefa
                  </Text>
                </View>
              ) : (
                                 taskServices.map((service) => (
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
                ))
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.recalculateButton}
                onPress={() => recalculateTaskCosts(selectedTaskId)}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.recalculateText}>Recalcular Custos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.progressButton}
                onPress={() => {
                  setShowProgressModal(true);
                }}
              >
                <Ionicons name="trending-up" size={20} color="#fff" />
                <Text style={styles.progressButtonText}>Atualizar Progresso</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Criação de Serviço */}
      <Modal
        visible={showAddServiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Novo Serviço</Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddServiceModal(false);
                resetNewServiceForm();
              }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome do Serviço *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: Alvenaria de tijolos"
                value={newService.name}
                onChangeText={(text) => setNewService({...newService, name: text})}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Descrição detalhada do serviço"
                value={newService.description}
                onChangeText={(text) => setNewService({...newService, description: text})}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Unidade de Medida *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: m², m³, un"
                value={newService.unitOfMeasurement}
                onChangeText={(text) => setNewService({...newService, unitOfMeasurement: text})}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Custo Mão de Obra</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0,00"
                  value={newService.unitLaborCost}
                  onChangeText={(text) => setNewService({...newService, unitLaborCost: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Custo Material</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0,00"
                  value={newService.unitMaterialCost}
                  onChangeText={(text) => setNewService({...newService, unitMaterialCost: text})}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Custo Equipamento</Text>
              <TextInput
                style={styles.formInput}
                placeholder="0,00"
                value={newService.unitEquipmentCost}
                onChangeText={(text) => setNewService({...newService, unitEquipmentCost: text})}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddServiceModal(false);
                  resetNewServiceForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createButton}
                onPress={createService}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Criar Serviço</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Atualização de Progresso */}
      <Modal
        visible={showProgressModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Atualizar Progresso</Text>
            <TouchableOpacity
              onPress={() => {
                setShowProgressModal(false);
                resetProgressForm();
              }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Progresso (%) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="0 - 100"
                value={progressUpdate.progressPercentage}
                onChangeText={(text) => setProgressUpdate({...progressUpdate, progressPercentage: text})}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Horas Trabalhadas</Text>
              <TextInput
                style={styles.formInput}
                placeholder="0"
                value={progressUpdate.actualHours}
                onChangeText={(text) => setProgressUpdate({...progressUpdate, actualHours: text})}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Observações</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Descreva o progresso realizado..."
                value={progressUpdate.notes}
                onChangeText={(text) => setProgressUpdate({...progressUpdate, notes: text})}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowProgressModal(false);
                  resetProgressForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.updateButton}
                onPress={updateTaskProgress}
              >
                <Ionicons name="trending-up" size={20} color="#fff" />
                <Text style={styles.updateButtonText}>Atualizar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Seleção de Projeto */}
      <Modal
        visible={showProjectSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Projeto</Text>
            <TouchableOpacity
              onPress={() => setShowProjectSelector(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {projects.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum projeto encontrado</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={loadProjects}
                >
                  <Text style={styles.retryText}>Recarregar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.projectSelectorCard,
                    selectedProject?.id === project.id && styles.selectedProjectSelectorCard
                  ]}
                  onPress={() => selectProject(project)}
                >
                  <View style={styles.projectSelectorInfo}>
                    <Text style={styles.projectSelectorName}>{project.name}</Text>
                    <Text style={styles.projectSelectorDesc}>
                      Orçamento: {formatCurrency(project.budget || 0)}
                    </Text>
                    {project.description && (
                      <Text style={styles.projectSelectorSubDesc}>
                        {project.description}
                      </Text>
                    )}
                  </View>
                  {selectedProject?.id === project.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Adicionar Serviço à Tarefa */}
      <Modal
        visible={showAddServiceToTaskModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Serviço à Tarefa</Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddServiceToTaskModal(false);
                resetServiceToTaskForm();
              }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Selecionar Serviço *</Text>
              <ScrollView style={styles.serviceSelector} showsVerticalScrollIndicator={false}>
                {services.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Nenhum serviço disponível</Text>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={loadServices}
                    >
                      <Text style={styles.retryText}>Recarregar Serviços</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  services.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.serviceOption,
                        { backgroundColor: serviceToTask.serviceId === service.id ? '#007AFF' : '#f8f9fa' }
                      ]}
                      onPress={() => setServiceToTask({...serviceToTask, serviceId: service.id})}
                    >
                      <View style={styles.serviceOptionInfo}>
                        <Text style={[
                          styles.serviceOptionName,
                          { color: serviceToTask.serviceId === service.id ? '#fff' : '#333' }
                        ]}>
                          {service.name}
                        </Text>
                        <Text style={[
                          styles.serviceOptionDesc,
                          { color: serviceToTask.serviceId === service.id ? '#fff' : '#666' }
                        ]}>
                          {formatCurrency(service.totalUnitCost || 0)}/{service.unitOfMeasurement}
                        </Text>
                      </View>
                      {serviceToTask.serviceId === service.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Quantidade *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: 10"
                  value={serviceToTask.quantity}
                  onChangeText={(text) => setServiceToTask({...serviceToTask, quantity: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Custo Unitário (opcional)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Sobrescrever custo"
                  value={serviceToTask.unitCostOverride}
                  onChangeText={(text) => setServiceToTask({...serviceToTask, unitCostOverride: text})}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Observações</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Observações sobre este serviço..."
                value={serviceToTask.notes}
                onChangeText={(text) => setServiceToTask({...serviceToTask, notes: text})}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddServiceToTaskModal(false);
                  resetServiceToTaskForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleAddServiceToTask}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Adicionar</Text>
              </TouchableOpacity>
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
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  budgetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  syncText: {
    color: '#28a745',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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

  // Novos estilos para formulários e modais
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  progressButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
  },
  progressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  formGroupHalf: {
    flex: 1,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  updateButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Estilos para seleção de projeto
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selectButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  selectedProjectCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedProjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedProjectDesc: {
    fontSize: 14,
    color: '#666',
  },
  projectDebugInfo: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  calculatedCostNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  calculatedCostText: {
    fontSize: 12,
    color: '#28a745',
    marginLeft: 6,
    fontWeight: '600',
  },
  noProjectText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  projectSelectorCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedProjectSelectorCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f8f9ff',
  },
  projectSelectorInfo: {
    flex: 1,
  },
  projectSelectorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  projectSelectorDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  projectSelectorSubDesc: {
    fontSize: 12,
    color: '#999',
  },

  // Estilos para adicionar serviço à tarefa
  addServiceToTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addServiceButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  serviceSelector: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  serviceOptionInfo: {
    flex: 1,
  },
  serviceOptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceOptionDesc: {
    fontSize: 14,
  },

  // Estilos para indicador de sem custos
  noCostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  noCostText: {
    fontSize: 10,
    color: '#f39c12',
    fontWeight: '600',
    marginLeft: 2,
  },
  taskCost: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 4,
  },

  // Estilos para botões do cabeçalho
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  refreshButtonText: {
    color: '#28a745',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default CostManagement;