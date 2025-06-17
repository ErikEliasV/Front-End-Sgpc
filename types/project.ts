export type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  managerId: string;
  teamId: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  teamId: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: ProjectStatus;
  progress?: number;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  teamId?: string;
  search?: string;
}

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  filters: ProjectFilters;
} 