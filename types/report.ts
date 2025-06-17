export interface DashboardData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalMaterials: number;
  lowStockMaterials: number;
  totalBudget: number;
  spentBudget: number;
  projectProgress: {
    projectId: string;
    projectName: string;
    progress: number;
  }[];
  recentActivities: {
    id: string;
    type: 'project' | 'task' | 'material';
    action: 'created' | 'updated' | 'deleted';
    description: string;
    date: string;
  }[];
}

export interface ProjectReport {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  tasks: {
    total: number;
    completed: number;
    pending: number;
    delayed: number;
  };
  materials: {
    total: number;
    used: number;
    cost: number;
  };
  timeline: {
    date: string;
    progress: number;
    spent: number;
  }[];
}

export interface CostReport {
  totalBudget: number;
  totalSpent: number;
  balance: number;
  byProject: {
    projectId: string;
    projectName: string;
    budget: number;
    spent: number;
    balance: number;
  }[];
  byCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  timeline: {
    month: string;
    budget: number;
    spent: number;
  }[];
}

export interface StockReport {
  totalMaterials: number;
  totalValue: number;
  lowStockItems: number;
  byCategory: {
    category: string;
    quantity: number;
    value: number;
    lowStock: number;
  }[];
  byLocation: {
    location: string;
    quantity: number;
    value: number;
  }[];
  movements: {
    id: string;
    materialId: string;
    materialName: string;
    type: 'in' | 'out';
    quantity: number;
    date: string;
    projectId?: string;
    projectName?: string;
  }[];
}

export interface ReportState {
  dashboard: DashboardData | null;
  projectReport: ProjectReport | null;
  costReport: CostReport | null;
  stockReport: StockReport | null;
  isLoading: boolean;
  error: string | null;
} 