import React, { useState } from 'react';
import type { Task } from '../types';
import './TaskList.css';

interface TaskListProps {
    tasks: Task[];
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
    onReorderTasks: (tasks: Task[]) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleTask, onDeleteTask, onReorderTasks }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedIndex === null) return;
        if (index === draggedIndex) return;

        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null) return;
        if (draggedIndex === dropIndex) return;

        const reorderedTasks = [...tasks];
        const [draggedTask] = reorderedTasks.splice(draggedIndex, 1);
        reorderedTasks.splice(dropIndex, 0, draggedTask);

        onReorderTasks(reorderedTasks);

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };
    if (tasks.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3 className="empty-state-title">No tasks yet</h3>
                <p className="empty-state-text">
                    Add 3-5 mission-critical tasks to focus on today
                </p>
                <div className="empty-state-philosophy">
                    <p className="philosophy-quote">
                        "Focus on the <strong>signal</strong> — the critical few tasks that move you forward.
                        Ruthlessly cut the <strong>noise</strong> — everything else that distracts."
                    </p>
                    <p className="philosophy-attribution">
                        Steve Jobs dedicated 80% of his energy to what truly mattered,
                        achieving remarkable results through relentless focus.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="task-list">
            {tasks.map((task, index) => (
                <div
                    key={task.id}
                    className={`task-item ${task.completed ? 'completed' : ''} ${draggedIndex === index ? 'dragging' : ''
                        } ${dragOverIndex === index ? 'drag-over' : ''} fade-in`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    draggable={!task.completed}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                >
                    <div className="drag-handle" title="Drag to reorder">
                        ⋮⋮
                    </div>
                    <div className="task-checkbox-container">
                        <input
                            type="checkbox"
                            id={`task-${task.id}`}
                            checked={task.completed}
                            onChange={() => onToggleTask(task.id)}
                            className="task-checkbox"
                        />
                        <label htmlFor={`task-${task.id}`} className="task-checkbox-label">
                            <span className="checkmark"></span>
                        </label>
                    </div>
                    <label htmlFor={`task-${task.id}`} className="task-text">
                        {task.text}
                    </label>
                    <button
                        onClick={() => onDeleteTask(task.id)}
                        className="task-delete-btn"
                        aria-label="Delete task"
                    >
                        ×
                    </button>

                    {/* Celebration animation when task is completed */}
                    {task.completed && (
                        <div className="task-celebration">
                            <span className="celebration-emoji">🎉</span>
                            <span className="celebration-emoji">✨</span>
                            <span className="celebration-emoji">🌟</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
