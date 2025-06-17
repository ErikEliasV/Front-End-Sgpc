import { User, CreateUserData, UpdateUserData, UserFilters } from './user';
import { Project, CreateProjectData, UpdateProjectData, ProjectFilters } from './project';
import { Task, CreateTaskData, UpdateTaskData, TaskFilters } from './task';
import { Material, CreateMaterialData, UpdateMaterialData, MaterialFilters } from './material';
import { Team, CreateTeamData, UpdateTeamData, TeamFilters } from './team';
import { Notification, NotificationFilters } from './notification';
import { UserSettings } from './settings';
import { AuthResponse, LoginCredentials, RegisterData, ForgotPasswordData, ResetPasswordData } from './auth';
import { DashboardData, ProjectReport, CostReport, StockReport } from './report';
import { MockResponse, MockPaginatedResponse, MockOptions } from './mock';

export interface AuthService {
  login: (credentials: LoginCredentials) => Promise<MockResponse<AuthResponse>>;
  register: (data: RegisterData) => Promise<MockResponse<AuthResponse>>;
  forgotPassword: (data: ForgotPasswordData) => Promise<MockResponse<void>>;
  resetPassword: (data: ResetPasswordData) => Promise<MockResponse<void>>;
  logout: () => Promise<MockResponse<void>>;
}

export interface UserService {
  getUsers: (filters?: UserFilters, options?: MockOptions) => Promise<MockPaginatedResponse<User[]>>;
  getUser: (id: string, options?: MockOptions) => Promise<MockResponse<User>>;
  createUser: (data: CreateUserData, options?: MockOptions) => Promise<MockResponse<User>>;
  updateUser: (id: string, data: UpdateUserData, options?: MockOptions) => Promise<MockResponse<User>>;
  deleteUser: (id: string, options?: MockOptions) => Promise<MockResponse<void>>;
}

export interface ProjectService {
  getProjects: (filters?: ProjectFilters, options?: MockOptions) => Promise<MockPaginatedResponse<Project[]>>;
  getProject: (id: string, options?: MockOptions) => Promise<MockResponse<Project>>;
  createProject: (data: CreateProjectData, options?: MockOptions) => Promise<MockResponse<Project>>;
  updateProject: (id: string, data: UpdateProjectData, options?: MockOptions) => Promise<MockResponse<Project>>;
  deleteProject: (id: string, options?: MockOptions) => Promise<MockResponse<void>>;
}

export interface TaskService {
  getTasks: (filters?: TaskFilters, options?: MockOptions) => Promise<MockPaginatedResponse<Task[]>>;
  getTask: (id: string, options?: MockOptions) => Promise<MockResponse<Task>>;
  createTask: (data: CreateTaskData, options?: MockOptions) => Promise<MockResponse<Task>>;
  updateTask: (id: string, data: UpdateTaskData, options?: MockOptions) => Promise<MockResponse<Task>>;
  deleteTask: (id: string, options?: MockOptions) => Promise<MockResponse<void>>;
}

export interface MaterialService {
  getMaterials: (filters?: MaterialFilters, options?: MockOptions) => Promise<MockPaginatedResponse<Material[]>>;
  getMaterial: (id: string, options?: MockOptions) => Promise<MockResponse<Material>>;
  createMaterial: (data: CreateMaterialData, options?: MockOptions) => Promise<MockResponse<Material>>;
  updateMaterial: (id: string, data: UpdateMaterialData, options?: MockOptions) => Promise<MockResponse<Material>>;
  deleteMaterial: (id: string, options?: MockOptions) => Promise<MockResponse<void>>;
}

export interface TeamService {
  getTeams: (filters?: TeamFilters, options?: MockOptions) => Promise<MockPaginatedResponse<Team[]>>;
  getTeam: (id: string, options?: MockOptions) => Promise<MockResponse<Team>>;
  createTeam: (data: CreateTeamData, options?: MockOptions) => Promise<MockResponse<Team>>;
  updateTeam: (id: string, data: UpdateTeamData, options?: MockOptions) => Promise<MockResponse<Team>>;
  deleteTeam: (id: string, options?: MockOptions) => Promise<MockResponse<void>>;
}

export interface NotificationService {
  getNotifications: (filters?: NotificationFilters, options?: MockOptions) => Promise<MockPaginatedResponse<Notification[]>>;
  markAsRead: (id: string, options?: MockOptions) => Promise<MockResponse<void>>;
  markAllAsRead: (options?: MockOptions) => Promise<MockResponse<void>>;
  deleteNotification: (id: string, options?: MockOptions) => Promise<MockResponse<void>>;
}

export interface SettingsService {
  getSettings: (options?: MockOptions) => Promise<MockResponse<UserSettings>>;
  updateSettings: (settings: Partial<UserSettings>, options?: MockOptions) => Promise<MockResponse<UserSettings>>;
}

export interface ReportService {
  getDashboard: (options?: MockOptions) => Promise<MockResponse<DashboardData>>;
  getProjectReport: (projectId: string, options?: MockOptions) => Promise<MockResponse<ProjectReport>>;
  getCostReport: (options?: MockOptions) => Promise<MockResponse<CostReport>>;
  getStockReport: (options?: MockOptions) => Promise<MockResponse<StockReport>>;
}

export interface ApiService {
  auth: AuthService;
  users: UserService;
  projects: ProjectService;
  tasks: TaskService;
  materials: MaterialService;
  teams: TeamService;
  notifications: NotificationService;
  settings: SettingsService;
  reports: ReportService;
} 