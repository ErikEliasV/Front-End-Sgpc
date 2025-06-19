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

  // Carregar dados dos projetos
  const loadProjectsData = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/projects/budget-report`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setProjectsData(data);
          
          // Calcular estatísticas
          const totalBudget = data.reduce((sum, project) => sum + (project.totalBudget || 0), 0);
          const totalRealized = data.reduce((sum, project) => sum + (project.realizedCost || 0), 0);
          const totalCompleted = data.reduce((sum, project) => sum + (project.completedTasks || 0), 0);
          const totalPending = data.reduce((sum, project) => sum + (project.pendingTasks || 0), 0);
          
          setStatsData({
            totalProjects: data.length,
            completedTasks: totalCompleted,
            pendingTasks: totalPending,
            totalBudget,
            realizedCost: totalRealized
          });
        }
      } else if (response.status === 401) {
        Alert.alert('Erro de Autenticação', 'Sessão expirada. Faça login novamente.');
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos projetos:', error);
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
          
          {projectsData.slice(0, 3).map((project) => (
            <View key={project.projectId} style={styles.progressItem}>
              <Text style={styles.progressLabel}>{project.projectName}</Text>
              <View style={styles.progressInfo}>
                <Text style={styles.progressBudget}>
                  {formatCurrency(project.realizedCost)} / {formatCurrency(project.totalBudget)}
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
                    width: `${calculateProgress(project.realizedCost, project.totalBudget)}%`,
                    backgroundColor: project.isOverBudget ? '#dc3545' : '#007AFF'
                  }
                ]} />
              </View>
              <Text style={styles.progressText}>
                {calculateProgress(project.realizedCost, project.totalBudget).toFixed(1)}% utilizado
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