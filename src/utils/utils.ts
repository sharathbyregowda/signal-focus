import type { DailySession } from '../types';

export function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatTime(hours: number, minutes: number): string {
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    return `${h}:${m}`;
}

export function getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function isSessionExpired(startTime: number, durationHours: number): boolean {
    const durationMs = durationHours * 60 * 60 * 1000;
    const endTime = startTime + durationMs;
    return Date.now() >= endTime;
}

export function shouldResetSession(currentSession: DailySession | null, todayDate: string): boolean {
    if (!currentSession) return false;
    return currentSession.date !== todayDate;
}

export function calculateStreak(history: DailySession[]): number {
    if (history.length === 0) return 0;

    // Sort by date descending
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));

    let streak = 0;
    let expectedDate = new Date();

    for (const session of sorted) {
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (session.date === expectedDateStr && session.completedCount > 0) {
            streak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

export function calculateBestStreak(history: DailySession[]): number {
    if (history.length === 0) return 0;

    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const session of sorted) {
        if (session.completedCount === 0) {
            currentStreak = 0;
            lastDate = null;
            continue;
        }

        const sessionDate = new Date(session.date);

        if (!lastDate) {
            currentStreak = 1;
        } else {
            const dayDiff = Math.floor((sessionDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
        }

        maxStreak = Math.max(maxStreak, currentStreak);
        lastDate = sessionDate;
    }

    return maxStreak;
}

export function calculateCompletionRate(history: DailySession[]): number {
    if (history.length === 0) return 0;

    const totalTasks = history.reduce((sum, session) => sum + session.tasks.length, 0);
    const completedTasks = history.reduce((sum, session) => sum + session.completedCount, 0);

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}
