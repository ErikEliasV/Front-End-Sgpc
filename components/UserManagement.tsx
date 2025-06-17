import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useUserStore } from '@/store/useUserStore';
import { Plus, X, Edit, Trash2, Search, User, Crown, Shield, Mail } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';
import { User as UserType, CreateUserData, UpdateUserData, UserRole } from '@/types/user';
import { TeamMember } from '@/types/task';

interface UserManagementProps {
  visible: boolean;
  onClose: () => void;
  onSaveUsers: (users: TeamMember[]) => void;
  projectId: string;
  currentUsers: TeamMember[];
}

// Departamentos disponíveis
const departments = [
  'TI',
  'Marketing',
  'Vendas',
  'RH',
  'Financeiro',
  'Operações',
  'Design',
  'Produto',
];

// Cargos disponíveis
const positions = [
  'Desenvolvedor',
  'Designer',
  'Gerente',
  'Analista',
  'Coordenador',
  'Diretor',
  'Estagiário',
  'Pleno',
  'Senior',
];

export function UserManagement({ 
  visible, 
  onClose, 
  onSaveUsers, 
  projectId, 
  currentUsers 
}: UserManagementProps) {
  const theme = useTheme();
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamMember | null>(null);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Estados para formulário de convite
  const [inviteData, setInviteData] = useState({
    email: '',
    department: '',
    position: '',
    role: 'member' as 'admin' | 'manager' | 'member',
  });

  // Estados para edição
  const [editData, setEditData] = useState({
    department: '',
    position: '',
    role: 'member' as 'admin' | 'manager' | 'member',
  });

  const {
    isLoading,
    error,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    setFilters,
  } = useUserStore();

  useEffect(() => {
    if (visible) {
      setUsers([...currentUsers]);
      setIsAddingUser(false);
      setEditingUser(null);
      setShowUserSelector(false);
      resetInviteForm();
    }
  }, [visible, currentUsers]);

  useEffect(() => {
    // Aplicar filtros quando searchText ou selectedRole mudar
    const filters: any = {};
    if (searchText) filters.search = searchText;
    if (selectedRole) filters.role = selectedRole;
    if (selectedDepartment) filters.department = selectedDepartment;
    
    setFilters(filters);
    loadUsers(filters);
  }, [searchText, selectedRole, selectedDepartment]);

  const loadUsers = async (filters?: any) => {
    await getUsers(filters);
  };

  const resetInviteForm = () => {
    setInviteData({
      email: '',
      department: '',
      position: '',
      role: 'member',
    });
  };

  const resetEditForm = () => {
    setEditData({
      department: '',
      position: '',
      role: 'member',
    });
  };

  const handleInviteUser = () => {
    if (!inviteData.email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return;
    }

    if (!inviteData.department.trim()) {
      Alert.alert('Erro', 'Departamento é obrigatório');
      return;
    }

    if (!inviteData.position.trim()) {
      Alert.alert('Erro', 'Cargo é obrigatório');
      return;
    }

    // Verificar se o email já existe
    const emailExists = users.some(user => user.email.toLowerCase() === inviteData.email.toLowerCase());
    if (emailExists) {
      Alert.alert('Erro', 'Este email já foi convidado para o projeto');
      return;
    }

    const newUser: TeamMember = {
      id: Date.now().toString(),
      name: '',
      email: inviteData.email.trim(),
      role: inviteData.role,
      department: inviteData.department,
      position: inviteData.position,
      permissions: getDefaultPermissions(inviteData.role),
      status: 'pending',
    };

    setUsers(prev => [...prev, newUser]);
    setIsAddingUser(false);
    resetInviteForm();
    Alert.alert('Sucesso', 'Convite enviado com sucesso!');
  };

  const getDefaultPermissions = (role: 'admin' | 'manager' | 'member') => {
    switch (role) {
      case 'admin':
        return {
          canCreateTask: true,
          canEditTask: true,
          canDeleteTask: true,
          canMoveTask: true,
          canManageTeam: true,
        };
      case 'manager':
        return {
          canCreateTask: true,
          canEditTask: true,
          canDeleteTask: true,
          canMoveTask: true,
          canManageTeam: false,
        };
      case 'member':
        return {
          canCreateTask: true,
          canEditTask: false,
          canDeleteTask: false,
          canMoveTask: true,
          canManageTeam: false,
        };
    }
  };

  const handleEditUser = (user: TeamMember) => {
    setEditingUser(user);
    setEditData({
      department: user.department || '',
      position: user.position || '',
      role: user.role,
    });
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    if (!editData.department.trim()) {
      Alert.alert('Erro', 'Departamento é obrigatório');
      return;
    }

    if (!editData.position.trim()) {
      Alert.alert('Erro', 'Cargo é obrigatório');
      return;
    }

    const updatedUser: TeamMember = {
      ...editingUser,
      department: editData.department.trim(),
      position: editData.position.trim(),
      role: editData.role,
      permissions: getDefaultPermissions(editData.role),
    };

    setUsers(prev => prev.map(user => 
      user.id === editingUser.id ? updatedUser : user
    ));

    setEditingUser(null);
    resetEditForm();
    Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
  };

  const handleDeleteUser = (user: TeamMember) => {
    Alert.alert(
      'Confirmar remoção',
      `Tem certeza que deseja remover "${user.email}" do projeto?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setUsers(prev => prev.filter(u => u.id !== user.id));
            Alert.alert('Sucesso', 'Usuário removido do projeto!');
          },
        },
      ]
    );
  };

  const handleTogglePermission = (userId: string, permission: keyof TeamMember['permissions']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, permissions: { ...user.permissions, [permission]: !user.permissions[permission] } }
        : user
    ));
  };

  const handleSave = () => {
    onSaveUsers(users);
    onClose();
  };

  const renderUserItem = ({ item: user }: { item: TeamMember }) => {
    const isAdmin = user.role === 'admin';
    const isManager = user.role === 'manager';
    
    return (
      <View style={[styles.userCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              {isAdmin ? (
                <Crown size={20} color={theme.colors.warning} />
              ) : isManager ? (
                <Shield size={20} color={theme.colors.primary} />
              ) : (
                <User size={20} color={theme.colors.textSecondary} />
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {user.name || user.email}
              </Text>
              <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                {user.email}
              </Text>
              {user.department && (
                <Text style={[styles.userDepartment, { color: theme.colors.textSecondary }]}>
                  {user.department} • {user.position}
                </Text>
              )}
              <View style={styles.roleBadge}>
                <Text style={[
                  styles.roleText,
                  { 
                    color: isAdmin ? theme.colors.warning : 
                           isManager ? theme.colors.primary : 
                           theme.colors.textSecondary 
                  }
                ]}>
                  {isAdmin ? 'Administrador' : isManager ? 'Gerente' : 'Membro'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.userActions}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}
              onPress={() => handleEditUser(user)}
            >
              <Edit size={16} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
              onPress={() => handleDeleteUser(user)}
            >
              <Trash2 size={16} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Permissões */}
        <View style={styles.permissionsSection}>
          <Text style={[styles.permissionsTitle, { color: theme.colors.text }]}>
            Permissões
          </Text>
          <View style={styles.permissionsGrid}>
            {Object.entries(user.permissions).map(([key, value]) => (
              <View key={key} style={styles.permissionItem}>
                <Text style={[styles.permissionLabel, { color: theme.colors.textSecondary }]}>
                  {getPermissionLabel(key as keyof TeamMember['permissions'])}
                </Text>
                <Switch
                  value={value}
                  onValueChange={() => handleTogglePermission(user.id, key as keyof TeamMember['permissions'])}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={value ? 'white' : theme.colors.textSecondary}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const getPermissionLabel = (permission: keyof TeamMember['permissions']): string => {
    switch (permission) {
      case 'canCreateTask': return 'Criar Tarefas';
      case 'canEditTask': return 'Editar Tarefas';
      case 'canDeleteTask': return 'Excluir Tarefas';
      case 'canMoveTask': return 'Mover Tarefas';
      case 'canManageTeam': return 'Gerenciar Equipe';
      default: return permission;
    }
  };

  const renderInviteForm = () => (
    <View style={[styles.form, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.formTitle, { color: theme.colors.text }]}>
        Convidar Usuário para o Projeto
      </Text>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Email"
        placeholderTextColor={theme.colors.textSecondary}
        value={inviteData.email}
        onChangeText={(text) => setInviteData({ ...inviteData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Departamento"
        placeholderTextColor={theme.colors.textSecondary}
        value={inviteData.department}
        onChangeText={(text) => setInviteData({ ...inviteData, department: text })}
      />
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Cargo"
        placeholderTextColor={theme.colors.textSecondary}
        value={inviteData.position}
        onChangeText={(text) => setInviteData({ ...inviteData, position: text })}
      />
      
      <View style={styles.row}>
        <View style={[styles.pickerContainer, { borderColor: theme.colors.border }]}>
          <ScrollView style={styles.picker}>
            {(['admin', 'manager', 'member'] as const).map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.pickerOption,
                  inviteData.role === role && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setInviteData({ ...inviteData, role })}
              >
                <Text style={[
                  styles.pickerOptionText,
                  { color: theme.colors.text },
                  inviteData.role === role && { color: 'white' }
                ]}>
                  {role === 'admin' ? 'Administrador' :
                   role === 'manager' ? 'Gerente' : 'Membro'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.border }]}
          onPress={() => setIsAddingUser(false)}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleInviteUser}
        >
          <Text style={styles.saveButtonText}>Enviar Convite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEditForm = () => (
    <View style={[styles.form, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.formTitle, { color: theme.colors.text }]}>
        Editar Usuário
      </Text>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Departamento"
        placeholderTextColor={theme.colors.textSecondary}
        value={editData.department}
        onChangeText={(text) => setEditData({ ...editData, department: text })}
      />
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Cargo"
        placeholderTextColor={theme.colors.textSecondary}
        value={editData.position}
        onChangeText={(text) => setEditData({ ...editData, position: text })}
      />
      
      <View style={styles.row}>
        <View style={[styles.pickerContainer, { borderColor: theme.colors.border }]}>
          <ScrollView style={styles.picker}>
            {(['admin', 'manager', 'member'] as const).map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.pickerOption,
                  editData.role === role && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setEditData({ ...editData, role })}
              >
                <Text style={[
                  styles.pickerOptionText,
                  { color: theme.colors.text },
                  editData.role === role && { color: 'white' }
                ]}>
                  {role === 'admin' ? 'Administrador' :
                   role === 'manager' ? 'Gerente' : 'Membro'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.border }]}
          onPress={() => setEditingUser(null)}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleUpdateUser}
        >
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isAddingUser) {
      return renderInviteForm();
    }

    if (editingUser) {
      return renderEditForm();
    }

    // Conteúdo principal - lista de usuários
    return (
      <View style={styles.mainContent}>
        {/* Header com botão de adicionar */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Usuários do Projeto
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setIsAddingUser(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Convidar Usuário</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de usuários */}
        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <User size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Nenhum usuário no projeto
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              Convide usuários para colaborar no projeto
            </Text>
            <TouchableOpacity
              style={[styles.addFirstUserButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsAddingUser(true)}
            >
              <Plus size={20} color="white" />
              <Text style={styles.addFirstUserButtonText}>Convidar Primeiro Usuário</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(user) => user.id}
              contentContainerStyle={styles.usersList}
              showsVerticalScrollIndicator={false}
            />
            
            {/* Botão de salvar */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Gerenciar Usuários
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  filters: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  usersList: {
    paddingBottom: 20,
  },
  userCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 6,
  },
  permissionsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    minWidth: '45%',
  },
  permissionLabel: {
    fontSize: 14,
  },
  roleBadge: {
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userAvatar: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginRight: 12,
  },
  userDepartment: {
    fontSize: 12,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  formContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 120,
  },
  picker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  pickerOptionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  mainContent: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  addFirstUserButton: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addFirstUserButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  form: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 120,
  },
  picker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  pickerOptionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 