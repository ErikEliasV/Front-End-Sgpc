export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  taskUpdates: boolean;
  projectUpdates: boolean;
  materialAlerts: boolean;
  systemNotifications: boolean;
}

export interface LanguageSettings {
  language: 'pt-BR' | 'en-US';
  dateFormat: string;
  timeFormat: string;
  timezone: string;
}

export interface UserSettings {
  theme: ThemeSettings;
  notifications: NotificationSettings;
  language: LanguageSettings;
  showCompletedTasks: boolean;
  showArchivedProjects: boolean;
  defaultView: 'kanban' | 'list' | 'calendar';
  autoSave: boolean;
  lastSync: string;
}

export interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
} 