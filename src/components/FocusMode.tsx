import React, { useState } from 'react';
import type { Task } from '../types';
import './FocusMode.css';

interface FocusModeProps {
    tasks: Task[];
    onToggleTask: (taskId: string) => void;
    onClose: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ tasks, onToggleTask, onClose }) => {
    const incompleteTasks = tasks.filter((t) => !t.completed);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (incompleteTasks.length === 0) {
        return (
            <div className="focus-mode-overlay">
                <div className="focus-mode-container">
                    <button onClick={onClose} className="focus-close-btn">
                        ✕
                    </button>
                    <div className="focus-empty">
                        <div className="focus-empty-icon">🎉</div>
                        <h2 className="focus-empty-title">All Tasks Complete!</h2>
                        <p className="focus-empty-text">You've completed all your mission-critical tasks.</p>
                        <button onClick={onClose} className="btn btn-primary">
                            Exit Focus Mode
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentTask = incompleteTasks[currentIndex];

    const handleNext = () => {
        if (currentIndex < incompleteTasks.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleComplete = () => {
        onToggleTask(currentTask.id);
        if (currentIndex === incompleteTasks.length - 1 && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className="focus-mode-overlay">
            <div className="focus-mode-container">
                <button onClick={onClose} className="focus-close-btn" aria-label="Exit focus mode">
                    ✕
                </button>

                <div className="focus-header">
                    <h2 className="focus-title">Focus Mode</h2>
                    <div className="focus-progress">
                        Task {currentIndex + 1} of {incompleteTasks.length}
                    </div>
                </div>

                <div className="focus-task">
                    <p className="focus-task-text">{currentTask.text}</p>
                </div>

                <div className="focus-actions">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="btn btn-secondary"
                    >
                        ← Previous
                    </button>
                    <button onClick={handleComplete} className="btn btn-primary focus-complete-btn">
                        ✓ Complete
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === incompleteTasks.length - 1}
                        className="btn btn-secondary"
                    >
                        Next →
                    </button>
                </div>

                <div className="focus-dots">
                    {incompleteTasks.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`focus-dot ${index === currentIndex ? 'active' : ''}`}
                            aria-label={`Go to task ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
