import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { AppState } from './types';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        clear: () => {
            store = {};
        },
        removeItem: (key: string) => {
            delete store[key];
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('Session Reset Logic', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        // Set onboarding as complete to skip it in tests
        localStorage.setItem('signal-focus-onboarding', 'true');
    });

    describe('Date Change Detection', () => {
        it('should show Morning Briefing when date changes with incomplete tasks', async () => {
            // Setup: Create a session from "yesterday" with incomplete tasks
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDate = yesterday.toISOString().split('T')[0];

            const appState: AppState = {
                currentSession: {
                    date: yesterdayDate,
                    tasks: [
                        { id: '1', text: 'Task 1', completed: false, createdAt: Date.now() },
                        { id: '2', text: 'Task 2', completed: false, createdAt: Date.now() },
                        { id: '3', text: 'Task 3', completed: true, createdAt: Date.now() },
                    ],
                    startTime: Date.now() - 24 * 60 * 60 * 1000,
                    completedCount: 1,
                },
                history: [],
                settings: {
                    wakeTime: '06:00',
                    sleepTime: '22:00',
                    sessionDuration: 18,
                },
            };

            localStorage.setItem('signal-focus-app', JSON.stringify(appState));

            // Render app
            render(<App />);

            // Assert: Morning Briefing modal should appear
            await waitFor(() => {
                expect(screen.getByText(/Good Morning/i)).toBeInTheDocument();
            });

            // Assert: Should show 2 incomplete tasks (not the completed one)
            // Query within the modal to avoid conflicts with main task list
            const modal = screen.getByText(/Good Morning/i).closest('.morning-briefing-container') as HTMLElement;
            expect(modal).toBeInTheDocument();

            if (modal) {
                expect(within(modal).getByText('Task 1')).toBeInTheDocument();
                expect(within(modal).getByText('Task 2')).toBeInTheDocument();
                expect(within(modal).queryByText('Task 3')).not.toBeInTheDocument();
            }
        });

        it('should archive session when date changes with all tasks complete', async () => {
            // Setup: Create a session from "yesterday" with all tasks complete
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDate = yesterday.toISOString().split('T')[0];

            const appState: AppState = {
                currentSession: {
                    date: yesterdayDate,
                    tasks: [
                        { id: '1', text: 'Task 1', completed: true, createdAt: Date.now() },
                        { id: '2', text: 'Task 2', completed: true, createdAt: Date.now() },
                        { id: '3', text: 'Task 3', completed: true, createdAt: Date.now() },
                    ],
                    startTime: Date.now() - 24 * 60 * 60 * 1000,
                    completedCount: 3,
                },
                history: [],
                settings: {
                    wakeTime: '06:00',
                    sleepTime: '22:00',
                    sessionDuration: 18,
                },
            };

            localStorage.setItem('signal-focus-app', JSON.stringify(appState));

            // Render app
            render(<App />);

            // Assert: Morning Briefing modal should NOT appear
            await waitFor(() => {
                expect(screen.queryByText(/Good Morning/i)).not.toBeInTheDocument();
            });

            // Assert: Session should be archived to history
            const savedState = JSON.parse(localStorage.getItem('signal-focus-app') || '{}');
            expect(savedState.history).toHaveLength(1);
            expect(savedState.history[0].date).toBe(yesterdayDate);
            expect(savedState.currentSession).toBeNull();
        });

        it('should not show Morning Briefing if session has no tasks', async () => {
            // Setup: Create a session from "yesterday" with 0 tasks
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDate = yesterday.toISOString().split('T')[0];

            const appState: AppState = {
                currentSession: {
                    date: yesterdayDate,
                    tasks: [],
                    startTime: Date.now() - 24 * 60 * 60 * 1000,
                    completedCount: 0,
                },
                history: [],
                settings: {
                    wakeTime: '06:00',
                    sleepTime: '22:00',
                    sessionDuration: 18,
                },
            };

            localStorage.setItem('signal-focus-app', JSON.stringify(appState));

            // Render app
            render(<App />);

            // Assert: Morning Briefing modal should NOT appear
            await waitFor(() => {
                expect(screen.queryByText(/Good Morning/i)).not.toBeInTheDocument();
            });

            // Assert: Session should be reset (not archived since it has 0 tasks)
            const savedState = JSON.parse(localStorage.getItem('signal-focus-app') || '{}');
            expect(savedState.history).toHaveLength(0);
            expect(savedState.currentSession).toBeNull();
        });

        it('should not trigger reset if session is from today', async () => {
            // Setup: Create a session from "today"
            const today = new Date();
            const todayDate = today.toISOString().split('T')[0];

            const appState: AppState = {
                currentSession: {
                    date: todayDate,
                    tasks: [
                        { id: '1', text: 'Task 1', completed: false, createdAt: Date.now() },
                    ],
                    startTime: Date.now(),
                    completedCount: 0,
                },
                history: [],
                settings: {
                    wakeTime: '06:00',
                    sleepTime: '22:00',
                    sessionDuration: 18,
                },
            };

            localStorage.setItem('signal-focus-app', JSON.stringify(appState));

            // Render app
            render(<App />);

            // Assert: Morning Briefing modal should NOT appear
            await waitFor(() => {
                expect(screen.queryByText(/Good Morning/i)).not.toBeInTheDocument();
            });

            // Assert: Session should remain unchanged
            const savedState = JSON.parse(localStorage.getItem('signal-focus-app') || '{}');
            expect(savedState.currentSession.date).toBe(todayDate);
            expect(savedState.currentSession.tasks).toHaveLength(1);
        });
    });

    describe('Morning Briefing - Task Rollover', () => {
        it('should rollover selected tasks to new session', async () => {
            const user = userEvent.setup();

            // Setup: Create a session from "yesterday" with 3 incomplete tasks
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDate = yesterday.toISOString().split('T')[0];

            const appState: AppState = {
                currentSession: {
                    date: yesterdayDate,
                    tasks: [
                        { id: '1', text: 'Keep this task', completed: false, createdAt: Date.now() },
                        { id: '2', text: 'Discard this task', completed: false, createdAt: Date.now() },
                        { id: '3', text: 'Also keep this', completed: false, createdAt: Date.now() },
                    ],
                    startTime: Date.now() - 24 * 60 * 60 * 1000,
                    completedCount: 0,
                },
                history: [],
                settings: {
                    wakeTime: '06:00',
                    sleepTime: '22:00',
                    sessionDuration: 18,
                },
            };

            localStorage.setItem('signal-focus-app', JSON.stringify(appState));

            // Render app
            render(<App />);

            // Wait for Morning Briefing to appear
            await waitFor(() => {
                expect(screen.getByText(/Good Morning/i)).toBeInTheDocument();
            });

            // All tasks should be checked by default - query within modal
            const modal = screen.getByText(/Good Morning/i).closest('.morning-briefing-container') as HTMLElement;
            const checkboxes = within(modal).getAllByRole('checkbox');
            expect(checkboxes).toHaveLength(3);
            checkboxes.forEach((checkbox) => {
                expect(checkbox).toBeChecked();
            });

            // Uncheck the second task
            await user.click(checkboxes[1]);

            // Click "Keep Selected (2)"
            const keepButton = screen.getByRole('button', { name: /Keep Selected \(2\)/i });
            await user.click(keepButton);

            // Assert: Modal should close
            await waitFor(() => {
                expect(screen.queryByText(/Good Morning/i)).not.toBeInTheDocument();
            });

            // Assert: New session should have 2 tasks
            const savedState = JSON.parse(localStorage.getItem('signal-focus-app') || '{}');
            expect(savedState.currentSession.tasks).toHaveLength(2);
            expect(savedState.currentSession.tasks[0].text).toBe('Keep this task');
            expect(savedState.currentSession.tasks[1].text).toBe('Also keep this');

            // Assert: Old session should be in history
            expect(savedState.history).toHaveLength(1);
            expect(savedState.history[0].date).toBe(yesterdayDate);
        });

        it('should handle "Start Fresh" correctly', async () => {
            const user = userEvent.setup();

            // Setup: Create a session from "yesterday" with incomplete tasks
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDate = yesterday.toISOString().split('T')[0];

            const appState: AppState = {
                currentSession: {
                    date: yesterdayDate,
                    tasks: [
                        { id: '1', text: 'Task 1', completed: false, createdAt: Date.now() },
                        { id: '2', text: 'Task 2', completed: false, createdAt: Date.now() },
                    ],
                    startTime: Date.now() - 24 * 60 * 60 * 1000,
                    completedCount: 0,
                },
                history: [],
                settings: {
                    wakeTime: '06:00',
                    sleepTime: '22:00',
                    sessionDuration: 18,
                },
            };

            localStorage.setItem('signal-focus-app', JSON.stringify(appState));

            // Render app
            render(<App />);

            // Wait for Morning Briefing to appear
            await waitFor(() => {
                expect(screen.getByText(/Good Morning/i)).toBeInTheDocument();
            });

            // Click "Start Fresh"
            const startFreshButton = screen.getByRole('button', { name: /Start Fresh/i });
            await user.click(startFreshButton);

            // Assert: Modal should close
            await waitFor(() => {
                expect(screen.queryByText(/Good Morning/i)).not.toBeInTheDocument();
            });

            // Assert: New session should be null (fresh start)
            const savedState = JSON.parse(localStorage.getItem('signal-focus-app') || '{}');
            expect(savedState.currentSession).toBeNull();

            // Assert: Old session should be in history
            expect(savedState.history).toHaveLength(1);
            expect(savedState.history[0].date).toBe(yesterdayDate);
        });

        it('should update button text dynamically as tasks are selected/deselected', async () => {
            const user = userEvent.setup();

            // Setup: Create a session from "yesterday" with 3 incomplete tasks
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDate = yesterday.toISOString().split('T')[0];

            const appState: AppState = {
                currentSession: {
                    date: yesterdayDate,
                    tasks: [
                        { id: '1', text: 'Task 1', completed: false, createdAt: Date.now() },
                        { id: '2', text: 'Task 2', completed: false, createdAt: Date.now() },
                        { id: '3', text: 'Task 3', completed: false, createdAt: Date.now() },
                    ],
                    startTime: Date.now() - 24 * 60 * 60 * 1000,
                    completedCount: 0,
                },
                history: [],
                settings: {
                    wakeTime: '06:00',
                    sleepTime: '22:00',
                    sessionDuration: 18,
                },
            };

            localStorage.setItem('signal-focus-app', JSON.stringify(appState));

            // Render app
            render(<App />);

            // Wait for Morning Briefing to appear
            await waitFor(() => {
                expect(screen.getByText(/Good Morning/i)).toBeInTheDocument();
            });

            // Initially all 3 tasks are selected
            expect(screen.getByRole('button', { name: /Keep Selected \(3\)/i })).toBeInTheDocument();

            // Get checkboxes within the modal
            const modal = screen.getByText(/Good Morning/i).closest('.morning-briefing-container') as HTMLElement;
            const checkboxes = within(modal).getAllByRole('checkbox');

            // Uncheck one task
            await user.click(checkboxes[0]);

            // Button should update to (2)
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Keep Selected \(2\)/i })).toBeInTheDocument();
            }, { timeout: 2000 });
        });
    });

    describe('Edge Cases', () => {
        it('should handle session with mix of complete and incomplete tasks', async () => {
            // Setup: Session with 2 complete, 2 incomplete
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDate = yesterday.toISOString().split('T')[0];

            const appState: AppState = {
                currentSession: {
                    date: yesterdayDate,
                    tasks: [
                        { id: '1', text: 'Incomplete 1', completed: false, createdAt: Date.now() },
                        { id: '2', text: 'Complete 1', completed: true, createdAt: Date.now() },
                        { id: '3', text: 'Incomplete 2', completed: false, createdAt: Date.now() },
                        { id: '4', text: 'Complete 2', completed: true, createdAt: Date.now() },
                    ],
                    startTime: Date.now() - 24 * 60 * 60 * 1000,
                    completedCount: 2,
                },
                history: [],
                settings: {
                    wakeTime: '06:00',
                    sleepTime: '22:00',
                    sessionDuration: 18,
                },
            };

            localStorage.setItem('signal-focus-app', JSON.stringify(appState));

            // Render app
            render(<App />);

            // Assert: Morning Briefing should show only 2 incomplete tasks
            await waitFor(() => {
                expect(screen.getByText(/Good Morning/i)).toBeInTheDocument();
            });

            // Query within the modal to check only incomplete tasks
            const modal = screen.getByText(/Good Morning/i).closest('.morning-briefing-container') as HTMLElement;
            expect(modal).toBeInTheDocument();

            if (modal) {
                // Should show only incomplete tasks in the modal
                expect(within(modal).getByText('Incomplete 1')).toBeInTheDocument();
                expect(within(modal).getByText('Incomplete 2')).toBeInTheDocument();

                // Completed tasks should not be in the modal
                expect(within(modal).queryByText('Complete 1')).not.toBeInTheDocument();
                expect(within(modal).queryByText('Complete 2')).not.toBeInTheDocument();
            }
        });

        it('should preserve old session data when archiving', async () => {
            const user = userEvent.setup();

            // Setup: Session with notes and specific completion count
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDate = yesterday.toISOString().split('T')[0];

            const appState: AppState = {
                currentSession: {
                    date: yesterdayDate,
                    tasks: [
                        { id: '1', text: 'Task 1', completed: true, createdAt: Date.now() },
                        { id: '2', text: 'Task 2', completed: false, createdAt: Date.now() },
                    ],
                    startTime: Date.now() - 24 * 60 * 60 * 1000,
                    completedCount: 1,
                    notes: 'Important notes from yesterday',
                    notesUpdatedAt: Date.now() - 12 * 60 * 60 * 1000,
                },
                history: [],
                settings: {
                    wakeTime: '06:00',
                    sleepTime: '22:00',
                    sessionDuration: 18,
                },
            };

            localStorage.setItem('signal-focus-app', JSON.stringify(appState));

            // Render app
            render(<App />);

            // Wait for Morning Briefing
            await waitFor(() => {
                expect(screen.getByText(/Good Morning/i)).toBeInTheDocument();
            });

            // Click "Start Fresh"
            const startFreshButton = screen.getByRole('button', { name: /Start Fresh/i });
            await user.click(startFreshButton);

            // Assert: Archived session should preserve all data
            const savedState = JSON.parse(localStorage.getItem('signal-focus-app') || '{}');
            const archivedSession = savedState.history[0];

            expect(archivedSession.date).toBe(yesterdayDate);
            expect(archivedSession.tasks).toHaveLength(2);
            expect(archivedSession.completedCount).toBe(1);
            expect(archivedSession.notes).toBe('Important notes from yesterday');
            expect(archivedSession.notesUpdatedAt).toBeDefined();
        });
    });
});
