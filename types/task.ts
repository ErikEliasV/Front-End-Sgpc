export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  department?: string;
  position?: string;
  status?: 'pending' | 'active' | 'inactive';
  permissions: {
    canCreateTask: boolean;
    canEditTask: boolean;
    canDeleteTask: boolean;
    canMoveTask: boolean;
    canManageTeam: boolean;
  };
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  createdBy: string;
  createdAt: string;
  customColumns: ColumnTemplate[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  projectId: string;
  columnId: string;
  dueDate: string;
  estimatedHours: number;
  spentHours: number;
  materials: {
    materialId: string;
    quantity: number;
  }[];
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: string;
  }[];
  comments: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ColumnTemplate {
  id: string;
  title: string;
  order: number;
  isDefault: boolean;
}

export interface Column {
  id: string;
  title: string;
  teamId: string;
  order: number;
}

export interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description: string;
    priority: TaskPriority;
    assignedTo?: string;
  }) => void;
  teamMembers: TeamMember[];
}

export interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export interface CreateTaskData {
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId: string;
  projectId: string;
  columnId: string;
  dueDate: string;
  estimatedHours: number;
  materials?: {
    materialId: string;
    quantity: number;
  }[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: TaskStatus;
  spentHours?: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  projectId?: string;
  search?: string;
  dueDate?: string;
}

export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
}