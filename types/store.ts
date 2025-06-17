import { AuthState } from './auth';
import { ProjectState } from './project';
import { TaskState } from './task';
import { MaterialState } from './material';
import { TeamState } from './team';
import { UserState } from './user';
import { NotificationState } from './notification';
import { SettingsState } from './settings';
import { ErrorState } from './error';
import { ReportState } from './report';

export interface RootState {
  auth: AuthState;
  projects: ProjectState;
  tasks: TaskState;
  materials: MaterialState;
  teams: TeamState;
  users: UserState;
  notifications: NotificationState;
  settings: SettingsState;
  error: ErrorState;
  reports: ReportState;
}

export type StoreSlice<T> = {
  getState: () => T;
  setState: (state: Partial<T>) => void;
  subscribe: (listener: (state: T) => void) => () => void;
  reset: () => void;
}; 