import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Materials = ({ navigation }) => {
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
        <Text style={styles.title}>Materiais</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Gestão de Materiais</Text>
        <Text style={styles.sectionDescription}>
          Escolha uma opção para gerenciar os materiais do projeto
        </Text>

        <View style={styles.optionsContainer}>
          {/* Gerenciar Materiais */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('ManageMaterials')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="cube" size={48} color="#007AFF" />
            </View>
            <Text style={styles.optionTitle}>Gerenciar Materiais</Text>
            <Text style={styles.optionDescription}>
              Visualize, adicione, edite e controle o estoque de materiais
            </Text>
            <View style={styles.optionFooter}>
              <Text style={styles.optionAction}>Acessar</Text>
              <Ionicons name="arrow-forward" size={16} color="#007AFF" />
            </View>
          </TouchableOpacity>

          {/* Solicitar Materiais */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('RequestMaterials')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="clipboard" size={48} color="#28a745" />
            </View>
            <Text style={styles.optionTitle}>Solicitar Materiais</Text>
            <Text style={styles.optionDescription}>
              Faça solicitações de materiais para seus projetos
            </Text>
            <View style={styles.optionFooter}>
              <Text style={styles.optionAction}>Acessar</Text>
              <Ionicons name="arrow-forward" size={16} color="#28a745" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Informações Adicionais */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#6c757d" />
            <Text style={styles.infoText}>
              Use "Gerenciar Materiais" para controlar o estoque e "Solicitar Materiais" para fazer pedidos
            </Text>
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
    fontSize: 20,
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  optionIcon: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  optionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  infoSection: {
    marginTop: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
});

export default Materials; 