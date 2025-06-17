export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'task' | 'project' | 'material' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  data?: {
    taskId?: string;
    projectId?: string;
    materialId?: string;
    [key: string]: any;
  };
  createdAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationFilters {
  type?: NotificationType;
  category?: NotificationCategory;
  read?: boolean;
  search?: string;
} 