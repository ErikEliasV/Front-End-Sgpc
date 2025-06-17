import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Trash2, Clock, User } from 'lucide-react-native';
import { TaskPriority, Task } from '@/types/task';
import { useTheme } from '@/constants/theme';
import { useTeamStore } from '@/store/useTeamStore';

const priorityColors: Record<TaskPriority, string> = {
  low: '#10B981',    // Green
  medium: '#F59E0B', // Amber
  high: '#EF4444',   // Red
  urgent: '#DC2626', // Dark Red
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onPress?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onDelete, 
  onPress, 
  canEdit, 
  canDelete 
}) => {
  const theme = useTheme();
  const { teams } = useTeamStore();
  // Usar projectId como teamId para compatibilidade
  const currentTeam = teams.find(t => t.id === task.projectId);
  const assignedMember = currentTeam?.members.find(m => m.id === task.assigneeId);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    priority: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: priorityColors[task.priority],
    },
    priorityText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    deleteButton: {
      padding: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
      color: theme.colors.text,
    },
    description: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    date: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    assignedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    assignedText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.priority}>
          <Text style={styles.priorityText}>{priorityLabels[task.priority]}</Text>
        </View>
        {canDelete && (
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => onDelete(task.id)}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{task.title}</Text>
      {task.description && (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      )}
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Clock size={14} color={theme.colors.textSecondary} />
          <Text style={styles.date}>
            {new Date(task.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        {assignedMember && (
          <View style={styles.assignedContainer}>
            <User size={14} color={theme.colors.textSecondary} />
            <Text style={styles.assignedText}>{assignedMember.name}</Text>
          </View>
        )}
      </View>
    </View>
  );
};