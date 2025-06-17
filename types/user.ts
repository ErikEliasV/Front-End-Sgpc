export type UserRole = 'admin' | 'manager' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  department?: string;
  position?: string;
}

export interface UpdateUserData extends Partial<Omit<CreateUserData, 'password'>> {
  password?: string;
}

export interface UserFilters {
  role?: UserRole;
  department?: string;
  search?: string;
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  filters: UserFilters;
} 