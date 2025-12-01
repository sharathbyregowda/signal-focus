import { describe, it, expect } from 'vitest';
import {
    formatDate,
    getTodayDateString,
    shouldResetSession,
    calculateStreak,
    calculateBestStreak,
    calculateCompletionRate,
} from '../utils/utils';
import type { DailySession } from '../types';

describe('Utils - Date Functions', () => {
    describe('formatDate', () => {
        it('should format timestamp correctly', () => {
            const timestamp = new Date('2024-01-15').getTime();
            const result = formatDate(timestamp);
            expect(result).toBe('January 15, 2024');
        });
    });

    describe('getTodayDateString', () => {
        it('should return date in YYYY-MM-DD format', () => {
            const result = getTodayDateString();
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });

    describe('shouldResetSession', () => {
        it('should return false for null session', () => {
            expect(shouldResetSession(null, '2024-01-15')).toBe(false);
        });

        it('should return false for same date', () => {
            const session: DailySession = {
                date: '2024-01-15',
                tasks: [],
                startTime: Date.now(),
                completedCount: 0,
            };
            expect(shouldResetSession(session, '2024-01-15')).toBe(false);
        });

        it('should return true for different date', () => {
            const session: DailySession = {
                date: '2024-01-15',
                tasks: [],
                startTime: Date.now(),
                completedCount: 0,
            };
            expect(shouldResetSession(session, '2024-01-16')).toBe(true);
        });
    });
});

describe('Utils - Streak Calculations', () => {
    describe('calculateStreak', () => {
        it('should return 0 for empty history', () => {
            expect(calculateStreak([])).toBe(0);
        });

        it('should return 0 for sessions with no completed tasks', () => {
            const history: DailySession[] = [
                {
                    date: getTodayDateString(),
                    tasks: [{ id: '1', text: 'Task', completed: false, createdAt: Date.now() }],
                    startTime: Date.now(),
                    completedCount: 0,
                },
            ];
            expect(calculateStreak(history)).toBe(0);
        });

        it('should calculate single day streak', () => {
            const history: DailySession[] = [
                {
                    date: getTodayDateString(),
                    tasks: [{ id: '1', text: 'Task', completed: true, createdAt: Date.now() }],
                    startTime: Date.now(),
                    completedCount: 1,
                },
            ];
            expect(calculateStreak(history)).toBe(1);
        });
    });

    describe('calculateBestStreak', () => {
        it('should return 0 for empty history', () => {
            expect(calculateBestStreak([])).toBe(0);
        });

        it('should return 0 when no tasks completed', () => {
            const history: DailySession[] = [
                {
                    date: '2024-01-15',
                    tasks: [],
                    startTime: Date.now(),
                    completedCount: 0,
                },
            ];
            expect(calculateBestStreak(history)).toBe(0);
        });

        it('should calculate best streak correctly', () => {
            const history: DailySession[] = [
                {
                    date: '2024-01-13',
                    tasks: [{ id: '1', text: 'Task', completed: true, createdAt: Date.now() }],
                    startTime: Date.now(),
                    completedCount: 1,
                },
                {
                    date: '2024-01-14',
                    tasks: [{ id: '2', text: 'Task', completed: true, createdAt: Date.now() }],
                    startTime: Date.now(),
                    completedCount: 1,
                },
                {
                    date: '2024-01-15',
                    tasks: [{ id: '3', text: 'Task', completed: true, createdAt: Date.now() }],
                    startTime: Date.now(),
                    completedCount: 1,
                },
            ];
            expect(calculateBestStreak(history)).toBe(3);
        });
    });

    describe('calculateCompletionRate', () => {
        it('should return 0 for empty history', () => {
            expect(calculateCompletionRate([])).toBe(0);
        });

        it('should calculate completion rate correctly', () => {
            const history: DailySession[] = [
                {
                    date: '2024-01-15',
                    tasks: [
                        { id: '1', text: 'Task 1', completed: true, createdAt: Date.now() },
                        { id: '2', text: 'Task 2', completed: true, createdAt: Date.now() },
                        { id: '3', text: 'Task 3', completed: false, createdAt: Date.now() },
                    ],
                    startTime: Date.now(),
                    completedCount: 2,
                },
            ];
            // 2 out of 3 = 67%
            expect(calculateCompletionRate(history)).toBe(67);
        });

        it('should handle 100% completion', () => {
            const history: DailySession[] = [
                {
                    date: '2024-01-15',
                    tasks: [
                        { id: '1', text: 'Task 1', completed: true, createdAt: Date.now() },
                        { id: '2', text: 'Task 2', completed: true, createdAt: Date.now() },
                    ],
                    startTime: Date.now(),
                    completedCount: 2,
                },
            ];
            expect(calculateCompletionRate(history)).toBe(100);
        });
    });
});
