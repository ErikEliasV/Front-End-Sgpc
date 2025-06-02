export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  createdAt: Date;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}