import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Plus, User, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';
import { TaskPriority } from '@/types/task';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (taskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    assignees: string[];
  }) => void;
  projectId: string;
}

const priorityOptions = [
  { value: 'low' as TaskPriority, label: 'Baixa', color: '#10b981' },
  { value: 'medium' as TaskPriority, label: 'Média', color: '#f59e0b' },
  { value: 'high' as TaskPriority, label: 'Alta', color: '#ef4444' },
];

// Mock de usuários disponíveis (será substituído por dados reais)
const availableUsers = [
  { id: '1', name: 'João Silva', email: 'joao@email.com' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@email.com' },
  { id: '4', name: 'Ana Oliveira', email: 'ana@email.com' },
];

export function AddTaskModal({ visible, onClose, onAddTask, projectId }: AddTaskModalProps) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [showUserSelector, setShowUserSelector] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setTitle('');
      setDescription('');
      setPriority('medium');
      setSelectedAssignees([]);
    }
  }, [visible]);

  const handleAddTask = () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Nome da tarefa é obrigatório');
      return;
    }

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignees: selectedAssignees,
    });

    onClose();
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const removeAssignee = (userId: string) => {
    setSelectedAssignees(prev => prev.filter(id => id !== userId));
  };

  const getSelectedUsers = () => {
    return availableUsers.filter(user => selectedAssignees.includes(user.id));
  };

  const renderPriorityOption = (option: typeof priorityOptions[0]) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.priorityOption,
        { 
          backgroundColor: priority === option.value ? option.color : theme.colors.card,
          borderColor: option.color,
        }
      ]}
      onPress={() => setPriority(option.value)}
    >
      <Text style={[
        styles.priorityText,
        { color: priority === option.value ? 'white' : option.color }
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderUserOption = ({ item: user }: { item: typeof availableUsers[0] }) => {
    const isSelected = selectedAssignees.includes(user.id);
    
    return (
      <TouchableOpacity
        key={user.id}
        style={[
          styles.userOption,
          { 
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
            borderColor: theme.colors.border,
          }
        ]}
        onPress={() => toggleAssignee(user.id)}
      >
        <User size={16} color={isSelected ? 'white' : theme.colors.text} />
        <View style={styles.userInfo}>
          <Text style={[
            styles.userName,
            { color: isSelected ? 'white' : theme.colors.text }
          ]}>
            {user.name}
          </Text>
          <Text style={[
            styles.userEmail,
            { color: isSelected ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary }
          ]}>
            {user.email}
          </Text>
        </View>
      </TouchableOpacity>
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
            Adicionar Tarefa
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Nome da Tarefa */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Nome da Tarefa *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border 
              }]}
              placeholder="Digite o nome da tarefa"
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Descrição
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border 
              }]}
              placeholder="Descreva a tarefa..."
              placeholderTextColor={theme.colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Prioridade */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Prioridade
            </Text>
            <View style={styles.priorityOptions}>
              {priorityOptions.map(renderPriorityOption)}
            </View>
          </View>

          {/* Responsáveis */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Responsáveis
              </Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowUserSelector(!showUserSelector)}
              >
                <Plus size={16} color="white" />
                <Text style={styles.addButtonText}>
                  {showUserSelector ? 'Fechar' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Usuários Selecionados */}
            {getSelectedUsers().length > 0 && (
              <View style={styles.selectedUsers}>
                {getSelectedUsers().map(user => (
                  <View key={user.id} style={[styles.selectedUser, { backgroundColor: theme.colors.card }]}>
                    <User size={16} color={theme.colors.primary} />
                    <Text style={[styles.selectedUserName, { color: theme.colors.text }]}>
                      {user.name}
                    </Text>
                    <TouchableOpacity onPress={() => removeAssignee(user.id)}>
                      <Trash2 size={14} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Seletor de Usuários */}
            {showUserSelector && (
              <View style={styles.userSelector}>
                {availableUsers.map(user => renderUserOption({ item: user }))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Botão de Adicionar */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.addTaskButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddTask}
          >
            <Text style={styles.addTaskButtonText}>Adicionar Tarefa</Text>
          </TouchableOpacity>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  selectedUsers: {
    marginBottom: 12,
  },
  selectedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedUserName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  userSelector: {
    maxHeight: 200,
  },
  userOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  userInfo: {
    marginLeft: 8,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addTaskButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addTaskButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});