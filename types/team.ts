export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamData {
  name: string;
  description: string;
  members: string[]; // Array de IDs dos membros
}

export interface UpdateTeamData extends Partial<CreateTeamData> {}

export interface TeamFilters {
  search?: string;
  memberId?: string;
}

export interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  error: string | null;
  filters: TeamFilters;
} 