import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  name: string;
  email: string;
  updateProfile: (name: string, email: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: 'John Doe',
      email: 'john@example.com',
      updateProfile: (name: string, email: string) => set({ name, email }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);