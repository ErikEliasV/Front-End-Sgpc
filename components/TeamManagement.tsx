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
} from 'react-native';
import { useTeamStore } from '@/store/useTeamStore';
import { useKanbanStore } from '@/store/useKanbanStore';
import { useUserStore } from '@/store/useUserStore';
import { Plus, Users, X, UserPlus, Trash2, Edit, User } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';
import { Team, TeamMember } from '@/types/task';
import { User as UserType } from '@/types/user';

interface TeamManagementProps {
  visible: boolean;
  onClose: () => void;
  currentMemberId: string;
}

export function TeamManagement({
  visible,
  onClose,
  currentMemberId,
}: TeamManagementProps) {
  console.log('TeamManagement renderizado:', { visible, currentMemberId });

  const theme = useTheme();
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isManagingUsers, setIsManagingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Estados para edição de usuário
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    role: 'member' as 'admin' | 'manager' | 'member',
    phone: '',
    department: '',
    position: '',
  });

  const {
    teams,
    currentTeamId,
    addTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    updateMemberPermissions,
    setCurrentTeam,
    canMemberPerformAction,
  } = useTeamStore();

  const {
    users,
    getUsers,
    updateUser,
    deleteUser,
  } = useUserStore();

  const { initializeTeamColumns } = useKanbanStore();

  useEffect(() => {
    if (visible) {
      getUsers();
    }
  }, [visible]);

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;

    addTeam(newTeamName.trim(), newTeamDescription.trim(), currentMemberId);
    setNewTeamName('');
    setNewTeamDescription('');
    setIsAddingTeam(false);
  };

  const handleAddMember = (teamId: string) => {
    if (!newMemberEmail.trim()) return;

    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const isAdmin = team.members.length === 0; // O primeiro membro é admin
    addTeamMember(teamId, {
      name: newMemberEmail.split('@')[0], // Nome temporário baseado no email
      email: newMemberEmail.trim(),
      role: isAdmin ? 'admin' : 'member',
    });

    setNewMemberEmail('');
  };

  const handleSelectTeam = (teamId: string) => {
    setCurrentTeam(teamId);
    onClose();
  };

  const handleDeleteTeam = (teamId: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteTeam(teamId),
        },
      ]
    );
  };

  const handleUpdateMemberPermissions = (
    teamId: string,
    memberId: string,
    permission: keyof TeamMember['permissions'],
    value: boolean
  ) => {
    updateMemberPermissions(teamId, memberId, { [permission]: value });
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || '',
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editUserData.name.trim() || !editUserData.email.trim()) {
      Alert.alert('Erro', 'Nome e email são obrigatórios');
      return;
    }

    try {
      await updateUser(editingUser.id, editUserData);
      setEditingUser(null);
      setEditUserData({
        name: '',
        email: '',
        role: 'member',
        phone: '',
        department: '',
        position: '',
      });
      Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o usuário');
    }
  };

  const handleDeleteUser = (user: UserType) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir o usuário "${user.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id);
              Alert.alert('Sucesso', 'Usuário excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o usuário');
            }
          },
        },
      ]
    );
  };

  const canManageTeam = (teamId: string) =>
    canMemberPerformAction(teamId, currentMemberId, 'canManageTeam');

  const renderUserCard = ({ item: user }: { item: UserType }) => (
    <View style={[styles.userCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user.name}
          </Text>
          <View style={styles.userActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditUser(user)}
            >
              <Edit size={16} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteUser(user)}
            >
              <Trash2 size={16} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
          {user.email}
        </Text>
        
        <View style={styles.userDetails}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Cargo:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {user.position || 'Não informado'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Departamento:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {user.department || 'Não informado'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Função:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {user.role === 'admin' ? 'Administrador' :
               user.role === 'manager' ? 'Gerente' : 'Membro'}
            </Text>
          </View>
          
          {user.phone && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Telefone:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {user.phone}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderEditUserForm = () => (
    <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.formTitle, { color: theme.colors.text }]}>
        Editar Usuário
      </Text>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Nome completo"
        placeholderTextColor={theme.colors.textSecondary}
        value={editUserData.name}
        onChangeText={(text) => setEditUserData({ ...editUserData, name: text })}
      />
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Email"
        placeholderTextColor={theme.colors.textSecondary}
        value={editUserData.email}
        onChangeText={(text) => setEditUserData({ ...editUserData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput, { 
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          placeholder="Telefone"
          placeholderTextColor={theme.colors.textSecondary}
          value={editUserData.phone}
          onChangeText={(text) => setEditUserData({ ...editUserData, phone: text })}
          keyboardType="phone-pad"
        />
        
        <View style={[styles.pickerContainer, { borderColor: theme.colors.border }]}>
          <ScrollView style={styles.picker}>
            {(['admin', 'manager', 'member'] as const).map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.pickerOption,
                  editUserData.role === role && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setEditUserData({ ...editUserData, role })}
              >
                <Text style={[
                  styles.pickerOptionText,
                  { color: theme.colors.text },
                  editUserData.role === role && { color: 'white' }
                ]}>
                  {role === 'admin' ? 'Administrador' :
                   role === 'manager' ? 'Gerente' : 'Membro'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Departamento"
        placeholderTextColor={theme.colors.textSecondary}
        value={editUserData.department}
        onChangeText={(text) => setEditUserData({ ...editUserData, department: text })}
      />
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Cargo"
        placeholderTextColor={theme.colors.textSecondary}
        value={editUserData.position}
        onChangeText={(text) => setEditUserData({ ...editUserData, position: text })}
      />
      
      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setEditingUser(null)}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
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
    if (isAddingTeam) {
      return (
        <View style={styles.addTeamForm}>
          <TextInput
            style={styles.teamInput}
            placeholder="Nome do projeto"
            placeholderTextColor={theme.colors.textSecondary}
            value={newTeamName}
            onChangeText={setNewTeamName}
          />
          <TextInput
            style={[styles.teamInput, styles.descriptionInput]}
            placeholder="Descrição (opcional)"
            placeholderTextColor={theme.colors.textSecondary}
            value={newTeamDescription}
            onChangeText={setNewTeamDescription}
            multiline
          />
          <View style={styles.addTeamActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => setIsAddingTeam(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.addButton]}
              onPress={handleCreateTeam}
            >
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (isManagingUsers) {
      return (
        <>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Gerenciar Usuários
            </Text>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsManagingUsers(false)}
            >
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>

          {editingUser ? (
            renderEditUserForm()
          ) : (
            <FlatList
              data={users}
              renderItem={renderUserCard}
              keyExtractor={(user) => user.id}
              contentContainerStyle={styles.usersList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      );
    }

    return (
      <>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Gerenciar Projetos
          </Text>
          <TouchableOpacity
            style={[styles.usersButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setIsManagingUsers(true)}
          >
            <User size={20} color="white" />
            <Text style={styles.usersButtonText}>Usuários</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addTeamButton}
          onPress={() => setIsAddingTeam(true)}
        >
          <Plus size={20} color={theme.colors.primary} />
          <Text style={styles.addTeamButtonText}>Adicionar Projeto</Text>
        </TouchableOpacity>
        <FlatList
          data={teams}
          renderItem={({ item: team }) => (
            <View style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <View>
                  <Text style={styles.teamName}>{team.name}</Text>
                  {team.description && (
                    <Text style={styles.teamDescription}>{team.description}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTeam(team.id)}
                >
                  <Trash2 size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.membersList}>
                {team.members.map((member) => (
                  <View key={member.id} style={styles.memberItem}>
                    <View>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    </View>
                    <View style={styles.permissionsList}>
                      {Object.entries(member.permissions).map(([key, value]) => (
                        <TouchableOpacity
                          key={key}
                          style={[
                            styles.permissionButton,
                            value && styles.permissionButtonActive
                          ]}
                          onPress={() => handleUpdateMemberPermissions(team.id, member.id, key as keyof TeamMember['permissions'], value)}
                        >
                          <Text style={[
                            styles.permissionButtonText,
                            value && { color: 'white' }
                          ]}>
                            {key === 'canEditTask' ? 'Editar' :
                             key === 'canDeleteTask' ? 'Excluir' :
                             key === 'canManageTeam' ? 'Gerenciar' : key}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.addMemberForm}>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Email do novo membro"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={newMemberEmail}
                  onChangeText={setNewMemberEmail}
                />
                <TouchableOpacity
                  style={styles.addMemberButton}
                  onPress={() => handleAddMember(team.id)}
                >
                  <UserPlus size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(team) => team.id}
          contentContainerStyle={styles.teamsList}
        />
      </>
    );
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      width: '90%',
      maxWidth: 500,
      maxHeight: '80%',
      padding: theme.spacing.xl,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    teamsList: {
      paddingBottom: theme.spacing.lg,
    },
    teamCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.small,
    },
    teamHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    teamName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    teamDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    deleteButton: {
      padding: theme.spacing.xs,
    },
    membersList: {
      marginBottom: theme.spacing.md,
    },
    memberItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    memberName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    memberEmail: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    permissionsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    permissionButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    permissionButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    permissionButtonText: {
      fontSize: 12,
      color: theme.colors.text,
    },
    addMemberForm: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    emailInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      color: theme.colors.text,
    },
    addMemberButton: {
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    addTeamButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    addTeamButtonText: {
      marginLeft: theme.spacing.xs,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    addTeamForm: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    teamInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    descriptionInput: {
      height: 80,
      textAlignVertical: 'top',
    },
    addTeamActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
    },
    actionButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    editButton: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    deleteButton: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    cancelButton: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelButtonText: {
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    addButton: {
      backgroundColor: theme.colors.primary,
    },
    addButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    backButton: {
      padding: theme.spacing.xs,
    },
    backButtonText: {
      color: theme.colors.primary,
    },
    usersButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    usersButtonText: {
      marginLeft: theme.spacing.xs,
      color: 'white',
      fontWeight: '600',
    },
    usersList: {
      padding: theme.spacing.md,
    },
    userCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.small,
    },
    userInfo: {
      flexDirection: 'column',
    },
    userHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    userName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    userActions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    userEmail: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    userDetails: {
      marginTop: theme.spacing.xs,
    },
    detailItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    detailLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    detailValue: {
      fontSize: 14,
      color: theme.colors.text,
    },
    formContainer: {
      padding: theme.spacing.lg,
    },
    formTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    halfInput: {
      flex: 1,
    },
    pickerContainer: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
    },
    picker: {
      flex: 1,
    },
    pickerOption: {
      padding: theme.spacing.sm,
    },
    pickerOptionText: {
      fontSize: 12,
      color: theme.colors.text,
    },
    formActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
    },
    button: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    saveButtonText: {
      color: 'white',
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isAddingTeam ? 'Adicionar Projeto' : isManagingUsers ? 'Gerenciar Usuários' : 'Gerenciar Projetos'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
} 