import { create } from 'zustand';
import { Team, TeamMember, ColumnTemplate } from '@/types/task';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createDefaultColumns = (projectId: string): ColumnTemplate[] => [
  { id: `${projectId}-todo`, title: 'A Fazer', order: 0, isDefault: true },
  { id: `${projectId}-in-progress`, title: 'Em Progresso', order: 1, isDefault: true },
  { id: `${projectId}-done`, title: 'Concluído', order: 2, isDefault: true },
];

interface TeamState {
  teams: Team[];
  currentProjectId: string | null;
  currentMemberId: string | null;
  currentTeam: Team | null;
  addTeam: (name: string, description: string, createdBy: string) => void;
  addTeamForProject: (projectId: string, name: string, description: string, createdBy: string) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;
  addTeamMember: (teamId: string, member: Omit<TeamMember, 'id' | 'permissions'>) => void;
  removeTeamMember: (teamId: string, memberId: string) => void;
  updateMemberPermissions: (teamId: string, memberId: string, permissions: Partial<TeamMember['permissions']>) => void;
  setCurrentProject: (projectId: string) => void;
  setCurrentMember: (memberId: string) => void;
  canMemberPerformAction: (projectId: string, memberId: string, action: keyof TeamMember['permissions']) => boolean;
}

const createDefaultPermissions = (isAdmin: boolean): TeamMember['permissions'] => ({
  canCreateTask: isAdmin,
  canEditTask: isAdmin,
  canDeleteTask: isAdmin,
  canMoveTask: isAdmin,
  canManageTeam: isAdmin,
});

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentProjectId: null,
  currentMemberId: null,
  currentTeam: null,

  addTeam: (name, description, createdBy) => {
    const teamId = createdBy.includes('admin') ? 'project-' + Date.now() : createdBy;
    const newTeam: Team = {
      id: teamId,
      name,
      description,
      members: [],
      createdBy,
      createdAt: new Date().toISOString(),
      customColumns: createDefaultColumns(teamId),
    };

    const creatorMember: TeamMember = {
      id: createdBy,
      name: 'Administrador',
      email: 'admin@projeto.com',
      role: 'admin',
      permissions: createDefaultPermissions(true),
    };

    newTeam.members.push(creatorMember);

    console.log('🏗️ Criando time:', {
      id: teamId,
      name,
      createdBy,
      memberPermissions: creatorMember.permissions
    });

    set((state) => ({
      teams: [...state.teams, newTeam],
      currentProjectId: teamId,
      currentTeam: newTeam,
    }));
  },

  addTeamForProject: (projectId, name, description, createdBy) => {
    const newTeam: Team = {
      id: projectId,
      name,
      description,
      members: [],
      createdBy,
      createdAt: new Date().toISOString(),
      customColumns: createDefaultColumns(projectId),
    };

    const creatorMember: TeamMember = {
      id: createdBy,
      name: 'Administrador',
      email: 'admin@projeto.com',
      role: 'admin',
      permissions: createDefaultPermissions(true),
    };

    newTeam.members.push(creatorMember);

    console.log('🏗️ Criando time para projeto:', {
      id: projectId,
      name,
      createdBy,
      memberPermissions: creatorMember.permissions
    });

    set((state) => ({
      teams: [...state.teams, newTeam],
      currentProjectId: projectId,
      currentTeam: newTeam,
    }));
  },

  updateTeam: (teamId, updates) => {
    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === teamId ? { ...team, ...updates } : team
      ),
      currentTeam: state.currentProjectId === teamId ? { ...state.currentTeam!, ...updates } : state.currentTeam,
    }));
  },

  deleteTeam: (teamId) => {
    set((state) => ({
      teams: state.teams.filter((team) => team.id !== teamId),
      currentProjectId: state.currentProjectId === teamId ? null : state.currentProjectId,
      currentTeam: state.currentProjectId === teamId ? null : state.currentTeam,
    }));
  },

  addTeamMember: (teamId, memberData) => {
    const newMember: TeamMember = {
      ...memberData,
      id: generateId(),
      permissions: createDefaultPermissions(memberData.role === 'admin'),
    };

    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === teamId
          ? { ...team, members: [...team.members, newMember] }
          : team
      ),
    }));
  },

  removeTeamMember: (teamId, memberId) => {
    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              members: team.members.filter((member) => member.id !== memberId),
            }
          : team
      ),
    }));
  },

  updateMemberPermissions: (teamId, memberId, permissions) => {
    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              members: team.members.map((member) =>
                member.id === memberId
                  ? {
                      ...member,
                      permissions: { ...member.permissions, ...permissions },
                    }
                  : member
              ),
            }
          : team
      ),
    }));
  },

  setCurrentProject: (projectId) => {
    const team = get().teams.find((t) => t.id === projectId);
    set({
      currentProjectId: projectId,
      currentTeam: team || null,
    });
  },

  setCurrentMember: (memberId) => {
    set({ currentMemberId: memberId });
  },

  canMemberPerformAction: (projectId, memberId, action) => {
    const { teams } = get();
    const team = teams.find((t) => t.id === projectId);
    if (!team) return false;

    const member = team.members.find((m) => m.id === memberId);
    if (!member) return false;

    return member.permissions[action];
  },
})); 