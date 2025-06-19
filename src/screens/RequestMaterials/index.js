import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatePicker } from '../../components';

const API_BASE_URL = 'https://sgpc-api.koyeb.app';

const RequestMaterials = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);

  // Estados do formulário de criação
  const [newRequest, setNewRequest] = useState({
    projectId: '',
    neededDate: '',
    observations: '',
  });
  const [newItems, setNewItems] = useState([{
    materialId: '',
    quantity: '',
    observations: ''
  }]);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  const tabs = [
    { key: 'all', title: 'Todas', endpoint: '' },
    { key: 'pending', title: 'Pendentes', endpoint: '/pending' },
    { key: 'approved', title: 'Aprovadas', endpoint: '/approved' },
    { key: 'rejected', title: 'Rejeitadas', endpoint: '/rejected' },
  ];

  useEffect(() => {
    fetchRequests();
    loadInitialData();
  }, [activeTab]);

  const loadInitialData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Carregar projetos e materiais para o formulário
      const [projectsResponse, materialsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/projects`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }),
        fetch(`${API_BASE_URL}/api/materials`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        })
      ]);

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        console.log('📋 Dados dos projetos:', projectsData);
        // A API pode retornar os dados diretamente ou dentro de uma propriedade 'data'
        const projectsList = Array.isArray(projectsData) ? projectsData : (projectsData.data || []);
        setProjects(projectsList);
        console.log('📋 Projetos carregados:', projectsList.length);
      } else {
        console.error('❌ Erro ao carregar projetos:', projectsResponse.status, projectsResponse.statusText);
        const errorData = await projectsResponse.json().catch(() => ({}));
        console.error('❌ Detalhes do erro projetos:', errorData);
      }

      if (materialsResponse.ok) {
        const materialsData = await materialsResponse.json();
        console.log('🧱 Dados dos materiais:', materialsData);
        // A API pode retornar os dados diretamente ou dentro de uma propriedade 'data'
        const materialsList = Array.isArray(materialsData) ? materialsData : (materialsData.data || []);
        setMaterials(materialsList);
        console.log('🧱 Materiais carregados:', materialsList.length);
      } else {
        console.error('❌ Erro ao carregar materiais:', materialsResponse.status, materialsResponse.statusText);
        const errorData = await materialsResponse.json().catch(() => ({}));
        console.error('❌ Detalhes do erro materiais:', errorData);
      }
    } catch (error) {
      console.log('Erro ao carregar dados iniciais:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      console.log('🔍 Buscando solicitações - Token:', token ? 'Presente' : 'Ausente');
      
      const currentTab = tabs.find(tab => tab.key === activeTab);
      const endpoint = currentTab?.endpoint || '';
      const url = `${API_BASE_URL}/api/material-requests${endpoint}`;
      
      console.log('🌐 URL da requisição:', url);
      console.log('📑 Aba ativa:', activeTab, '- Endpoint:', endpoint);
      
      console.log('📡 Headers sendo enviados:', {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      console.log('📡 Status da resposta (listar):', response.status);
      
      const data = await response.json();
      console.log('📋 Dados recebidos:', data);
      
      if (response.ok) {
        // Flexibilidade para diferentes estruturas de resposta
        const requestsList = Array.isArray(data) ? data : (data.data || data.requests || []);
        setRequests(requestsList);
        console.log('✅ Solicitações carregadas:', requestsList.length);
      } else {
        console.error('❌ Erro ao carregar solicitações:', data);
        
        if (response.status === 500) {
          Alert.alert(
            'Servidor Temporariamente Indisponível', 
            'O servidor está com problemas internos. Tente novamente em alguns minutos.\n\nPor enquanto, você pode criar novas solicitações que serão sincronizadas quando o servidor voltar ao normal.',
            [
              { text: 'OK', style: 'default' },
              { text: 'Tentar Novamente', onPress: () => fetchRequests() }
            ]
          );
        } else {
          Alert.alert('Erro', data.mensagem || data.message || `Erro ${response.status}: ${data.erro || data.error || 'Erro ao carregar solicitações'}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações:', error);
      Alert.alert('Erro', `Erro de conexão: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const fetchRequestDetails = async (requestId) => {
    try {
      console.log('🔍 Buscando detalhes da solicitação:', requestId);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/material-requests/${requestId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      console.log('📡 Status detalhes:', response.status);
      const data = await response.json();
      console.log('📋 Detalhes recebidos:', data);
      
      if (response.ok) {
        // Flexibilidade para diferentes estruturas de resposta
        const requestDetails = data.data || data;

        
        setSelectedRequest(requestDetails);
        setShowDetailsModal(true);
      } else {
        console.error('❌ Erro ao carregar detalhes:', data);
        Alert.alert('Erro', data.message || `Erro ${response.status}: ${data.error || 'Erro ao carregar detalhes'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes:', error);
      Alert.alert('Erro', `Erro de conexão: ${error.message}`);
    }
  };

  const createRequest = async () => {
    try {
      console.log('🚀 Iniciando criação de solicitação...');
      
      // Validações
      if (!newRequest.projectId || !newRequest.neededDate) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
        return;
      }

      if (newItems.some(item => !item.materialId || !item.quantity)) {
        Alert.alert('Erro', 'Preencha todos os itens da solicitação');
        return;
      }

      // Validar se a data foi selecionada
      if (!newRequest.neededDate) {
        Alert.alert('Erro', 'Selecione a data necessária');
        return;
      }

      const token = await AsyncStorage.getItem('userToken');
      console.log('🔑 Token encontrado:', token ? 'Sim' : 'Não');
      
      const requestData = {
        ...newRequest,
        projectId: parseInt(newRequest.projectId),
        items: newItems.map(item => ({
          ...item,
          materialId: parseInt(item.materialId),
          quantity: parseInt(item.quantity)
        }))
      };

      console.log('📝 Dados da solicitação:', JSON.stringify(requestData, null, 2));

      // A API requer requesterId como query parameter
      const response = await fetch(`${API_BASE_URL}/api/material-requests?requesterId=1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(requestData),
      });

      console.log('📡 Status da resposta:', response.status);
      
      const data = await response.json();
      console.log('📋 Resposta da API:', data);

      if (response.ok) {
        Alert.alert('Sucesso', 'Solicitação criada com sucesso!');
        setShowCreateModal(false);
        resetForm();
        fetchRequests();
      } else {
        console.error('❌ Erro na criação:', data);
        Alert.alert('Erro', data.message || `Erro ${response.status}: ${data.error || 'Erro ao criar solicitação'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao criar solicitação:', error);
      Alert.alert('Erro', `Erro de conexão: ${error.message}`);
    }
  };

  const updateRequestStatus = async (requestId, action) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/material-requests/${requestId}/${action}?approverId=1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso', `Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso!`);
        setShowDetailsModal(false);
        fetchRequests();
      } else {
        Alert.alert('Erro', data.message || 'Erro ao atualizar solicitação');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  const resetForm = () => {
    setNewRequest({
      projectId: '',
      neededDate: '',
      observations: '',
    });
    setNewItems([{
      materialId: '',
      quantity: '',
      observations: ''
    }]);
    setShowProjectPicker(false);
    setShowMaterialPicker(false);
    setSelectedItemIndex(0);
  };

  const addNewItem = () => {
    setNewItems([...newItems, {
      materialId: '',
      quantity: '',
      observations: ''
    }]);
  };

  const removeItem = (index) => {
    if (newItems.length > 1) {
      const updated = newItems.filter((_, i) => i !== index);
      setNewItems(updated);
    }
  };

  const updateItem = (index, field, value) => {
    const updated = [...newItems];
    updated[index][field] = value;
    setNewItems(updated);
  };

  const selectProject = (project) => {
    setNewRequest({...newRequest, projectId: project.id.toString()});
    setShowProjectPicker(false);
  };

  const selectMaterial = (material) => {
    updateItem(selectedItemIndex, 'materialId', material.id.toString());
    setShowMaterialPicker(false);
  };

  const getSelectedProject = () => {
    return projects.find(p => p.id.toString() === newRequest.projectId);
  };

  const getSelectedMaterial = (materialId) => {
    return materials.find(m => m.id.toString() === materialId);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FF9500';
      case 'approved': return '#34C759';
      case 'rejected': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovada';
      case 'rejected': return 'Rejeitada';
      default: return status || 'Desconhecido';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPendingCount = () => {
    return requests.filter(request => 
      request.status?.toLowerCase() === 'pending' || 
      request.status?.toLowerCase() === 'pendente' ||
      request.status === 'PENDENTE'
    ).length;
  };

  const getItemsCount = (request) => {
    // Tentar diferentes formas de contar os itens
    if (request.items && Array.isArray(request.items)) {
      return request.items.length;
    }
    if (request.itemsCount && request.itemsCount > 0) {
      return request.itemsCount;
    }
    if (request.materialsCount && request.materialsCount > 0) {
      return request.materialsCount;
    }
    // Se nenhum dos acima funcionar, assumir que tem pelo menos 1 item
    return 1;
  };

  const getItemQuantity = (item) => {
    // Tentar diferentes nomes de campos para quantidade
    return item.quantity || 
           item.quantityRequested || 
           item.amount || 
           item.qty || 
           'N/A';
  };

  const getItemUnit = (item) => {
    // Tentar diferentes nomes de campos para unidade
    return item.materialUnitOfMeasure || 
           item.unit || 
           item.unitOfMeasure || 
           item.measure || 
           '';
  };

  const renderRequestItem = ({ item }) => (
    <View style={[
      styles.requestCard,
      (item.status?.toLowerCase() === 'pending' || 
       item.status?.toLowerCase() === 'pendente' ||
       item.status === 'PENDENTE') && styles.pendingRequestCard
    ]}>
      <TouchableOpacity
        style={styles.requestMainContent}
        onPress={() => fetchRequestDetails(item.id)}
      >
        <View style={styles.requestHeader}>
          <Text style={styles.requestId}>#{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        
        <Text style={styles.projectName}>Projeto: {item.projectName || 'N/A'}</Text>
        <Text style={styles.requesterName}>Solicitante: {item.requesterName || 'N/A'}</Text>
        <Text style={styles.itemsCount}>{getItemsCount(item)} itens solicitados</Text>
        
        {item.notes && (
          <Text style={styles.observations} numberOfLines={2}>
            Obs: {item.notes}
          </Text>
        )}

        <View style={styles.requestFooter}>
          <Text style={styles.requestCreated}>
            Criada em {formatDate(item.requestDate)}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#007AFF" />
        </View>
      </TouchableOpacity>

      {/* Botões de ação rápida para solicitações pendentes */}
      {(item.status?.toLowerCase() === 'pending' || 
        item.status?.toLowerCase() === 'pendente' ||
        item.status === 'PENDENTE') && (
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsLabel}>Ações rápidas:</Text>
          <View style={styles.quickActionsButtons}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.approveQuickButton]}
              onPress={() => {
                Alert.alert(
                  'Aprovar Solicitação',
                  `Confirma a aprovação da solicitação #${item.id}?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                      text: 'Aprovar', 
                      style: 'default',
                      onPress: () => updateRequestStatus(item.id, 'approve')
                    }
                  ]
                );
              }}
            >
              <Ionicons name="checkmark" size={16} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, styles.rejectQuickButton]}
              onPress={() => {
                Alert.alert(
                  'Rejeitar Solicitação',
                  `Confirma a rejeição da solicitação #${item.id}?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                      text: 'Rejeitar', 
                      style: 'destructive',
                      onPress: () => updateRequestStatus(item.id, 'reject')
                    }
                  ]
                );
              }}
            >
              <Ionicons name="close" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => {
            setShowCreateModal(false);
            resetForm();
          }}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Nova Solicitação</Text>
          <TouchableOpacity onPress={createRequest}>
            <Text style={styles.saveButton}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Gerais</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Projeto *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowProjectPicker(true)}
              >
                <Text style={[styles.pickerButtonText, !newRequest.projectId && styles.placeholderText]}>
                  {getSelectedProject()?.name || 'Selecione um projeto'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <DatePicker
              label="Data Necessária"
              value={newRequest.neededDate}
              onDateChange={(formattedDate) => setNewRequest({...newRequest, neededDate: formattedDate})}
              placeholder="Selecione a data necessária"
              required={true}
              minimumDate={new Date()}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Observações</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Observações gerais da solicitação"
                value={newRequest.observations}
                onChangeText={(text) => setNewRequest({...newRequest, observations: text})}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Itens Solicitados</Text>
              <TouchableOpacity onPress={addNewItem} style={styles.addButton}>
                <Ionicons name="add" size={20} color="#007AFF" />
                <Text style={styles.addButtonText}>Adicionar Item</Text>
              </TouchableOpacity>
            </View>

            {newItems.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>Item {index + 1}</Text>
                  {newItems.length > 1 && (
                    <TouchableOpacity onPress={() => removeItem(index)}>
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Material *</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      setSelectedItemIndex(index);
                      setShowMaterialPicker(true);
                    }}
                  >
                    <Text style={[styles.pickerButtonText, !item.materialId && styles.placeholderText]}>
                      {getSelectedMaterial(item.materialId)?.name || 'Selecione um material'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Quantidade *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Quantidade"
                    value={item.quantity}
                    onChangeText={(text) => updateItem(index, 'quantity', text)}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Observações</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Observações específicas do item"
                    value={item.observations}
                    onChangeText={(text) => updateItem(index, 'observations', text)}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showDetailsModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Detalhes da Solicitação</Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedRequest && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsId}>Solicitação #{selectedRequest.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRequest.status) }]}>
                <Text style={styles.statusText}>{getStatusText(selectedRequest.status)}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações Gerais</Text>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Projeto:</Text>
                <Text style={styles.detailValue}>{selectedRequest.projectName || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Solicitante:</Text>
                <Text style={styles.detailValue}>{selectedRequest.requesterName || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Criada em:</Text>
                <Text style={styles.detailValue}>{formatDate(selectedRequest.requestDate)}</Text>
              </View>
              {selectedRequest.notes && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Observações:</Text>
                  <Text style={styles.detailValue}>{selectedRequest.notes}</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Itens Solicitados</Text>
              {selectedRequest.items?.map((item, index) => (
                <View key={index} style={styles.itemDetail}>
                  <Text style={styles.itemDetailTitle}>
                    {item.materialName || `Material ID: ${item.materialId}`}
                  </Text>
                  <Text style={styles.itemDetailQuantity}>
                    Quantidade: {getItemQuantity(item)} {getItemUnit(item)}
                  </Text>
                  {item.observations && (
                    <Text style={styles.itemDetailObs}>Obs: {item.observations}</Text>
                  )}
                </View>
              )) || (
                <Text style={styles.noItemsText}>
                  {getItemsCount(selectedRequest) > 0 
                    ? `${getItemsCount(selectedRequest)} itens (detalhes não disponíveis)`
                    : 'Nenhum item encontrado'
                  }
                </Text>
              )}
            </View>

            {(selectedRequest.status?.toLowerCase() === 'pending' || 
              selectedRequest.status?.toLowerCase() === 'pendente' ||
              selectedRequest.status === 'PENDENTE') && (
              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => updateRequestStatus(selectedRequest.id, 'approve')}
                >
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>Aprovar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => updateRequestStatus(selectedRequest.id, 'reject')}
                >
                  <Ionicons name="close" size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>Rejeitar</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const renderProjectPickerModal = () => (
    <Modal
      visible={showProjectPicker}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowProjectPicker(false)}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Selecionar Projeto</Text>
          <TouchableOpacity onPress={() => {
            console.log('🔄 Recarregando projetos manualmente...');
            loadInitialData();
          }}>
            <Ionicons name="refresh" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => selectProject(item)}
            >
              <View style={styles.pickerItemContent}>
                <Text style={styles.pickerItemTitle}>{item.name}</Text>
                {item.client && (
                  <Text style={styles.pickerItemSubtitle}>Cliente: {item.client}</Text>
                )}
                {item.status && (
                  <Text style={styles.pickerItemDescription}>Status: {item.statusDescription || item.status}</Text>
                )}
              </View>
              {newRequest.projectId === item.id.toString() && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.pickerList}
          ListEmptyComponent={
            <View style={styles.emptyPickerContainer}>
              <Ionicons name="folder-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyPickerText}>
                {projects.length === 0 ? 'Nenhum projeto encontrado' : 'Carregando projetos...'}
              </Text>
              <Text style={styles.emptyPickerSubtext}>
                Verifique sua conexão e tente novamente
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );

  const renderMaterialPickerModal = () => (
    <Modal
      visible={showMaterialPicker}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowMaterialPicker(false)}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Selecionar Material</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={materials}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => selectMaterial(item)}
            >
              <View style={styles.pickerItemContent}>
                <Text style={styles.pickerItemTitle}>{item.name}</Text>
                {item.unit && (
                  <Text style={styles.pickerItemSubtitle}>Unidade: {item.unit}</Text>
                )}
                {item.description && (
                  <Text style={styles.pickerItemDescription}>{item.description}</Text>
                )}
              </View>
              {newItems[selectedItemIndex]?.materialId === item.id.toString() && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.pickerList}
          ListEmptyComponent={
            <View style={styles.emptyPickerContainer}>
              <Ionicons name="cube-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyPickerText}>Nenhum material encontrado</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Solicitações de Materiais</Text>
          {getPendingCount() > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{getPendingCount()}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerButtons}>
          {/* Espaço reservado para futuros botões se necessário */}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando solicitações...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color="#C7C7CC" />
              <Text style={styles.emptyText}>Nenhuma solicitação encontrada</Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'all' 
                  ? 'O servidor pode estar temporariamente indisponível.\nTente criar uma nova solicitação ou recarregue os dados.'
                  : `Nenhuma solicitação ${tabs.find(t => t.key === activeTab)?.title.toLowerCase()}`
                }
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchRequests}
              >
                <Ionicons name="refresh" size={20} color="#007AFF" />
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {renderCreateModal()}
      {renderDetailsModal()}
      {renderProjectPickerModal()}
      {renderMaterialPickerModal()}
      
      {/* Botão Flutuante para Criar Nova Solicitação */}
      <TouchableOpacity
        style={styles.floatingActionButton}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  pendingBadge: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  pendingBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addRequestButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingRequestCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOpacity: 0.2,
  },
  requestMainContent: {
    padding: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  quickActionsLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  quickActionsButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  approveQuickButton: {
    backgroundColor: '#34C759',
  },
  rejectQuickButton: {
    backgroundColor: '#FF3B30',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  requesterName: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  itemsCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  observations: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  requestCreated: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  itemContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  // Details Modal
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 16,
    color: '#8E8E93',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    flex: 2,
    textAlign: 'right',
  },
  itemDetail: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemDetailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemDetailQuantity: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  itemDetailObs: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  noItemsText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Picker Styles
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  placeholderText: {
    color: '#8E8E93',
  },
  pickerList: {
    padding: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerItemContent: {
    flex: 1,
  },
  pickerItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  pickerItemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  pickerItemDescription: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyPickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyPickerText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyPickerSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  // Floating Action Button
  floatingActionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default RequestMaterials;
