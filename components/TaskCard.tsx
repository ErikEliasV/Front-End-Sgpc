import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Task, Priority } from '@/types/task';
import { CircleAlert as AlertCircle, Clock, Trash2 } from 'lucide-react-native';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onDelete: () => void;
}

const priorityColors: Record<Priority, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
};

export function TaskCard({ task, onPress, onDelete }: TaskCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.priority, { backgroundColor: priorityColors[task.priority] }]}>
          <AlertCircle size={12} color="white" />
          <Text style={styles.priorityText}>{task.priority}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Trash2 size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.title} numberOfLines={2}>
        {task.title}
      </Text>
      
      <Text style={styles.description} numberOfLines={2}>
        {task.description}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Clock size={12} color="#6B7280" />
          <Text style={styles.date}>
            {new Date(task.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
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
    marginBottom: 12,
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
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
    color: '#6B7280',
    marginLeft: 4,
  },
});