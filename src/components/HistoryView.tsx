import React from 'react';
import type { DailySession } from '../types';
import { formatDate } from '../utils/utils';
import './HistoryView.css';

interface HistoryViewProps {
    history: DailySession[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
    const [expandedDate, setExpandedDate] = React.useState<string | null>(null);

    if (history.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3 className="empty-state-title">No History Yet</h3>
                <p className="empty-state-text">
                    Complete your first day of tasks to see your history
                </p>
            </div>
        );
    }

    const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));

    const toggleExpand = (date: string) => {
        setExpandedDate(expandedDate === date ? null : date);
    };

    return (
        <div className="history-view">
            <h3 className="history-title">Task History</h3>
            <div className="history-list">
                {sortedHistory.map((session) => {
                    const isExpanded = expandedDate === session.date;
                    const completionRate = session.tasks.length > 0
                        ? Math.round((session.completedCount / session.tasks.length) * 100)
                        : 0;

                    return (
                        <div key={session.date} className="history-item">
                            <button
                                onClick={() => toggleExpand(session.date)}
                                className="history-item-header"
                            >
                                <div className="history-date">
                                    <span className="history-date-text">{formatDate(new Date(session.date).getTime())}</span>
                                    <span className="history-task-count">
                                        {session.completedCount} / {session.tasks.length} tasks
                                    </span>
                                </div>
                                <div className="history-stats">
                                    <div className="completion-badge" data-rate={completionRate >= 80 ? 'high' : completionRate >= 50 ? 'medium' : 'low'}>
                                        {completionRate}%
                                    </div>
                                    <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="history-item-details">
                                    <ul className="history-tasks">
                                        {session.tasks.map((task) => (
                                            <li key={task.id} className={`history-task ${task.completed ? 'completed' : ''}`}>
                                                <span className="history-task-icon">{task.completed ? '✓' : '○'}</span>
                                                <span className="history-task-text">{task.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {session.notes && (
                                        <div className="session-notes-display">
                                            <h4>📝 Notes</h4>
                                            <p>{session.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
