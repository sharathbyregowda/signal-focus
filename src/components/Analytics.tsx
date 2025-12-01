import React from 'react';
import type { DailySession } from '../types';
import { calculateStreak, calculateBestStreak, calculateCompletionRate } from '../utils/utils';
import './Analytics.css';

interface AnalyticsProps {
    history: DailySession[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ history }) => {
    const currentStreak = calculateStreak(history);
    const bestStreak = calculateBestStreak(history);
    const completionRate = calculateCompletionRate(history);

    const totalDays = history.length;
    const totalTasks = history.reduce((sum, session) => sum + session.tasks.length, 0);
    const completedTasks = history.reduce((sum, session) => sum + session.completedCount, 0);

    const stats = [
        {
            label: 'Current Streak',
            value: currentStreak,
            suffix: currentStreak === 1 ? 'day' : 'days',
            icon: '🔥',
            color: 'warning',
        },
        {
            label: 'Best Streak',
            value: bestStreak,
            suffix: bestStreak === 1 ? 'day' : 'days',
            icon: '🏆',
            color: 'success',
        },
        {
            label: 'Completion Rate',
            value: completionRate,
            suffix: '%',
            icon: '📈',
            color: 'primary',
        },
        {
            label: 'Total Days',
            value: totalDays,
            suffix: totalDays === 1 ? 'day' : 'days',
            icon: '📅',
            color: 'secondary',
        },
    ];

    return (
        <div className="analytics">
            <h3 className="analytics-title">Your Progress</h3>
            <div className="analytics-grid">
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className={`analytics-card color-${stat.color}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="analytics-icon">{stat.icon}</div>
                        <div className="analytics-content">
                            <div className="analytics-value">
                                {stat.value}
                                <span className="analytics-suffix">{stat.suffix}</span>
                            </div>
                            <div className="analytics-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {totalTasks > 0 && (
                <div className="analytics-summary">
                    <p className="analytics-summary-text">
                        You've completed <strong>{completedTasks}</strong> out of <strong>{totalTasks}</strong> total tasks
                        across <strong>{totalDays}</strong> {totalDays === 1 ? 'day' : 'days'}.
                        {currentStreak > 0 && (
                            <> Keep up your <strong>{currentStreak}-day streak</strong>!</>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
};
