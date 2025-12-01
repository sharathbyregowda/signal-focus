import { useState, useEffect } from 'react';
import type { Task, DailySession, AppState, AppSettings } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getTodayDateString, shouldResetSession } from './utils/utils';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { CountdownTimer } from './components/CountdownTimer';
import { FocusMode } from './components/FocusMode';
import { HistoryView } from './components/HistoryView';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { SessionNotes } from './components/SessionNotes';
import { ThemeToggle } from './components/ThemeToggle';
import { OnboardingModal } from './components/OnboardingModal';
import { MorningBriefingModal } from './components/MorningBriefingModal';
import './App.css';



const MIN_TASKS = 3;
const MAX_TASKS = 5;
const SESSION_DURATION = 18; // hours

function App() {
  const [appState, setAppState] = useLocalStorage<AppState>('signal-focus-app', {
    currentSession: null,
    history: [],
    settings: {
      wakeTime: '06:00',
      sleepTime: '22:00',
      sessionDuration: SESSION_DURATION,
    },
  });

  const [showFocusMode, setShowFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'analytics' | 'settings'>('today');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    return localStorage.getItem('signal-focus-onboarding') === 'true';
  });
  const [showMorningBriefing, setShowMorningBriefing] = useState(false);
  const [pendingRolloverTasks, setPendingRolloverTasks] = useState<Task[]>([]);

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    localStorage.setItem('signal-focus-onboarding', 'true');
  };

  // Check if we need to reset the session for a new day
  useEffect(() => {
    const todayDate = getTodayDateString();

    if (shouldResetSession(appState.currentSession, todayDate)) {
      const incompleteTasks = appState.currentSession?.tasks.filter((t) => !t.completed) || [];

      if (incompleteTasks.length > 0) {
        // Show Morning Briefing for incomplete tasks
        setPendingRolloverTasks(incompleteTasks);
        setShowMorningBriefing(true);
      } else {
        // No incomplete tasks, just archive and reset
        if (appState.currentSession && appState.currentSession.tasks.length > 0) {
          setAppState({
            ...appState,
            history: [...appState.history, appState.currentSession],
            currentSession: null,
          });
        } else {
          setAppState({
            ...appState,
            currentSession: null,
          });
        }
      }
    }
  }, []);

  const handleAddTask = (text: string) => {
    const newTask: Task = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      completed: false,
      createdAt: Date.now(),
    };

    const todayDate = getTodayDateString();

    if (!appState.currentSession) {
      // Create new session
      const newSession: DailySession = {
        date: todayDate,
        tasks: [newTask],
        startTime: Date.now(),
        completedCount: 0,
      };
      setAppState({
        ...appState,
        currentSession: newSession,
      });
    } else {
      // Add to existing session
      setAppState({
        ...appState,
        currentSession: {
          ...appState.currentSession,
          tasks: [...appState.currentSession.tasks, newTask],
        },
      });
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (!appState.currentSession) return;

    const updatedTasks = appState.currentSession.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const completedCount = updatedTasks.filter((t) => t.completed).length;

    setAppState({
      ...appState,
      currentSession: {
        ...appState.currentSession,
        tasks: updatedTasks,
        completedCount,
      },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!appState.currentSession) return;

    const updatedTasks = appState.currentSession.tasks.filter((task) => task.id !== taskId);
    const completedCount = updatedTasks.filter((t) => t.completed).length;

    // If no tasks remain, remove the session entirely
    if (updatedTasks.length === 0) {
      setAppState({
        ...appState,
        currentSession: null,
      });
    } else {
      setAppState({
        ...appState,
        currentSession: {
          ...appState.currentSession,
          tasks: updatedTasks,
          completedCount,
        },
      });
    }
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setAppState({
      ...appState,
      settings: newSettings,
    });
  };

  const handleImportData = (importedData: AppState) => {
    // Replace entire app state with imported data
    setAppState(importedData);
  };

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    if (!appState.currentSession) return;

    setAppState({
      ...appState,
      currentSession: {
        ...appState.currentSession,
        tasks: reorderedTasks,
      },
    });
  };

  const handleNotesChange = (notes: string) => {
    if (!appState.currentSession) return;

    setAppState({
      ...appState,
      currentSession: {
        ...appState.currentSession,
        notes,
        notesUpdatedAt: Date.now(),
      },
    });
  };

  const handleKeepTasks = (selectedTaskIds: string[]) => {
    const keptTasks = pendingRolloverTasks.filter((t) => selectedTaskIds.includes(t.id));

    // Archive old session to history
    if (appState.currentSession && appState.currentSession.tasks.length > 0) {
      setAppState({
        ...appState,
        history: [...appState.history, appState.currentSession],
        currentSession: {
          date: getTodayDateString(),
          tasks: keptTasks,
          startTime: Date.now(),
          completedCount: 0,
        },
      });
    }

    setShowMorningBriefing(false);
    setPendingRolloverTasks([]);
  };

  const handleStartFresh = () => {
    // Archive old session, start blank
    if (appState.currentSession && appState.currentSession.tasks.length > 0) {
      setAppState({
        ...appState,
        history: [...appState.history, appState.currentSession],
        currentSession: null,
      });
    } else {
      setAppState({
        ...appState,
        currentSession: null,
      });
    }

    setShowMorningBriefing(false);
    setPendingRolloverTasks([]);
  };

  const currentTaskCount = appState.currentSession?.tasks.length || 0;
  const canStartFocus = currentTaskCount >= MIN_TASKS;
  const hasIncompleteTasks = appState.currentSession?.tasks.some((t) => !t.completed) || false;

  return (
    <div className="app">
      <ThemeToggle />
      <header className="app-header">
        <h1 className="app-title">Signal vs. Noise</h1>
        <p className="app-subtitle">
          {hasSeenOnboarding
            ? "Focus on the signal. Cut the noise."
            : "Focus on what truly matters. 3-5 mission-critical tasks. 16 waking hours. Get the 8 hours of sleep your body needs. 💤"}
        </p>
      </header>

      <main className="app-main">
        <div className="app-content">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'today' ? 'active' : ''}`}
              onClick={() => setActiveTab('today')}
            >
              Today
            </button>
            <button
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
            <button
              className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button
              className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>

          {activeTab === 'today' && (
            <>
              {appState.currentSession && (
                <div className="timer-section">
                  <CountdownTimer
                    startTime={appState.currentSession.startTime}
                    sleepTime={appState.settings.sleepTime}
                  />
                </div>
              )}

              <div className="session-container">
                <div className="tasks-section">
                  <TaskInput
                    onAddTask={handleAddTask}
                    currentTaskCount={currentTaskCount}
                    maxTasks={MAX_TASKS}
                  />
                  <TaskList
                    tasks={appState.currentSession?.tasks || []}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onReorderTasks={handleReorderTasks}
                  />
                  {appState.currentSession && (
                    <SessionNotes
                      notes={appState.currentSession.notes || ''}
                      onNotesChange={handleNotesChange}
                      lastSaved={appState.currentSession.notesUpdatedAt}
                    />
                  )}
                </div>

                {appState.currentSession && hasIncompleteTasks && (
                  <div className="actions-section">
                    <button
                      onClick={() => setShowFocusMode(true)}
                      className={`btn btn-primary ${!canStartFocus ? 'btn-disabled' : ''}`}
                      disabled={!canStartFocus}
                    >
                      {canStartFocus ? '🎯 Enter Focus Mode' : '🔒 Focus Mode Locked'}
                    </button>
                    {!canStartFocus && (
                      <p className="focus-hint">
                        Add <strong>{MIN_TASKS - currentTaskCount}</strong> more {MIN_TASKS - currentTaskCount === 1 ? 'task' : 'tasks'} to unlock
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'history' && <HistoryView history={appState.history} />}

          {activeTab === 'analytics' && (
            <Analytics history={appState.history} />
          )}

          {activeTab === 'settings' && (
            <Settings
              settings={appState.settings}
              onUpdateSettings={handleUpdateSettings}
              appState={appState}
              onImportData={handleImportData}
            />
          )}
        </div>
      </main>

      {showFocusMode && appState.currentSession && (
        <FocusMode
          tasks={appState.currentSession.tasks}
          onToggleTask={handleToggleTask}
          onClose={() => setShowFocusMode(false)}
        />
      )}
      {!hasSeenOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      {showMorningBriefing && (
        <MorningBriefingModal
          incompleteTasks={pendingRolloverTasks}
          onKeepTasks={handleKeepTasks}
          onStartFresh={handleStartFresh}
        />
      )}
    </div>
  );
}

export default App;
