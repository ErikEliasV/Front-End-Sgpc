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
  FlatList,
} from 'react-native';
import { X, Plus, GripVertical, Edit, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/constants/theme';
import { useKanbanStore } from '@/store/useKanbanStore';
import { Column } from '@/types/task';

interface ColumnManagementProps {
  visible: boolean;
  onClose: () => void;
  onSaveColumns: (columns: Column[]) => void;
  projectId: string;
  currentColumns: Column[];
}

export function ColumnManagement({ 
  visible, 
  onClose, 
  onSaveColumns, 
  projectId, 
  currentColumns 
}: ColumnManagementProps) {
  const theme = useTheme();
  const [columns, setColumns] = useState<Column[]>([]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const { addColumn, updateColumn, deleteColumn } = useKanbanStore();

  useEffect(() => {
    if (visible) {
      // Usar colunas atuais do projeto
      setColumns([...currentColumns]);
      setIsAddingColumn(false);
      setNewColumnTitle('');
      setEditingColumn(null);
      setEditTitle('');
    }
  }, [visible, currentColumns]);

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      Alert.alert('Erro', 'Nome da coluna é obrigatório');
      return;
    }

    const newColumnData = {
      title: newColumnTitle.trim(),
      teamId: projectId,
      order: columns.length,
    };

    addColumn(newColumnData);
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const handleEditColumn = () => {
    if (!editTitle.trim() || !editingColumn) {
      Alert.alert('Erro', 'Nome da coluna é obrigatório');
      return;
    }

    updateColumn({
      ...editingColumn,
      title: editTitle.trim(),
    });

    setEditingColumn(null);
    setEditTitle('');
  };

  const handleDeleteColumn = (columnId: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta coluna? As tarefas serão movidas para a primeira coluna.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteColumn(columnId);
          },
        },
      ]
    );
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);
    
    // Atualizar ordem
    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index + 1,
    }));
    
    setColumns(updatedColumns);
  };

  const handleSave = () => {
    if (columns.length === 0) {
      Alert.alert('Erro', 'Deve haver pelo menos uma coluna');
      return;
    }

    onSaveColumns(columns);
    onClose();
  };

  const renderColumnItem = ({ item: column, index }: { item: Column; index: number }) => {
    const isEditing = editingColumn?.id === column.id;

    if (isEditing) {
      return (
        <View style={[styles.columnItem, { backgroundColor: theme.colors.card }]}>
          <GripVertical size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.editInput, { 
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderColor: theme.colors.border 
            }]}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Nome da coluna"
            placeholderTextColor={theme.colors.textSecondary}
            autoFocus
          />
          <View style={styles.columnActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleEditColumn}
            >
              <Text style={styles.actionButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
              onPress={() => {
                setEditingColumn(null);
                setEditTitle('');
              }}
            >
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.columnItem, { backgroundColor: theme.colors.card }]}>
        <GripVertical size={20} color={theme.colors.textSecondary} />
        <Text style={[styles.columnTitle, { color: theme.colors.text }]}>
          {column.title}
        </Text>
        <View style={styles.columnActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}
            onPress={() => {
              setEditingColumn(column);
              setEditTitle(column.title);
            }}
          >
            <Edit size={16} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
            onPress={() => handleDeleteColumn(column.id)}
          >
            <Trash2 size={16} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAddColumnForm = () => (
    <View style={[styles.addColumnForm, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.formTitle, { color: theme.colors.text }]}>
        Nova Coluna
      </Text>
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder="Nome da coluna"
        placeholderTextColor={theme.colors.textSecondary}
        value={newColumnTitle}
        onChangeText={setNewColumnTitle}
      />
      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => {
            setIsAddingColumn(false);
            setNewColumnTitle('');
          }}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddColumn}
        >
          <Text style={styles.saveButtonText}>Criar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
            Gerenciar Colunas
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Colunas do Projeto
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsAddingColumn(true)}
            >
              <Plus size={20} color="white" />
              <Text style={styles.addButtonText}>Nova Coluna</Text>
            </TouchableOpacity>
          </View>

          {isAddingColumn ? (
            renderAddColumnForm()
          ) : (
            <FlatList
              data={columns}
              renderItem={renderColumnItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.columnsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    Nenhuma coluna encontrada
                  </Text>
                  <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                    Crie sua primeira coluna para começar
                  </Text>
                </View>
              }
            />
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
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
  columnsList: {
    paddingBottom: 20,
  },
  columnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  columnTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  columnActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 6,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginLeft: 12,
  },
  addColumnForm: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
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
    backgroundColor: '#3b82f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
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
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
}); 