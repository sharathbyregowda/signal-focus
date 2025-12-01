import React, { useState } from 'react';
import './TaskInput.css';

interface TaskInputProps {
    onAddTask: (text: string) => void;
    currentTaskCount: number;
    maxTasks: number;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, currentTaskCount, maxTasks }) => {
    const [taskText, setTaskText] = useState('');
    const canAddMore = currentTaskCount < maxTasks;
    const needsMore = currentTaskCount < 3;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (taskText.trim() && canAddMore) {
            onAddTask(taskText.trim());
            setTaskText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="task-input-container">
            <form onSubmit={handleSubmit} className="task-input-form">
                <input
                    type="text"
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        needsMore
                            ? `Add mission-critical task ${currentTaskCount + 1}...`
                            : canAddMore
                                ? 'Add another task (optional)...'
                                : 'Maximum 5 tasks reached'
                    }
                    disabled={!canAddMore}
                    className="task-input"
                    maxLength={200}
                />
                <button
                    type="submit"
                    disabled={!taskText.trim() || !canAddMore}
                    className="task-input-btn"
                >
                    Add Task
                </button>
            </form>
            <div className="task-input-info">
                <span className={needsMore ? 'text-warning' : 'text-muted'}>
                    {currentTaskCount} of {maxTasks} tasks (maximum {maxTasks} allowed)
                </span>
            </div>
        </div>
    );
};
