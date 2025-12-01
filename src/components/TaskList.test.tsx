import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskList } from '../components/TaskList';
import type { Task } from '../types';

describe('TaskList Component', () => {
    const mockOnToggleTask = vi.fn();
    const mockOnDeleteTask = vi.fn();
    const mockOnReorderTasks = vi.fn();

    const mockTasks: Task[] = [
        { id: '1', text: 'Task 1', completed: false, createdAt: Date.now() },
        { id: '2', text: 'Task 2', completed: true, createdAt: Date.now() },
        { id: '3', text: 'Task 3', completed: false, createdAt: Date.now() },
    ];

    beforeEach(() => {
        mockOnToggleTask.mockClear();
        mockOnDeleteTask.mockClear();
        mockOnReorderTasks.mockClear();
    });

    it('should show empty state when no tasks', () => {
        render(<TaskList tasks={[]} onToggleTask={mockOnToggleTask} onDeleteTask={mockOnDeleteTask} onReorderTasks={mockOnReorderTasks} />);

        expect(screen.getByText('No tasks yet')).toBeInTheDocument();
        expect(screen.getByText(/Add 3-5 mission-critical tasks/)).toBeInTheDocument();
    });

    it('should show philosophy quote in empty state', () => {
        render(<TaskList tasks={[]} onToggleTask={mockOnToggleTask} onDeleteTask={mockOnDeleteTask} onReorderTasks={mockOnReorderTasks} />);

        expect(screen.getByText(/Focus on the/)).toBeInTheDocument();
        expect(screen.getByText(/Steve Jobs dedicated 80%/)).toBeInTheDocument();
    });

    it('should render all tasks', () => {
        render(<TaskList tasks={mockTasks} onToggleTask={mockOnToggleTask} onDeleteTask={mockOnDeleteTask} onReorderTasks={mockOnReorderTasks} />);

        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getByText('Task 3')).toBeInTheDocument();
    });

    it('should show checkboxes for all tasks', () => {
        render(<TaskList tasks={mockTasks} onToggleTask={mockOnToggleTask} onDeleteTask={mockOnDeleteTask} onReorderTasks={mockOnReorderTasks} />);

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(3);
    });

    it('should show completed task as checked', () => {
        render(<TaskList tasks={mockTasks} onToggleTask={mockOnToggleTask} onDeleteTask={mockOnDeleteTask} onReorderTasks={mockOnReorderTasks} />);

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).not.toBeChecked(); // Task 1
        expect(checkboxes[1]).toBeChecked();     // Task 2 (completed)
        expect(checkboxes[2]).not.toBeChecked(); // Task 3
    });

    it('should call onToggleTask when checkbox clicked', () => {
        render(<TaskList tasks={mockTasks} onToggleTask={mockOnToggleTask} onDeleteTask={mockOnDeleteTask} onReorderTasks={mockOnReorderTasks} />);

        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);

        expect(mockOnToggleTask).toHaveBeenCalledWith('1');
    });

    it('should call onDeleteTask when delete button clicked', () => {
        render(<TaskList tasks={mockTasks} onToggleTask={mockOnToggleTask} onDeleteTask={mockOnDeleteTask} onReorderTasks={mockOnReorderTasks} />);

        const deleteButtons = screen.getAllByLabelText('Delete task');
        fireEvent.click(deleteButtons[0]);

        expect(mockOnDeleteTask).toHaveBeenCalledWith('1');
    });

    it('should show celebration emojis for completed tasks', () => {
        render(<TaskList tasks={mockTasks} onToggleTask={mockOnToggleTask} onDeleteTask={mockOnDeleteTask} onReorderTasks={mockOnReorderTasks} />);

        // Task 2 is completed, should show celebration
        const celebrations = screen.getAllByText('🎉');
        expect(celebrations.length).toBeGreaterThan(0);
    });

    it('should apply completed class to completed tasks', () => {
        const { container } = render(
            <TaskList tasks={mockTasks} onToggleTask={mockOnToggleTask} onDeleteTask={mockOnDeleteTask} onReorderTasks={mockOnReorderTasks} />
        );

        const taskItems = container.querySelectorAll('.task-item');
        expect(taskItems[1]).toHaveClass('completed'); // Task 2
    });
});
