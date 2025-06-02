import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { TaskCard } from '@/components/TaskCard';
import { AddTaskModal } from '@/components/AddTaskModal';
import { useKanbanStore } from '@/store/useKanbanStore';
import { Priority } from '@/types/task';
import Animated, {
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { DraggableTaskCard } from '@/components/DraggableTaskCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = Math.min(300, SCREEN_WIDTH * 0.8);

export default function HomeScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  const { columns, addTask, moveTask, deleteTask } = useKanbanStore();

  const handleAddTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setIsModalVisible(true);
  };

  const handleSubmitTask = (taskData: { title: string; description: string; priority: Priority }) => {
    if (selectedColumnId) {
      addTask(selectedColumnId, taskData);
    }
    setIsModalVisible(false); // Fecha o modal após adicionar
  };

  const handleDeleteTask = (taskId: string, columnId: string) => {
    deleteTask(taskId, columnId);
  };

  const createGestureHandler = (taskId: string, fromColumnId: string) =>
    useAnimatedGestureHandler({
      onActive: (event) => {
        const toColumnId = columns.find((col, index) => {
          const colX = index * (COLUMN_WIDTH + 20);
          return event.absoluteX > colX && event.absoluteX < colX + COLUMN_WIDTH;
        })?.id;

        if (toColumnId && toColumnId !== fromColumnId) {
          runOnJS(moveTask)(taskId, fromColumnId, toColumnId);
        }
      },
    });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Task Board</Text>
      </View>

      <ScrollView
        horizontal
        style={styles.columnsContainer}
        contentContainerStyle={styles.columnsContent}
        showsHorizontalScrollIndicator={false}
      >
        {columns.map((column) => (
          <View key={column.id} style={styles.column}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>{column.title}</Text>
              <Text style={styles.taskCount}>{column.tasks.length}</Text>
            </View>

            <ScrollView
              style={styles.taskList}
              showsVerticalScrollIndicator={false}
            >
              {column.tasks.map((task) => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  columnId={column.id}
                  columns={columns}
                  moveTask={moveTask}
                  onDelete={() => handleDeleteTask(task.id, column.id)}
                />
              ))}

            </ScrollView>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddTask(column.id)}
            >
              <Plus size={20} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <AddTaskModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmitTask}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  columnsContainer: {
    flex: 1,
  },
  columnsContent: {
    padding: 20,
  },
  column: {
    width: COLUMN_WIDTH,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  taskCount: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontFamily: 'Inter-Regular',
  },
  taskList: {
    maxHeight: 500,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    marginLeft: 8,
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Regular',
  },
});
