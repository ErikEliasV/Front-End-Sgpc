import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const Reports = ({ navigation }) => {
  const [loading, setLoading] = useState({
    summary: false,
    stock: false,
    projects: false,
    costs: false,
  });

  // URLs da API
  const API_BASE = 'https://sgpc-api.koyeb.app/api';

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

  // Função genérica para baixar relatório CSV
  const downloadReport = async (endpoint, reportName, reportType) => {
    setLoading(prev => ({ ...prev, [reportType]: true }));
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const csvData = await response.text();
        
        // Criar arquivo temporário
        const fileName = `${reportName}_${new Date().toISOString().split('T')[0]}.csv`;
        const fileUri = FileSystem.documentDirectory + fileName;
        
        // Salvar o CSV
        await FileSystem.writeAsStringAsync(fileUri, csvData, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        // Compartilhar o arquivo
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: `Compartilhar ${reportName}`,
          });
        } else {
          Alert.alert('Sucesso', `Relatório salvo em: ${fileUri}`);
        }
        
        Alert.alert('Sucesso', `Relatório ${reportName} gerado com sucesso!`);
      } else if (response.status === 401) {
        Alert.alert('Erro de Autenticação', 'Sessão expirada. Faça login novamente.');
      } else {
        Alert.alert('Erro', `Falha ao gerar relatório ${reportName}.`);
      }
    } catch (error) {
      console.error(`Erro ao gerar relatório ${reportName}:`, error);
      Alert.alert('Erro', 'Erro de conexão ao gerar relatório.');
    } finally {
      setLoading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  // Relatórios disponíveis
  const reports = [
    {
      id: 'summary',
      title: 'Relatório Resumo',
      description: 'Relatório geral com resumo de todas as atividades e estatísticas principais',
      icon: 'document-text-outline',
      color: '#007AFF',
      endpoint: '/reports/summary',
      fileName: 'relatorio_resumo'
    },
    {
      id: 'stock',
      title: 'Relatório de Estoque',
      description: 'Relatório de materiais em estoque, quantidades e alertas de baixo estoque',
      icon: 'cube-outline',
      color: '#28a745',
      endpoint: '/reports/stock',
      fileName: 'relatorio_estoque'
    },
    {
      id: 'projects',
      title: 'Relatório de Projetos',
      description: 'Relatório completo de todos os projetos, status e progresso',
      icon: 'folder-open-outline',
      color: '#6f42c1',
      endpoint: '/reports/projects',
      fileName: 'relatorio_projetos'
    },
    {
      id: 'costs',
      title: 'Relatório de Custos',
      description: 'Relatório detalhado de custos por projeto e categoria de gastos',
      icon: 'cash-outline',
      color: '#fd7e14',
      endpoint: '/reports/costs',
      fileName: 'relatorio_custos'
    }
  ];

  const renderReportCard = (report) => (
    <TouchableOpacity
      key={report.id}
      style={[styles.reportCard, { borderLeftColor: report.color }]}
      onPress={() => downloadReport(report.endpoint, report.title, report.id)}
      disabled={loading[report.id]}
    >
      <View style={styles.reportHeader}>
        <View style={[styles.iconContainer, { backgroundColor: report.color + '20' }]}>
          <Ionicons name={report.icon} size={32} color={report.color} />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportDescription}>{report.description}</Text>
        </View>
      </View>
      
      <View style={styles.reportFooter}>
        <View style={styles.reportMeta}>
          <Ionicons name="download-outline" size={16} color="#666" />
          <Text style={styles.formatText}>Formato: CSV</Text>
        </View>
        
        {loading[report.id] ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={report.color} />
            <Text style={[styles.loadingText, { color: report.color }]}>Gerando...</Text>
          </View>
        ) : (
          <View style={[styles.downloadButton, { backgroundColor: report.color }]}>
            <Ionicons name="download" size={16} color="#fff" />
            <Text style={styles.downloadText}>Baixar</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Relatórios</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Descrição */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Gerar Relatórios</Text>
          <Text style={styles.descriptionText}>
            Gere relatórios detalhados em formato CSV para análise e controle de dados.
            Os arquivos podem ser abertos no Excel ou Google Sheets.
          </Text>
        </View>

        {/* Cards de Relatórios */}
        <View style={styles.reportsContainer}>
          {reports.map(report => renderReportCard(report))}
        </View>

        {/* Informações Adicionais */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Como usar os relatórios</Text>
              <Text style={styles.infoText}>
                • Os relatórios são gerados em tempo real com dados atualizados{'\n'}
                • Formato CSV compatível com Excel e Google Sheets{'\n'}
                • Arquivos são salvos automaticamente no seu dispositivo{'\n'}
                • Você pode compartilhar os relatórios por email ou outras apps
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={24} color="#28a745" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Frequência recomendada</Text>
              <Text style={styles.infoText}>
                • Relatório Resumo: Semanal{'\n'}
                • Relatório de Estoque: Diário{'\n'}
                • Relatório de Projetos: Quinzenal{'\n'}
                • Relatório de Custos: Mensal
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#007AFF',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  descriptionContainer: {
    marginBottom: 30,
  },
  descriptionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  reportsContainer: {
    marginBottom: 30,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  downloadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default Reports; 