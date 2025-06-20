import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Home = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.title}>Olá, Usuário! 👋</Text>
          <Text style={styles.subtitle}>Bem-vindo de volta ao Obra Fácil</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Cards de Ações Rápidas */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Tasks')}
            >
              <Ionicons name="add-circle" size={32} color="#007AFF" />
              <Text style={styles.actionText}>Nova Tarefa</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Projects')}
            >
              <Ionicons name="folder-open" size={32} color="#28a745" />
              <Text style={styles.actionText}>Projetos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('UserManagement')}
            >
              <Ionicons name="people" size={32} color="#6f42c1" />
              <Text style={styles.actionText}>Equipe</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Reports')}
            >
              <Ionicons name="analytics" size={32} color="#fd7e14" />
              <Text style={styles.actionText}>Relatórios</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gestão de Custos */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.costManagementCard}
            onPress={() => navigation.navigate('CostManagement')}
          >
            <View style={styles.costHeader}>
              <Ionicons name="calculator" size={24} color="#007AFF" />
              <Text style={styles.costTitle}>Gestão de Custos</Text>
            </View>
            <Text style={styles.costDescription}>
              Controle orçamentos e custos dos projetos
            </Text>
            <View style={styles.costFooter}>
              <Text style={styles.costAction}>Ver detalhes</Text>
              <Ionicons name="arrow-forward" size={16} color="#007AFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Dashboard */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.dashboardCard}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <View style={styles.dashboardHeader}>
              <Ionicons name="stats-chart" size={24} color="#28a745" />
              <Text style={styles.dashboardTitle}>Dashboard</Text>
            </View>
            <Text style={styles.dashboardDescription}>
              Visualize estatísticas e métricas dos projetos
            </Text>
            <View style={styles.dashboardFooter}>
              <Text style={styles.dashboardAction}>Acessar dashboard</Text>
              <Ionicons name="arrow-forward" size={16} color="#28a745" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Tarefas Recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tarefas Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={[styles.priorityIndicator, { backgroundColor: '#dc3545' }]} />
              <Text style={styles.taskTitle}>Implementar sistema de login</Text>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
            </View>
            <Text style={styles.taskDescription}>
              Desenvolver telas de autenticação com integração à API
            </Text>
            <View style={styles.taskFooter}>
              <Text style={styles.taskDate}>Concluído há 2 horas</Text>
              <View style={styles.taskProject}>
                <Text style={styles.projectText}>Obra Fácil</Text>
              </View>
            </View>
          </View>

          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={[styles.priorityIndicator, { backgroundColor: '#ffc107' }]} />
              <Text style={styles.taskTitle}>Design da interface principal</Text>
              <Ionicons name="time-outline" size={20} color="#ffc107" />
            </View>
            <Text style={styles.taskDescription}>
              Criar layouts responsivos para as telas principais
            </Text>
            <View style={styles.taskFooter}>
              <Text style={styles.taskDate}>Prazo: amanhã</Text>
              <View style={styles.taskProject}>
                <Text style={styles.projectText}>UI/UX</Text>
              </View>
            </View>
          </View>

          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={[styles.priorityIndicator, { backgroundColor: '#007AFF' }]} />
              <Text style={styles.taskTitle}>Testes de integração</Text>
              <Ionicons name="ellipse-outline" size={20} color="#6c757d" />
            </View>
            <Text style={styles.taskDescription}>
              Validar funcionamento das APIs e fluxos do usuário
            </Text>
            <View style={styles.taskFooter}>
              <Text style={styles.taskDate}>Prazo: próxima semana</Text>
              <View style={styles.taskProject}>
                <Text style={styles.projectText}>QA</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Resumo do Dia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo de Hoje</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>8</Text>
              <Text style={styles.summaryLabel}>Horas trabalhadas</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>5</Text>
              <Text style={styles.summaryLabel}>Tarefas concluídas</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>3</Text>
              <Text style={styles.summaryLabel}>Reuniões</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  greeting: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  quickActions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    marginLeft: 14,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 14,
  },
  taskDate: {
    fontSize: 12,
    color: '#999',
  },
  taskProject: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  projectText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
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
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e9ecef',
    marginHorizontal: 15,
  },
  costManagementCard: {
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
  costHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  costTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  costDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  costFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costAction: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  dashboardCard: {
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
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  dashboardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  dashboardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashboardAction: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
});

export default Home; 