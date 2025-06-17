import { User } from './user';
import { Project } from './project';
import { Task } from './task';
import { Material } from './material';
import { Team } from './team';
import { Notification } from './notification';
import { UserSettings } from './settings';

export interface MockData {
  users: User[];
  projects: Project[];
  tasks: Task[];
  materials: Material[];
  teams: Team[];
  notifications: Notification[];
  settings: UserSettings;
}

export interface MockResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

export interface MockPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MockPaginatedResponse<T> extends MockResponse<T> {
  pagination: MockPagination;
}

export interface MockError {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
}

export type MockDelay = number | { min: number; max: number };

export interface MockOptions {
  delay?: MockDelay;
  error?: MockError;
  pagination?: MockPagination;
} 