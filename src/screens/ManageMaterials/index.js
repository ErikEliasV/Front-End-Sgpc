import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ManageMaterials = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL, LOW_STOCK, BY_SUPPLIER

  // Estados do formulário de material
  const [materialForm, setMaterialForm] = useState({
    name: '',
    description: '',
    category: '',
    unit: '',
    unitCost: '',
    currentStock: '',
    minimumStock: '',
    supplier: ''
  });

  // Estados do formulário de estoque
  const [stockForm, setStockForm] = useState({
    quantity: '',
    movementType: 'ENTRADA',
    observation: ''
  });

  // URL da API
  const API_BASE = 'https://sgpc-api.koyeb.app/api';

  // Tipos de movimento
  const movementTypes = [
    { key: 'ENTRADA', label: 'Entrada', color: '#28a745' },
    { key: 'SAIDA', label: 'Saída', color: '#dc3545' }
  ];

  // Filtros disponíveis
  const filterOptions = [
    { key: 'ALL', label: 'Todos', icon: 'cube-outline' },
    { key: 'LOW_STOCK', label: 'Estoque Baixo', icon: 'warning-outline' },
    { key: 'SEARCH', label: 'Pesquisar', icon: 'search-outline' }
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

  // Carregar todos os materiais
  const loadMaterials = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/materials`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setMaterials(Array.isArray(data) ? data : []);
        setFilteredMaterials(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro ao carregar materiais:', response.status);
        Alert.alert('Erro', 'Falha ao carregar materiais');
      }
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      Alert.alert('Erro', 'Erro de conexão');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregar materiais com estoque baixo
  const loadLowStockMaterials = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/materials/low-stock`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setFilteredMaterials(Array.isArray(data) ? data : []);
      } else {
        Alert.alert('Erro', 'Falha ao carregar materiais com estoque baixo');
      }
    } catch (error) {
      console.error('Erro ao carregar materiais com estoque baixo:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  // Pesquisar materiais por nome
  const searchMaterials = async (query) => {
    if (!query.trim()) {
      setFilteredMaterials(materials);
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/materials/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setFilteredMaterials(Array.isArray(data) ? data : []);
      } else {
        Alert.alert('Erro', 'Falha ao pesquisar materiais');
      }
    } catch (error) {
      console.error('Erro ao pesquisar materiais:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  // Obter material por ID
  const getMaterialById = async (materialId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/materials/${materialId}`, {
        method: 'GET',
        headers: headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        Alert.alert('Erro', 'Falha ao obter detalhes do material');
        return null;
      }
    } catch (error) {
      console.error('Erro ao obter material:', error);
      Alert.alert('Erro', 'Erro de conexão');
      return null;
    }
  };

  // Criar material
  const createMaterial = async () => {
    if (!materialForm.name.trim()) {
      Alert.alert('Erro', 'Nome do material é obrigatório');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/materials`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          name: materialForm.name,
          description: materialForm.description,
          category: materialForm.category,
          unit: materialForm.unit,
          unitCost: parseFloat(materialForm.unitCost) || 0,
          currentStock: parseInt(materialForm.currentStock) || 0,
          minimumStock: parseInt(materialForm.minimumStock) || 0,
          supplier: materialForm.supplier
        }),
      });
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Material criado com sucesso!');
        setShowCreateModal(false);
        resetMaterialForm();
        loadMaterials();
      } else {
        Alert.alert('Erro', 'Falha ao criar material');
      }
    } catch (error) {
      console.error('Erro ao criar material:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  // Editar material
  const editMaterial = async () => {
    if (!materialForm.name.trim()) {
      Alert.alert('Erro', 'Nome do material é obrigatório');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/materials/${selectedMaterial.id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          name: materialForm.name,
          description: materialForm.description,
          category: materialForm.category,
          unit: materialForm.unit,
          unitCost: parseFloat(materialForm.unitCost) || 0,
          currentStock: parseInt(materialForm.currentStock) || 0,
          minimumStock: parseInt(materialForm.minimumStock) || 0,
          supplier: materialForm.supplier
        }),
      });
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Material atualizado com sucesso!');
        setShowEditModal(false);
        setSelectedMaterial(null);
        resetMaterialForm();
        loadMaterials();
      } else {
        Alert.alert('Erro', 'Falha ao atualizar material');
      }
    } catch (error) {
      console.error('Erro ao editar material:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  // Deletar material
  const deleteMaterial = async (materialId, materialName) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${materialName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              const headers = await getAuthHeaders();
              const response = await fetch(`${API_BASE}/materials/${materialId}`, {
                method: 'DELETE',
                headers: headers,
              });
              
              if (response.ok) {
                Alert.alert('Sucesso', 'Material excluído com sucesso!');
                loadMaterials();
              } else {
                Alert.alert('Erro', 'Falha ao excluir material');
              }
            } catch (error) {
              console.error('Erro ao excluir material:', error);
              Alert.alert('Erro', 'Erro de conexão');
            }
          }
        }
      ]
    );
  };

  // Atualizar estoque (movimento geral)
  const updateStock = async () => {
    if (!stockForm.quantity.trim()) {
      Alert.alert('Erro', 'Quantidade é obrigatória');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/materials/${selectedMaterial.id}/stock`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          quantity: parseFloat(stockForm.quantity),
          movementType: stockForm.movementType,
          observation: stockForm.observation
        }),
      });
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Estoque atualizado com sucesso!');
        setShowStockModal(false);
        resetStockForm();
        loadMaterials();
      } else {
        Alert.alert('Erro', 'Falha ao atualizar estoque');
      }
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  // Adicionar ao estoque (ação rápida)
  const addToStock = async (materialId, quantity) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/materials/${materialId}/stock/add`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          quantity: quantity
        }),
      });
      
      if (response.ok) {
        Alert.alert('Sucesso', `${quantity} unidades adicionadas ao estoque!`);
        loadMaterials();
      } else {
        Alert.alert('Erro', 'Falha ao adicionar ao estoque');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao estoque:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  // Remover do estoque (ação rápida)
  const removeFromStock = async (materialId, quantity) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/materials/${materialId}/stock/remove`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          quantity: quantity
        }),
      });
      
      if (response.ok) {
        Alert.alert('Sucesso', `${quantity} unidades removidas do estoque!`);
        loadMaterials();
      } else {
        Alert.alert('Erro', 'Falha ao remover do estoque');
      }
    } catch (error) {
      console.error('Erro ao remover do estoque:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  // Ações rápidas de estoque
  const quickStockAction = (material, action) => {
    Alert.prompt(
      `${action === 'add' ? 'Adicionar' : 'Remover'} Estoque`,
      `Quantidade para ${action === 'add' ? 'adicionar' : 'remover'}:`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar',
          onPress: (quantity) => {
            const qty = parseFloat(quantity);
            if (qty && qty > 0) {
              if (action === 'add') {
                addToStock(material.id, qty);
              } else {
                removeFromStock(material.id, qty);
              }
            } else {
              Alert.alert('Erro', 'Quantidade inválida');
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  // Abrir modal de edição
  const openEditModal = async (material) => {
    // Buscar dados atualizados do material
    const updatedMaterial = await getMaterialById(material.id);
    if (updatedMaterial) {
      setSelectedMaterial(updatedMaterial);
      setMaterialForm({
        name: updatedMaterial.name || '',
        description: updatedMaterial.description || '',
        category: updatedMaterial.category || '',
        unit: updatedMaterial.unit || '',
        unitCost: updatedMaterial.unitCost?.toString() || '',
        currentStock: updatedMaterial.currentStock?.toString() || '',
        minimumStock: updatedMaterial.minimumStock?.toString() || '',
        supplier: updatedMaterial.supplier || ''
      });
      setShowEditModal(true);
    }
  };

  // Abrir modal de estoque
  const openStockModal = (material) => {
    setSelectedMaterial(material);
    setShowStockModal(true);
  };

  // Resetar formulário de material
  const resetMaterialForm = () => {
    setMaterialForm({
      name: '',
      description: '',
      category: '',
      unit: '',
      unitCost: '',
      currentStock: '',
      minimumStock: '',
      supplier: ''
    });
  };

  // Resetar formulário de estoque
  const resetStockForm = () => {
    setStockForm({
      quantity: '',
      movementType: 'ENTRADA',
      observation: ''
    });
  };

  // Aplicar filtro
  const applyFilter = (filterType) => {
    setSelectedFilter(filterType);
    
    switch (filterType) {
      case 'ALL':
        setFilteredMaterials(materials);
        break;
      case 'LOW_STOCK':
        loadLowStockMaterials();
        break;
      case 'SEARCH':
        // O filtro de pesquisa será aplicado quando o usuário digitar
        break;
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (selectedFilter === 'SEARCH') {
      searchMaterials(query);
    }
  };

  // Refresh
  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    setSelectedFilter('ALL');
    loadMaterials();
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // Função para formatar preço
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price || 0);
  };

  // Renderizar card de material
  const renderMaterialCard = (material) => (
    <View key={material.id} style={styles.materialCard}>
      <View style={styles.materialHeader}>
        <Text style={styles.materialName}>{material.name}</Text>
        <View style={styles.materialActions}>
          <TouchableOpacity
            style={styles.stockButton}
            onPress={() => openStockModal(material)}
          >
            <Ionicons name="swap-horizontal" size={16} color="#6f42c1" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(material)}
          >
            <Ionicons name="pencil-outline" size={16} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteMaterial(material.id, material.name)}
          >
            <Ionicons name="trash-outline" size={16} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.materialDescription}>{material.description}</Text>
      
      <View style={styles.materialInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Categoria:</Text>
          <Text style={styles.infoValue}>{material.category}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Unidade:</Text>
          <Text style={styles.infoValue}>{material.unit}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Custo unitário:</Text>
          <Text style={styles.infoValue}>{formatPrice(material.unitCost)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estoque atual:</Text>
          <Text style={[
            styles.infoValue,
            { color: material.currentStock <= material.minimumStock ? '#dc3545' : '#28a745' }
          ]}>
            {material.currentStock}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estoque mínimo:</Text>
          <Text style={styles.infoValue}>{material.minimumStock}</Text>
        </View>
        {material.supplier && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fornecedor:</Text>
            <Text style={styles.infoValue}>{material.supplier}</Text>
          </View>
        )}
      </View>

      {/* Ações rápidas de estoque */}
      <View style={styles.quickStockActions}>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#28a745' }]}
          onPress={() => quickStockAction(material, 'add')}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.quickActionText}>Adicionar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#dc3545' }]}
          onPress={() => quickStockAction(material, 'remove')}
        >
          <Ionicons name="remove" size={16} color="#fff" />
          <Text style={styles.quickActionText}>Remover</Text>
        </TouchableOpacity>
      </View>

      {material.currentStock <= material.minimumStock && (
        <View style={styles.lowStockAlert}>
          <Ionicons name="warning" size={16} color="#dc3545" />
          <Text style={styles.lowStockText}>Estoque baixo!</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando materiais...</Text>
      </View>
    );
  }

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
        <Text style={styles.title}>Gerenciar Materiais</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filtros e Pesquisa */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  { backgroundColor: selectedFilter === filter.key ? '#007AFF' : '#f8f9fa' }
                ]}
                onPress={() => applyFilter(filter.key)}
              >
                <Ionicons 
                  name={filter.icon} 
                  size={16} 
                  color={selectedFilter === filter.key ? '#fff' : '#007AFF'} 
                />
                <Text style={[
                  styles.filterText,
                  { color: selectedFilter === filter.key ? '#fff' : '#007AFF' }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {selectedFilter === 'SEARCH' && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar materiais..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        )}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map(material => renderMaterialCard(material))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum material encontrado</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'SEARCH' 
                ? 'Tente pesquisar com outros termos'
                : 'Adicione seu primeiro material clicando no botão +'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Criar Material */}
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
                resetMaterialForm();
              }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Novo Material</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={createMaterial}
            >
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome do Material *</Text>
              <TextInput
                style={styles.formInput}
                value={materialForm.name}
                onChangeText={(text) => setMaterialForm({...materialForm, name: text})}
                placeholder="Ex: Cimento Portland CP-II"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={materialForm.description}
                onChangeText={(text) => setMaterialForm({...materialForm, description: text})}
                placeholder="Descrição do material..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Categoria</Text>
                <TextInput
                  style={styles.formInput}
                  value={materialForm.category}
                  onChangeText={(text) => setMaterialForm({...materialForm, category: text})}
                  placeholder="Ex: Cimento"
                />
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Unidade</Text>
                <TextInput
                  style={styles.formInput}
                  value={materialForm.unit}
                  onChangeText={(text) => setMaterialForm({...materialForm, unit: text})}
                  placeholder="saco, kg, m², etc."
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Custo Unitário (R$)</Text>
                <TextInput
                  style={styles.formInput}
                  value={materialForm.unitCost}
                  onChangeText={(text) => setMaterialForm({...materialForm, unitCost: text})}
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Estoque Atual</Text>
                <TextInput
                  style={styles.formInput}
                  value={materialForm.currentStock}
                  onChangeText={(text) => setMaterialForm({...materialForm, currentStock: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Estoque Mínimo</Text>
                <TextInput
                  style={styles.formInput}
                  value={materialForm.minimumStock}
                  onChangeText={(text) => setMaterialForm({...materialForm, minimumStock: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Fornecedor</Text>
                <TextInput
                  style={styles.formInput}
                  value={materialForm.supplier}
                  onChangeText={(text) => setMaterialForm({...materialForm, supplier: text})}
                  placeholder="Nome do fornecedor"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Editar Material */}
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
                setSelectedMaterial(null);
                resetMaterialForm();
              }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Material</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={editMaterial}
            >
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome do Material *</Text>
              <TextInput
                style={styles.formInput}
                value={materialForm.name}
                onChangeText={(text) => setMaterialForm({...materialForm, name: text})}
                placeholder="Ex: Cimento Portland CP-II"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={materialForm.description}
                onChangeText={(text) => setMaterialForm({...materialForm, description: text})}
                placeholder="Descrição do material..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Categoria</Text>
                <TextInput
                  style={styles.formInput}
                  value={materialForm.category}
                  onChangeText={(text) => setMaterialForm({...materialForm, category: text})}
                  placeholder="Ex: Cimento"
                />
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Unidade</Text>
                <TextInput
                  style={styles.formInput}
                  value={materialForm.unit}
                  onChangeText={(text) => setMaterialForm({...materialForm, unit: text})}
                  placeholder="saco, kg, m², etc."
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Custo Unitário (R$)</Text>
                <TextInput
                  style={styles.formInput}
                  value={materialForm.unitCost}
                  onChangeText={(text) => setMaterialForm({...materialForm, unitCost: text})}
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Estoque Atual</Text>
                <TextInput
                  style={styles.formInput}
                  value={materialForm.currentStock}
                  onChangeText={(text) => setMaterialForm({...materialForm, currentStock: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Estoque Mínimo</Text>
                <TextInput
                  style={styles.formInput}
                  value={materialForm.minimumStock}
                  onChangeText={(text) => setMaterialForm({...materialForm, minimumStock: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Fornecedor</Text>
                <TextInput
                  style={styles.formInput}
                  value={materialForm.supplier}
                  onChangeText={(text) => setMaterialForm({...materialForm, supplier: text})}
                  placeholder="Nome do fornecedor"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Movimentação de Estoque */}
      <Modal
        visible={showStockModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowStockModal(false);
                setSelectedMaterial(null);
                resetStockForm();
              }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Movimentar Estoque</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={updateStock}
            >
              <Text style={styles.modalSaveText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedMaterial && (
              <View style={styles.materialSummary}>
                <Text style={styles.summaryTitle}>{selectedMaterial.name}</Text>
                <Text style={styles.summaryStock}>Estoque atual: {selectedMaterial.currentStock} {selectedMaterial.unit}</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo de Movimento</Text>
              <View style={styles.movementSelector}>
                {movementTypes.map((movement) => (
                  <TouchableOpacity
                    key={movement.key}
                    style={[
                      styles.movementOption,
                      { 
                        backgroundColor: stockForm.movementType === movement.key ? movement.color : '#f8f9fa',
                        borderColor: movement.color 
                      }
                    ]}
                    onPress={() => setStockForm({...stockForm, movementType: movement.key})}
                  >
                    <Text style={[
                      styles.movementOptionText,
                      { color: stockForm.movementType === movement.key ? '#fff' : movement.color }
                    ]}>
                      {movement.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Quantidade *</Text>
              <TextInput
                style={styles.formInput}
                value={stockForm.quantity}
                onChangeText={(text) => setStockForm({...stockForm, quantity: text})}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Observação</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={stockForm.observation}
                onChangeText={(text) => setStockForm({...stockForm, observation: text})}
                placeholder="Ex: Compra de materiais para projeto Vila Nova - NF 1234"
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
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
  materialCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  materialName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  materialActions: {
    flexDirection: 'row',
    gap: 8,
  },
  stockButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  materialDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  materialInfo: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  lowStockAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  lowStockText: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
    height: 80,
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
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  quickStockActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  materialSummary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryStock: {
    fontSize: 14,
    color: '#666',
  },
  movementSelector: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  movementOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  movementOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ManageMaterials; 