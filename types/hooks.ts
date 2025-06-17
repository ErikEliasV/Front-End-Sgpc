import { User, CreateUserData, UpdateUserData, UserFilters } from './user';
import { Project, CreateProjectData, UpdateProjectData, ProjectFilters } from './project';
import { Task, CreateTaskData, UpdateTaskData, TaskFilters } from './task';
import { Material, CreateMaterialData, UpdateMaterialData, MaterialFilters } from './material';
import { Team, CreateTeamData, UpdateTeamData, TeamFilters } from './team';
import { Notification, NotificationFilters } from './notification';
import { UserSettings } from './settings';
import { AuthResponse, LoginCredentials, RegisterData, ForgotPasswordData, ResetPasswordData } from './auth';
import { DashboardData, ProjectReport, CostReport, StockReport } from './report';
import { MockPagination } from './mock';

export interface UseAuth {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
}

export interface UseUsers {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  pagination: MockPagination;
  filters: UserFilters;
  getUsers: (filters?: UserFilters) => Promise<void>;
  getUser: (id: string) => Promise<void>;
  createUser: (data: CreateUserData) => Promise<void>;
  updateUser: (id: string, data: UpdateUserData) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setFilters: (filters: UserFilters) => void;
}

export interface UseProjects {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  pagination: MockPagination;
  filters: ProjectFilters;
  getProjects: (filters?: ProjectFilters) => Promise<void>;
  getProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<void>;
  updateProject: (id: string, data: UpdateProjectData) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setFilters: (filters: ProjectFilters) => void;
}

export interface UseTasks {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  pagination: MockPagination;
  filters: TaskFilters;
  getTasks: (filters?: TaskFilters) => Promise<void>;
  getTask: (id: string) => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<void>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: TaskFilters) => void;
} 