import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projectsData, setProjectsData] = useState([]);
  const [statsData, setStatsData] = useState({
    totalProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalBudget: 0,
    realizedCost: 0
  });

  // URLs da API
  const API_BASE = 'https://sgpc-api.koyeb.app/api/cost';
  const PROJECTS_API = 'https://sgpc-api.koyeb.app/api';

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

  // Função auxiliar para carregar tarefas de um projeto
  const loadProjectTasks = async (projectId) => {
    try {
      const headers = await getAuthHeaders();
      
      // Tentar diferentes endpoints para obter tarefas do projeto
      const endpoints = [
        `${PROJECTS_API}/projects/${projectId}/tasks/kanban`,
        `${PROJECTS_API}/projects/${projectId}/tasks`,
        `${PROJECTS_API}/tasks/project/${projectId}`,
        `${PROJECTS_API}/tasks`
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
      console.error('❌ Erro ao carregar tarefas:', error);
      return [];
    }
  };

  // Função para calcular custos de todos os projetos
  const calculateAllProjectsCosts = async () => {
    try {
      console.log('🌍 [DASHBOARD] Calculando custos de todos os projetos...');
      const headers = await getAuthHeaders();
      
      // Primeiro carregar lista de projetos
      const projectsResponse = await fetch(`${PROJECTS_API}/projects`, {
        method: 'GET',
        headers: headers,
      });
      
      if (!projectsResponse.ok) {
        throw new Error('Falha ao carregar projetos');
      }
      
      const projects = await projectsResponse.json();
      console.log('📊 Projetos carregados:', projects.length);
      
      let totalBudget = 0;
      let totalRealizedCost = 0;
      let totalCompleted = 0;
      let totalPending = 0;
      const projectsWithCosts = [];
      
      for (const project of projects) {
        console.log(`🔍 Processando projeto: ${project.name} (ID: ${project.id})`);
        
        let projectCost = 0;
        let completedTasks = 0;
        let pendingTasks = 0;
        let projectTasks = [];
        
        // SEMPRE calcular com base nas tarefas (API tem valores incorretos)
        console.log(`🔄 [DASHBOARD] Calculando via tarefas para projeto: ${project.name}`);
        projectTasks = await loadProjectTasks(project.id);
        
        // Carregar custos das tarefas
        for (const task of projectTasks) {
          try {
            const response = await fetch(`${API_BASE}/tasks/${task.id}/report`, {
              method: 'GET',
              headers: headers,
            });
            
            if (response.ok) {
              const taskReport = await response.json();
              task.totalCost = taskReport.totalCost || 0;
              console.log(`💰 [DASHBOARD] Custo da tarefa ${task.id}: R$ ${task.totalCost}`);
            } else {
              task.totalCost = 0;
            }
          } catch (error) {
            console.log(`❌ [DASHBOARD] Erro ao carregar custo da tarefa ${task.id}:`, error.message);
            task.totalCost = 0;
          }
        }
        
        // Calcular custo das tarefas
        projectCost = projectTasks.reduce((sum, task) => sum + (task.totalCost || 0), 0);
        
        // Contar tarefas concluídas e pendentes
        completedTasks = projectTasks.filter(task => 
          task.status === 'COMPLETED' || task.status === 'Concluída'
        ).length;
        pendingTasks = projectTasks.length - completedTasks;
        
        console.log(`💰 [DASHBOARD] Projeto "${project.name}": Orçamento R$ ${project.totalBudget || project.budget || 0} | Custo R$ ${projectCost} | Tarefas: ${completedTasks}/${projectTasks.length}`);
        
        totalBudget += project.totalBudget || project.budget || 0;
        totalRealizedCost += projectCost;
        totalCompleted += completedTasks;
        totalPending += pendingTasks;
        
        const projectBudget = project.totalBudget || project.budget || 0;
        
        projectsWithCosts.push({
          projectId: project.id,
          projectName: project.name,
          totalBudget: projectBudget,
          realizedCost: projectCost,
          completedTasks,
          pendingTasks,
          totalTasks: projectTasks.length,
          progressPercentage: projectBudget > 0 ? Math.round((projectCost / projectBudget) * 100) : 0,
          isOverBudget: projectCost > projectBudget
        });
      }
      
      console.log('🎯 [DASHBOARD] TOTAIS GERAIS:');
      console.log(`   - Projetos: ${projects.length}`);
      console.log(`   - Orçamento Total: R$ ${totalBudget}`);
      console.log(`   - Custo Realizado Total: R$ ${totalRealizedCost}`);
      console.log(`   - Tarefas Concluídas: ${totalCompleted}`);
      console.log(`   - Tarefas Pendentes: ${totalPending}`);
      
      return {
        projects: projectsWithCosts,
        stats: {
          totalProjects: projects.length,
          completedTasks: totalCompleted,
          pendingTasks: totalPending,
          totalBudget,
          realizedCost: totalRealizedCost
        }
      };
    } catch (error) {
      console.error('❌ Erro ao calcular custos de todos os projetos:', error);
      return {
        projects: [],
        stats: {
          totalProjects: 0,
          completedTasks: 0,
          pendingTasks: 0,
          totalBudget: 0,
          realizedCost: 0
        }
      };
    }
  };

  // Carregar dados dos projetos
  const loadProjectsData = async () => {
    try {
      const headers = await getAuthHeaders();
      
      // SEMPRE calcular localmente - API tem dados incorretos
      console.log('🔄 [DASHBOARD] Forçando cálculo local (API tem valores incorretos)...');
      
      // Fallback: calcular com base nos projetos e tarefas
      console.log('🔄 [DASHBOARD] Calculando dados localmente...');
      const calculatedData = await calculateAllProjectsCosts();
      
      setProjectsData(calculatedData.projects);
      setStatsData(calculatedData.stats);
      
      console.log('✅ [DASHBOARD] Dados calculados localmente');
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados dos projetos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Verifique sua conexão.');
    }
  };

  // Carregar dados iniciais
  const loadInitialData = async () => {
    setLoading(true);
    await loadProjectsData();
    setLoading(false);
  };

  // Refresh dos dados
  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjectsData();
    setRefreshing(false);
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

  // Função para calcular progresso
  const calculateProgress = (realized, budget) => {
    if (budget === 0) return 0;
    return Math.min((realized / budget) * 100, 100);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Visão geral dos seus projetos</Text>
      </View>

      <View style={styles.content}>
        {/* Cards de Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="folder-outline" size={32} color="#007AFF" />
            <Text style={styles.statNumber}>{statsData.totalProjects}</Text>
            <Text style={styles.statLabel}>Projetos Ativos</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#28a745" />
            <Text style={styles.statNumber}>{statsData.completedTasks}</Text>
            <Text style={styles.statLabel}>Tarefas Concluídas</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={32} color="#ffc107" />
            <Text style={styles.statNumber}>{statsData.pendingTasks}</Text>
            <Text style={styles.statLabel}>Tarefas Pendentes</Text>
          </View>
        </View>

        {/* Cards de Orçamento */}
        <View style={styles.budgetContainer}>
          <View style={styles.budgetCard}>
            <Ionicons name="wallet-outline" size={24} color="#6f42c1" />
            <View style={styles.budgetContent}>
              <Text style={styles.budgetLabel}>Orçamento Total</Text>
              <Text style={styles.budgetValue}>{formatCurrency(statsData.totalBudget)}</Text>
            </View>
          </View>

          <View style={styles.budgetCard}>
            <Ionicons name="trending-up" size={24} color="#28a745" />
            <View style={styles.budgetContent}>
              <Text style={styles.budgetLabel}>Custo Realizado</Text>
              <Text style={styles.budgetValue}>{formatCurrency(statsData.realizedCost)}</Text>
            </View>
          </View>
        </View>

        {/* Progresso dos Projetos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progresso dos Projetos</Text>
          
          {projectsData.slice(0, 3).map((project, index) => (
            <View key={project.projectId || `project-${index}`} style={styles.progressItem}>
              <Text style={styles.progressLabel}>{project.projectName}</Text>
              <View style={styles.progressInfo}>
                <Text style={styles.progressBudget}>
                  {formatCurrency(project.realizedCost || 0)} / {formatCurrency(project.totalBudget || 0)}
                </Text>
                <Text style={[
                  styles.progressStatus,
                  { color: project.isOverBudget ? '#dc3545' : '#28a745' }
                ]}>
                  {project.isOverBudget ? 'Acima do orçamento' : 'Dentro do orçamento'}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { 
                    width: `${calculateProgress(project.realizedCost || 0, project.totalBudget || 0)}%`,
                    backgroundColor: project.isOverBudget ? '#dc3545' : '#007AFF'
                  }
                ]} />
              </View>
              <Text style={styles.progressText}>
                {calculateProgress(project.realizedCost || 0, project.totalBudget || 0).toFixed(1)}% utilizado
              </Text>
            </View>
          ))}

          {projectsData.length > 3 && (
            <Text style={styles.moreProjectsText}>
              E mais {projectsData.length - 3} projetos...
            </Text>
          )}
        </View>

        {/* Resumo Financeiro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Orçamento Total:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(statsData.totalBudget)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gasto até agora:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(statsData.realizedCost)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Saldo disponível:</Text>
              <Text style={[
                styles.summaryValue,
                { color: (statsData.totalBudget - statsData.realizedCost) >= 0 ? '#28a745' : '#dc3545' }
              ]}>
                {formatCurrency(statsData.totalBudget - statsData.realizedCost)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
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
  content: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  budgetCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetContent: {
    marginLeft: 12,
    flex: 1,
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
  progressItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBudget: {
    fontSize: 12,
    color: '#666',
  },
  progressStatus: {
    fontSize: 12,
    fontWeight: '600',
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
  moreProjectsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default Dashboard; 