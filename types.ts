
export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface HistoryEntry {
  date: string;
  tasks: Task[];
  success: boolean;
  streak: number;
}

export interface UserData {
  name: string;
  streak: number;
  bestStreak: number;
  tasksToday: Task[];
  tasksTomorrow: string[];
  lastCompletedDate: string | null; // ISO string date
  history: HistoryEntry[];
}

export type UserRole = 'Sebastian' | 'Cole';

export interface RivalryState {
  Sebastian: UserData;
  Cole: UserData;
  customMotto: string;
}
