import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getProjects: () => Promise<void>;
  createProject: (name: string, description: string) => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  resetState: () => void;
  clearCurrentProject: () => void;
}

// Dados mockados para projetos
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Desenvolvimento Web',
    description: 'Projeto de desenvolvimento de aplicação web',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isActive: false,
  },
  {
    id: '2',
    name: 'Aplicativo Mobile',
    description: 'Desenvolvimento de aplicativo para iOS e Android',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    isActive: false,
  },
  {
    id: '3',
    name: 'Sistema de Gestão',
    description: 'Sistema ERP para controle empresarial',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
    isActive: false,
  },
];

const initialState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
};

// Função para gerar IDs únicos
const generateUniqueId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const counter = Math.floor(Math.random() * 10000);
  return `project-${timestamp}-${random}-${counter}`;
};

// Função para remover duplicatas do array mockProjects
const removeDuplicates = (projects: Project[]): Project[] => {
  return projects.filter((project, index, self) => 
    index === self.findIndex(p => p.id === project.id)
  );
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      ...initialState,

      getProjects: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simular delay de API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // TODO: Futura integração com API
          // const response = await fetch('/api/projects');
          // const data = await response.json();
          
          // Remover duplicatas baseado no ID
          const uniqueProjects = removeDuplicates(mockProjects);
          
          set({ projects: uniqueProjects, isLoading: false });
        } catch (error) {
          set({ error: 'Erro ao carregar projetos', isLoading: false });
        }
      },

      createProject: async (name: string, description: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simular delay de API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verificar se já existe um projeto com o mesmo nome
          const existingProject = mockProjects.find(p => p.name.toLowerCase() === name.trim().toLowerCase());
          if (existingProject) {
            set({ error: 'Já existe um projeto com este nome', isLoading: false });
            return;
          }
          
          const newProject: Project = {
            id: generateUniqueId(),
            name: name.trim(),
            description: description.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: false,
          };
          
          // TODO: Futura integração com API
          // const response = await fetch('/api/projects', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ name, description })
          // });
          // const data = await response.json();
          
          // Atualizar tanto o mockProjects quanto o estado do Zustand
          mockProjects.push(newProject);
          
          // Remover duplicatas do mockProjects
          const uniqueMockProjects = removeDuplicates(mockProjects);
          
          set(state => ({ 
            projects: removeDuplicates([...state.projects, newProject]), 
            isLoading: false 
          }));
        } catch (error) {
          set({ error: 'Erro ao criar projeto', isLoading: false });
        }
      },

      selectProject: async (projectId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simular delay de API
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const project = mockProjects.find(p => p.id === projectId);
          if (!project) {
            throw new Error('Projeto não encontrado');
          }
          
          // TODO: Futura integração com API
          // await fetch(`/api/projects/${projectId}/select`, { method: 'POST' });
          
          // Atualizar status ativo dos projetos e remover duplicatas
          const updatedProjects = removeDuplicates(mockProjects).map(p => ({
            ...p,
            isActive: p.id === projectId
          }));
          
          console.log('Selecionando projeto:', project.name);
          console.log('Projeto encontrado:', project);
          
          set({ 
            projects: updatedProjects,
            currentProject: project, 
            isLoading: false 
          });
          
          console.log('Estado atualizado com projeto:', project.name);
        } catch (error) {
          console.error('Erro ao selecionar projeto:', error);
          set({ error: 'Erro ao selecionar projeto', isLoading: false });
        }
      },

      deleteProject: async (projectId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simular delay de API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // TODO: Futura integração com API
          // await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
          
          const projectIndex = mockProjects.findIndex(p => p.id === projectId);
          if (projectIndex === -1) {
            throw new Error('Projeto não encontrado');
          }
          
          mockProjects.splice(projectIndex, 1);
          
          set(state => ({
            projects: state.projects.filter(p => p.id !== projectId),
            currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Erro ao excluir projeto', isLoading: false });
        }
      },

      resetState: () => {
        set(initialState);
      },

      clearCurrentProject: () => {
        set({ currentProject: null });
      },
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
      }),
    }
  )
); 