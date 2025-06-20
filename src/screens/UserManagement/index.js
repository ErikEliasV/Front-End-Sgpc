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
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const UserManagement = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all'); // all, active, inactive
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [usingTestData, setUsingTestData] = useState(false);
  
  // Estados para dados da API
  const [allUsers, setAllUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Estados para modais
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  
  // Estados para edição de usuário
  const [editingUser, setEditingUser] = useState({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    hourlyRate: '',
    roles: [],
    isActive: true,
  });

  // Estados para criação de usuário
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    hourlyRate: '',
    roles: ['USER'],
  });

  const [creatingUser, setCreatingUser] = useState(false);

  // URLs base da API
  const API_BASE = 'https://sgpc-api.koyeb.app/api';

  // Função para obter headers com autenticação
  const getAuthHeaders = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };
      } else {
        console.log('⚠️ Token não encontrado no AsyncStorage');
        return {
          'Content-Type': 'application/json',
        };
      }
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  };

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('🚫 Usuário não autenticado, redirecionando para login...');
        Alert.alert(
          'Acesso Negado',
          'Você precisa estar logado para acessar esta funcionalidade.',
          [
            {
              text: 'OK',
              onPress: () => {
                AsyncStorage.removeItem('userToken');
                navigation.navigate('Login');
              },
            },
          ]
        );
        return;
      }
      console.log('✅ Usuário autenticado, carregando dados...');
      loadInitialData();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      loadInitialData(); // Tentar carregar mesmo assim
    }
  };

  useEffect(() => {
    filterUsers();
  }, [allUsers, activeUsers, activeTab, searchText]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await loadUsers();
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

  // Carregar lista de usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      
      // Tentar primeiro usuários ativos, depois todos os usuários
      const endpoints = [
        `${API_BASE}/users/active`,
        `${API_BASE}/users`
      ];
      
      let usersData = [];
      let success = false;
      
      for (const endpoint of endpoints) {
        try {
          console.log('📡 Tentando carregar usuários de:', endpoint);
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: headers,
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('👥 Usuários carregados de', endpoint, ':', data.length);
            
            if (Array.isArray(data)) {
              usersData = data;
              success = true;
              break;
            } else if (data && typeof data === 'object') {
              // Verificar diferentes formatos de resposta
              const possibleArrays = ['data', 'users', 'content', 'items'];
              for (const prop of possibleArrays) {
                if (data[prop] && Array.isArray(data[prop])) {
                  usersData = data[prop];
                  success = true;
                  break;
                }
              }
              if (success) break;
            }
          } else if (response.status === 403 || response.status === 401) {
            console.log('🔒 Sem permissão para', endpoint, '- tentando próximo...');
            if (response.status === 401) {
              Alert.alert(
                'Sessão Expirada',
                'Sua sessão expirou. Faça login novamente.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      AsyncStorage.removeItem('userToken');
                      navigation.navigate('Login');
                    },
                  },
                ]
              );
              return;
            }
            continue;
          } else {
            console.warn('⚠️ Falha ao carregar usuários de', endpoint, '- Status:', response.status);
          }
        } catch (endpointError) {
          console.error('Erro ao tentar endpoint', endpoint, ':', endpointError);
          continue;
        }
      }
      
      if (success) {
        setAllUsers(usersData);
        setActiveUsers(usersData.filter(user => user.isActive !== false)); // Assumir ativo se não especificado
        setUsingTestData(false);
        console.log('✅ Usuários carregados com sucesso:', usersData.length);
      } else {
        console.error('❌ Falha em todos os endpoints de usuários');
        setUsingTestData(true);
        Alert.alert('Erro', 'Não foi possível carregar os usuários.');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsingTestData(true);
      Alert.alert('Erro', 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const getUserById = async (userId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'GET',
        headers: headers,
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);
        return data;
      }
    } catch (error) {
      console.error('Erro ao carregar usuário por ID:', error);
      Alert.alert('Erro', 'Falha ao carregar detalhes do usuário');
    }
    return null;
  };

  const updateUser = async (userId, userData) => {
    try {
      console.log('🔄 Atualizando usuário:', userId);
      console.log('📝 Dados para atualização:', { ...userData, password: userData.password ? '[OCULTA]' : undefined });
      
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(userData),
      });

      console.log('📡 Response status (PUT):', response.status);
      const responseText = await response.text();
      console.log('📊 Response body (PUT):', responseText);

      if (response.ok) {
        Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
        setShowEditUserModal(false);
        loadInitialData();
        return true;
      } else {
        let errorMessage = 'Falha ao atualizar usuário';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.mensagem || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        console.error('❌ Erro na atualização:', response.status, errorMessage);
        Alert.alert('Erro', `${errorMessage} (Status: ${response.status})`);
        return false;
      }
    } catch (error) {
      console.error('💥 Erro ao atualizar usuário:', error);
      Alert.alert('Erro', 'Erro de conexão');
      return false;
    }
  };

  const createUser = async () => {
    try {
      const headers = await getAuthHeaders();
      
      // Usar o endpoint específico para admins criarem usuários
      const response = await fetch(`${API_BASE}/users/admin/create`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          fullName: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
          password: newUser.password,
          hourlyRate: parseFloat(newUser.hourlyRate) || 0,
          roleName: newUser.roles.join(',') // Enviar roles como string separada por vírgula
        }),
      });

      if (response.ok) {
        const createdUser = await response.json();
        Alert.alert('Sucesso', 'Usuário criado com sucesso!');
        setShowCreateUserModal(false);
        setNewUser({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          hourlyRate: '',
          roles: []
        });
        loadInitialData(); // Recarregar lista
      } else {
        const errorData = await response.json();
        console.error('Erro ao criar usuário:', errorData);
        
        let errorMessage = 'Erro ao criar usuário';
        if (errorData.mensagem) {
          errorMessage = errorData.mensagem;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      Alert.alert('Erro', 'Erro de conexão ao criar usuário.');
    }
  };

  const deactivateUser = async (userId) => {
    Alert.alert(
      'Desativar Usuário',
      'Tem certeza que deseja desativar este usuário? Ele não poderá mais fazer login.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Desativar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const headers = await getAuthHeaders();
              const response = await fetch(`${API_BASE}/users/${userId}/deactivate`, {
                method: 'PUT',
                headers: headers,
              });
              
              if (response.ok) {
                Alert.alert('Sucesso', 'Usuário desativado com sucesso!');
                loadInitialData();
              } else {
                const errorData = await response.json();
                Alert.alert('Erro', errorData.mensagem || 'Falha ao desativar usuário.');
              }
            } catch (error) {
              console.error('Erro ao desativar usuário:', error);
              Alert.alert('Erro', 'Erro de conexão.');
            }
          }
        }
      ]
    );
  };

  const activateUser = async (userId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/users/${userId}/activate`, {
        method: 'PUT',
        headers: headers,
      });
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Usuário ativado com sucesso!');
        loadInitialData();
      } else {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.mensagem || 'Falha ao ativar usuário.');
      }
    } catch (error) {
      console.error('Erro ao ativar usuário:', error);
      Alert.alert('Erro', 'Erro de conexão.');
    }
  };

  const filterUsers = () => {
    let usersToFilter = [];
    
    if (activeTab === 'all') {
      usersToFilter = allUsers;
    } else if (activeTab === 'active') {
      usersToFilter = activeUsers;
    } else if (activeTab === 'inactive') {
      usersToFilter = allUsers.filter(user => !activeUsers.some(activeUser => activeUser.id === user.id));
    }

    if (searchText.trim() === '') {
      setFilteredUsers(usersToFilter);
    } else {
      const filtered = usersToFilter.filter(user =>
        user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.phone?.includes(searchText)
      );
      setFilteredUsers(filtered);
    }
  };

  const handleUserPress = async (user) => {
    const userDetails = await getUserById(user.id);
    if (userDetails) {
      setShowUserDetailsModal(true);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      hourlyRate: user.hourlyRate?.toString() || '',
      roles: user.roles || user.roleNames || [],
      isActive: activeUsers.some(activeUser => activeUser.id === user.id),
      password: '', // Campo de senha obrigatório para atualização
    });
    setShowEditUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser.fullName || !editingUser.email || !editingUser.password) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (!editingUser.email.includes('@')) {
      Alert.alert('Erro', 'Email inválido');
      return;
    }

    if (editingUser.password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const userData = {
      fullName: editingUser.fullName,
      email: editingUser.email,
      phone: editingUser.phone,
      password: editingUser.password,
      hourlyRate: parseFloat(editingUser.hourlyRate) || 0,
      roles: editingUser.roles || ['USER'],
      isActive: editingUser.isActive,
    };

    await updateUser(editingUser.id, userData);
  };

  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.password) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (!newUser.email.includes('@')) {
      Alert.alert('Erro', 'Email inválido');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (newUser.password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newUser.roles.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos uma função');
      return;
    }

    setCreatingUser(true);
    await createUser();
    setCreatingUser(false);
  };

  const handleRoleToggle = (role) => {
    setNewUser(prev => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      
      return {
        ...prev,
        roles: newRoles
      };
    });
  };

  const confirmStatusChange = (user, newStatus) => {
    const action = newStatus ? 'ativar' : 'desativar';
    Alert.alert(
      'Confirmar Ação',
      `Deseja ${action} o usuário ${user.fullName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            if (newStatus) {
              activateUser(user.id);
            } else {
              deactivateUser(user.id);
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return '#dc3545';
      case 'MANAGER':
        return '#007AFF';
      case 'USER':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? '#28a745' : '#dc3545';
  };

  const renderUserCard = (user) => {
    const isActive = activeUsers.some(activeUser => activeUser.id === user.id);
    
    return (
      <TouchableOpacity
        key={user.id}
        style={[styles.userCard, !isActive && styles.inactiveUserCard]}
        onPress={() => handleUserPress(user)}
      >
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>
              {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.phone && (
              <Text style={styles.userPhone}>{user.phone}</Text>
            )}
          </View>

          <View style={styles.userActions}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(isActive) }]}>
              <Text style={styles.statusText}>
                {isActive ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditUser(user)}
            >
              <Ionicons name="pencil" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.userDetails}>
          <View style={styles.roleContainer}>
            {(user.roles || user.roleNames || []).map((role, index) => (
              <View
                key={index}
                style={[styles.roleBadge, { backgroundColor: getRoleColor(role) }]}
              >
                <Text style={styles.roleText}>{role}</Text>
              </View>
            ))}
          </View>

          {user.hourlyRate && (
            <Text style={styles.hourlyRate}>
              R$ {user.hourlyRate}/hora
            </Text>
          )}
        </View>

        <View style={styles.userFooter}>
          <TouchableOpacity
            style={[styles.statusButton, isActive ? styles.deactivateButton : styles.activateButton]}
            onPress={() => confirmStatusChange(user, !isActive)}
          >
            <Ionicons 
              name={isActive ? 'close-circle' : 'checkmark-circle'} 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.statusButtonText}>
              {isActive ? 'Desativar' : 'Ativar'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Todos ({allUsers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Ativos ({activeUsers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'inactive' && styles.activeTab]}
          onPress={() => setActiveTab('inactive')}
        >
          <Text style={[styles.tabText, activeTab === 'inactive' && styles.activeTabText]}>
            Inativos ({allUsers.length - activeUsers.length})
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Gerenciamento de Usuários</Text>
          <Text style={styles.subtitle}>Controle da equipe</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateUserModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome, email ou telefone..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {allUsers.length > 0 && activeUsers.length === 0 && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={16} color="#dc3545" />
          <Text style={styles.warningText}>
            Erro no servidor ao carregar usuários ativos - Mostrando todos como ativos
          </Text>
        </View>
      )}

      {renderTabs()}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
          </View>
        ) : (
          <View style={styles.usersList}>
            {filteredUsers.map(user => renderUserCard(user))}
          </View>
        )}
      </ScrollView>

      {/* Modal de Detalhes do Usuário */}
      <Modal
        visible={showUserDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalhes do Usuário</Text>
            <TouchableOpacity
              onPress={() => setShowUserDetailsModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedUser && (
              <View style={styles.userDetailsCard}>
                <View style={styles.detailsHeader}>
                  <View style={styles.largeAvatar}>
                    <Text style={styles.largeAvatarText}>
                      {selectedUser.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <Text style={styles.detailsName}>{selectedUser.fullName}</Text>
                  <Text style={styles.detailsEmail}>{selectedUser.email}</Text>
                </View>

                <View style={styles.detailsBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID:</Text>
                    <Text style={styles.detailValue}>{selectedUser.id}</Text>
                  </View>

                  {selectedUser.phone && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Telefone:</Text>
                      <Text style={styles.detailValue}>{selectedUser.phone}</Text>
                    </View>
                  )}

                  {selectedUser.hourlyRate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Valor/Hora:</Text>
                      <Text style={styles.detailValue}>R$ {selectedUser.hourlyRate}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(activeUsers.some(u => u.id === selectedUser.id)) }
                    ]}>
                      <Text style={styles.statusText}>
                        {activeUsers.some(u => u.id === selectedUser.id) ? 'Ativo' : 'Inativo'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Funções:</Text>
                    <View style={styles.roleContainer}>
                      {(selectedUser.roles || selectedUser.roleNames || []).map((role, index) => (
                        <View
                          key={index}
                          style={[styles.roleBadge, { backgroundColor: getRoleColor(role) }]}
                        >
                          <Text style={styles.roleText}>{role}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editUserButton}
                  onPress={() => {
                    setShowUserDetailsModal(false);
                    handleEditUser(selectedUser);
                  }}
                >
                  <Ionicons name="pencil" size={20} color="#fff" />
                  <Text style={styles.editUserText}>Editar Usuário</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Edição do Usuário */}
      <Modal
        visible={showEditUserModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Usuário</Text>
            <TouchableOpacity
              onPress={() => setShowEditUserModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome Completo *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingUser.fullName}
                  onChangeText={(text) => setEditingUser({...editingUser, fullName: text})}
                  placeholder="Digite o nome completo"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingUser.email}
                  onChangeText={(text) => setEditingUser({...editingUser, email: text})}
                  placeholder="Digite o email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefone</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingUser.phone}
                  onChangeText={(text) => setEditingUser({...editingUser, phone: text})}
                  placeholder="Digite o telefone"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Valor por Hora (R$)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingUser.hourlyRate}
                  onChangeText={(text) => setEditingUser({...editingUser, hourlyRate: text})}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nova Senha *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingUser.password}
                  onChangeText={(text) => setEditingUser({...editingUser, password: text})}
                  placeholder="Digite uma nova senha (mín. 6 caracteres)"
                  secureTextEntry={true}
                  autoCapitalize="none"
                />
                <Text style={styles.helpText}>
                  A senha é obrigatória para atualizar o usuário
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.inputLabel}>Usuário Ativo</Text>
                  <Switch
                    value={editingUser.isActive}
                    onValueChange={(value) => setEditingUser({...editingUser, isActive: value})}
                    trackColor={{ false: '#ccc', true: '#007AFF' }}
                    thumbColor={editingUser.isActive ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveUser}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de Criação de Usuário */}
      <Modal
        visible={showCreateUserModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Criar Novo Usuário</Text>
            <TouchableOpacity
              onPress={() => setShowCreateUserModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome Completo *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newUser.fullName}
                  onChangeText={(text) => setNewUser({...newUser, fullName: text})}
                  placeholder="Digite o nome completo"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newUser.email}
                  onChangeText={(text) => setNewUser({...newUser, email: text})}
                  placeholder="Digite o email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefone</Text>
                <TextInput
                  style={styles.textInput}
                  value={newUser.phone}
                  onChangeText={(text) => setNewUser({...newUser, phone: text})}
                  placeholder="Digite o telefone"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Senha *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newUser.password}
                  onChangeText={(text) => setNewUser({...newUser, password: text})}
                  placeholder="Digite a senha (mín. 6 caracteres)"
                  secureTextEntry={true}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar Senha *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newUser.confirmPassword}
                  onChangeText={(text) => setNewUser({...newUser, confirmPassword: text})}
                  placeholder="Confirme a senha"
                  secureTextEntry={true}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Valor por Hora (R$)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newUser.hourlyRate}
                  onChangeText={(text) => setNewUser({...newUser, hourlyRate: text})}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Funções *</Text>
                <View style={styles.rolesContainer}>
                  <TouchableOpacity
                    style={[
                      styles.roleButtonModal,
                      newUser.roles.includes('USER') && styles.roleButtonSelected
                    ]}
                    onPress={() => handleRoleToggle('USER')}
                  >
                    <Text style={[
                      styles.roleButtonText,
                                              newUser.roles.includes('USER') && styles.roleButtonTextSelected
                    ]}>
                      USUÁRIO
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleButtonModal,
                      newUser.roles.includes('MANAGER') && styles.roleButtonSelected
                    ]}
                    onPress={() => handleRoleToggle('MANAGER')}
                  >
                    <Text style={[
                      styles.roleButtonText,
                                              newUser.roles.includes('MANAGER') && styles.roleButtonTextSelected
                    ]}>
                      GERENTE
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleButtonModal,
                      newUser.roles.includes('ADMIN') && styles.roleButtonSelected
                    ]}
                    onPress={() => handleRoleToggle('ADMIN')}
                  >
                    <Text style={[
                      styles.roleButtonText,
                                              newUser.roles.includes('ADMIN') && styles.roleButtonTextSelected
                    ]}>
                      ADMIN
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, creatingUser && styles.saveButtonDisabled]}
                onPress={handleCreateUser}
                disabled={creatingUser}
              >
                {creatingUser ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Criar Usuário</Text>
                  </>
                )}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    paddingHorizontal: 15,
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
  usersList: {
    padding: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveUserCard: {
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  hourlyRate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activateButton: {
    backgroundColor: '#28a745',
  },
  deactivateButton: {
    backgroundColor: '#dc3545',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
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
  userDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  largeAvatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  detailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  detailsEmail: {
    fontSize: 16,
    color: '#666',
  },
  detailsBody: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  editUserButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  editUserText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  editForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  debugButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  warningBanner: {
    backgroundColor: '#f8d7da',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#721c24',
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButtonModal: {
    minWidth: '30%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  roleButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  roleButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default UserManagement;