import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, CreateUserData, UpdateUserData, UserFilters, UserState } from '@/types/user';

interface ExtendedUserState extends UserState {
  // Ações
  getUsers: (filters?: UserFilters) => Promise<void>;
  getUser: (id: string) => Promise<void>;
  createUser: (data: CreateUserData) => Promise<void>;
  updateUser: (id: string, data: UpdateUserData) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setFilters: (filters: UserFilters) => void;
  resetState: () => void;
}

// Dados mockados para usuários
const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    role: 'admin',
    phone: '(11) 99999-9999',
    department: 'TI',
    position: 'Desenvolvedor Senior',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@exemplo.com',
    role: 'manager',
    phone: '(11) 88888-8888',
    department: 'Marketing',
    position: 'Gerente de Marketing',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@exemplo.com',
    role: 'member',
    phone: '(11) 77777-7777',
    department: 'Vendas',
    position: 'Vendedor',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
];

const initialState: UserState = {
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const useUserStore = create<ExtendedUserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      getUsers: async (filters?: UserFilters) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simular delay de API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          let filteredUsers = [...mockUsers];
          
          if (filters?.search) {
            const search = filters.search.toLowerCase();
            filteredUsers = filteredUsers.filter(user => 
              user.name.toLowerCase().includes(search) ||
              user.email.toLowerCase().includes(search)
            );
          }
          
          if (filters?.role) {
            filteredUsers = filteredUsers.filter(user => user.role === filters.role);
          }
          
          if (filters?.department) {
            filteredUsers = filteredUsers.filter(user => user.department === filters.department);
          }
          
          set({ users: filteredUsers, isLoading: false });
        } catch (error) {
          set({ error: 'Erro ao carregar usuários', isLoading: false });
        }
      },

      getUser: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const user = mockUsers.find(u => u.id === id);
          if (!user) {
            throw new Error('Usuário não encontrado');
          }
          
          set({ currentUser: user, isLoading: false });
        } catch (error) {
          set({ error: 'Erro ao carregar usuário', isLoading: false });
        }
      },

      createUser: async (data: CreateUserData) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newUser: User = {
            id: Date.now().toString(),
            name: data.name,
            email: data.email,
            role: data.role,
            phone: data.phone,
            department: data.department,
            position: data.position,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          mockUsers.push(newUser);
          set(state => ({ 
            users: [...state.users, newUser], 
            isLoading: false 
          }));
        } catch (error) {
          set({ error: 'Erro ao criar usuário', isLoading: false });
        }
      },

      updateUser: async (id: string, data: UpdateUserData) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const userIndex = mockUsers.findIndex(u => u.id === id);
          if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
          }
          
          const updatedUser = {
            ...mockUsers[userIndex],
            ...data,
            updatedAt: new Date().toISOString(),
          };
          
          mockUsers[userIndex] = updatedUser;
          
          set(state => ({
            users: state.users.map(u => u.id === id ? updatedUser : u),
            currentUser: state.currentUser?.id === id ? updatedUser : state.currentUser,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Erro ao atualizar usuário', isLoading: false });
        }
      },

      deleteUser: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const userIndex = mockUsers.findIndex(u => u.id === id);
          if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
          }
          
          mockUsers.splice(userIndex, 1);
          
          set(state => ({
            users: state.users.filter(u => u.id !== id),
            currentUser: state.currentUser?.id === id ? null : state.currentUser,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Erro ao excluir usuário', isLoading: false });
        }
      },

      setFilters: (filters: UserFilters) => {
        set({ filters });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
        filters: state.filters,
      }),
    }
  )
);