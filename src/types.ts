export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface DailySession {
  date: string; // YYYY-MM-DD format
  tasks: Task[];
  startTime: number; // timestamp when session started
  completedCount: number;
  notes?: string; // optional journal entry for the session
  notesUpdatedAt?: number; // timestamp when notes were last updated
}

export interface AppSettings {
  wakeTime: string; // HH:MM format (24-hour)
  sleepTime?: string; // HH:MM format (24-hour)
  sessionDuration: number; // in hours, default 18
}

export interface AppState {
  currentSession: DailySession | null;
  history: DailySession[];
  settings: AppSettings;
}
