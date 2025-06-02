import { create } from 'zustand';
import { Task, Column, Priority } from '@/types/task';

interface KanbanState {
  columns: Column[];
  addTask: (columnId: string, task: Omit<Task, 'id' | 'createdAt' | 'columnId'>) => void;
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string) => void;
  updateTask: (taskId: string, columnId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string, columnId: string) => void;
}

const initialColumns: Column[] = [
  { id: 'todo', title: 'To Do', tasks: [] },
  { id: 'in-progress', title: 'In Progress', tasks: [] },
  { id: 'done', title: 'Done', tasks: [] },
];

export const useKanbanStore = create<KanbanState>((set) => ({
  columns: initialColumns,
  
  addTask: (columnId, taskData) => set((state) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      columnId,
    };

    return {
      columns: state.columns.map((column) =>
        column.id === columnId
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      ),
    };
  }),

  moveTask: (taskId, fromColumnId, toColumnId) => set((state) => {
    const fromColumn = state.columns.find((col) => col.id === fromColumnId);
    const task = fromColumn?.tasks.find((t) => t.id === taskId);

    if (!fromColumn || !task) return state;

    const updatedTask = { ...task, columnId: toColumnId };

    return {
      columns: state.columns.map((column) => {
        if (column.id === fromColumnId) {
          return {
            ...column,
            tasks: column.tasks.filter((t) => t.id !== taskId),
          };
        }
        if (column.id === toColumnId) {
          return {
            ...column,
            tasks: [...column.tasks, updatedTask],
          };
        }
        return column;
      }),
    };
  }),

  updateTask: (taskId, columnId, updates) => set((state) => ({
    columns: state.columns.map((column) =>
      column.id === columnId
        ? {
            ...column,
            tasks: column.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          }
        : column
    ),
  })),

  deleteTask: (taskId, columnId) => set((state) => ({
    columns: state.columns.map((column) =>
      column.id === columnId
        ? {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== taskId),
          }
        : column
    ),
  })),
}));