import React, { useState } from 'react';
import type { Task } from '../types';
import './MorningBriefingModal.css';

interface MorningBriefingModalProps {
    incompleteTasks: Task[];
    onKeepTasks: (selectedTaskIds: string[]) => void;
    onStartFresh: () => void;
}

export const MorningBriefingModal: React.FC<MorningBriefingModalProps> = ({
    incompleteTasks,
    onKeepTasks,
    onStartFresh,
}) => {
    // All tasks checked by default
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
        new Set(incompleteTasks.map((t) => t.id))
    );

    const handleToggleTask = (taskId: string) => {
        const newSelected = new Set(selectedTaskIds);
        if (newSelected.has(taskId)) {
            newSelected.delete(taskId);
        } else {
            newSelected.add(taskId);
        }
        setSelectedTaskIds(newSelected);
    };

    const handleKeepSelected = () => {
        onKeepTasks(Array.from(selectedTaskIds));
    };

    return (
        <div className="morning-briefing-overlay">
            <div className="morning-briefing-container">
                <div className="morning-briefing-header">
                    <div className="morning-briefing-icon">☀️</div>
                    <h2 className="morning-briefing-title">Good Morning!</h2>
                    <p className="morning-briefing-subtitle">
                        You have {incompleteTasks.length} incomplete{' '}
                        {incompleteTasks.length === 1 ? 'task' : 'tasks'} from yesterday.
                        <br />
                        Which ones are still <strong>Signal</strong>?
                    </p>
                </div>

                <div className="morning-briefing-tasks">
                    {incompleteTasks.map((task) => (
                        <label key={task.id} className="morning-briefing-task-item">
                            <input
                                type="checkbox"
                                checked={selectedTaskIds.has(task.id)}
                                onChange={() => handleToggleTask(task.id)}
                                className="morning-briefing-checkbox"
                            />
                            <span className="morning-briefing-task-text">{task.text}</span>
                        </label>
                    ))}
                </div>

                <div className="morning-briefing-actions">
                    <button onClick={handleKeepSelected} className="btn btn-primary">
                        Keep Selected ({selectedTaskIds.size})
                    </button>
                    <button onClick={onStartFresh} className="btn btn-secondary">
                        Start Fresh
                    </button>
                </div>
            </div>
        </div>
    );
};
