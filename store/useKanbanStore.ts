import { create } from 'zustand';
import { Task, Column, ColumnTemplate, TaskStatus } from '@/types/task';
import { useTeamStore } from './useTeamStore';
import { v4 as uuidv4 } from 'uuid';

interface KanbanState {
  columns: Column[];
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'lastModifiedAt'>) => void;
  moveTask: (taskId: string, columnId: string, movedBy: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>, modifiedBy: string) => void;
  deleteTask: (taskId: string) => void;
  initializeProjectColumns: (projectId: string) => void;
  getProjectColumns: (projectId: string) => Column[];
  getProjectTasks: (projectId: string) => Task[];
  canMemberPerformAction: (projectId: string, memberId: string, action: 'canMoveTask' | 'canCreateTask' | 'canEditTask' | 'canDeleteTask') => boolean;
  updateColumn: (column: Column) => void;
  deleteColumn: (columnId: string) => void;
  reorderColumns: (columns: Column[]) => void;
  addColumn: (column: Omit<Column, 'id'>) => void;
  resetStore: () => void;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  columns: [],
  tasks: [],

  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      tasks: [...state.tasks, newTask],
    }));
  },

  moveTask: (taskId, columnId, movedBy) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              columnId,
              updatedAt: new Date().toISOString(),
            }
          : task
      ),
    }));
  },

  updateTask: (taskId, updates, modifiedBy) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : task
      ),
    }));
  },

  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
  },

  initializeProjectColumns: (projectId) => {
    const defaultColumns: Column[] = [
      {
        id: `${projectId}-todo`,
        title: 'A Fazer',
        order: 0,
        teamId: projectId, // Usando projectId como teamId para compatibilidade
      },
      {
        id: `${projectId}-in-progress`,
        title: 'Em Progresso',
        order: 1,
        teamId: projectId,
      },
      {
        id: `${projectId}-review`,
        title: 'Em Revisão',
        order: 2,
        teamId: projectId,
      },
      {
        id: `${projectId}-done`,
        title: 'Concluído',
        order: 3,
        teamId: projectId,
      },
    ];

    const existingColumns = get().columns.filter(col => col.teamId === projectId);
    if (existingColumns.length === 0) {
      set((state) => ({
        columns: [...state.columns, ...defaultColumns],
      }));
    }
  },

  getProjectColumns: (projectId) => {
    const { columns } = get();
    return columns
      .filter((col) => col.teamId === projectId)
      .sort((a, b) => a.order - b.order);
  },

  getProjectTasks: (projectId) => {
    const { tasks } = get();
    return tasks.filter((task) => task.projectId === projectId);
  },

  canMemberPerformAction: (projectId, memberId, action) => {
    const { teams } = useTeamStore.getState();
    const team = teams.find((t) => t.id === projectId);
    if (!team) return false;

    const member = team.members.find((m) => m.id === memberId);
    if (!member) return false;

    return member.permissions[action];
  },

  updateColumn: (column) => {
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === column.id ? { ...col, ...column } : col
      ),
    }));
  },

  deleteColumn: (columnId) => {
    set((state) => ({
      columns: state.columns.filter((col) => col.id !== columnId),
    }));
  },

  addColumn: (columnData) => {
    const newColumn: Column = {
      ...columnData,
      id: `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    set((state) => ({
      columns: [...state.columns, newColumn],
    }));
  },

  reorderColumns: (columns) => {
    set((state) => ({
      columns: state.columns.map((col) => {
        const updatedCol = columns.find((c) => c.id === col.id);
        return updatedCol ? { ...col, ...updatedCol } : col;
      }),
    }));
  },

  resetStore: () => {
    set({ columns: [], tasks: [] });
  },
}));