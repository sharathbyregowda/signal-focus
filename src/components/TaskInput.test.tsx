import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskInput } from '../components/TaskInput';

describe('TaskInput Component', () => {
    const mockOnAddTask = vi.fn();

    beforeEach(() => {
        mockOnAddTask.mockClear();
    });

    it('should render input field and button', () => {
        render(<TaskInput onAddTask={mockOnAddTask} currentTaskCount={0} maxTasks={5} />);

        expect(screen.getByPlaceholderText(/Add mission-critical task 1/)).toBeInTheDocument();
        expect(screen.getByText('Add Task')).toBeInTheDocument();
    });

    it('should show task counter', () => {
        render(<TaskInput onAddTask={mockOnAddTask} currentTaskCount={2} maxTasks={5} />);

        expect(screen.getByText('2 of 5 tasks (maximum 5 allowed)')).toBeInTheDocument();
    });

    it('should add task when button clicked', () => {
        render(<TaskInput onAddTask={mockOnAddTask} currentTaskCount={0} maxTasks={5} />);

        const input = screen.getByPlaceholderText(/Add mission-critical task 1/);
        const button = screen.getByText('Add Task');

        fireEvent.change(input, { target: { value: 'Test task' } });
        fireEvent.click(button);

        expect(mockOnAddTask).toHaveBeenCalledWith('Test task');
    });

    it('should add task when Enter key pressed', () => {
        render(<TaskInput onAddTask={mockOnAddTask} currentTaskCount={0} maxTasks={5} />);

        const input = screen.getByPlaceholderText(/Add mission-critical task 1/);

        fireEvent.change(input, { target: { value: 'Test task' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(mockOnAddTask).toHaveBeenCalledWith('Test task');
    });

    it('should not add empty task', () => {
        render(<TaskInput onAddTask={mockOnAddTask} currentTaskCount={0} maxTasks={5} />);

        const button = screen.getByText('Add Task');
        fireEvent.click(button);

        expect(mockOnAddTask).not.toHaveBeenCalled();
    });

    it('should disable input when max tasks reached', () => {
        render(<TaskInput onAddTask={mockOnAddTask} currentTaskCount={5} maxTasks={5} />);

        const input = screen.getByPlaceholderText(/Maximum 5 tasks reached/);
        expect(input).toBeDisabled();
    });

    it('should show warning color when less than 3 tasks', () => {
        const { container } = render(
            <TaskInput onAddTask={mockOnAddTask} currentTaskCount={2} maxTasks={5} />
        );

        const counter = container.querySelector('.text-warning');
        expect(counter).toBeInTheDocument();
    });

    it('should show muted color when 3 or more tasks', () => {
        const { container } = render(
            <TaskInput onAddTask={mockOnAddTask} currentTaskCount={3} maxTasks={5} />
        );

        const counter = container.querySelector('.text-muted');
        expect(counter).toBeInTheDocument();
    });

    it('should clear input after adding task', () => {
        render(<TaskInput onAddTask={mockOnAddTask} currentTaskCount={0} maxTasks={5} />);

        const input = screen.getByPlaceholderText(/Add mission-critical task 1/) as HTMLInputElement;
        const button = screen.getByText('Add Task');

        fireEvent.change(input, { target: { value: 'Test task' } });
        fireEvent.click(button);

        expect(input.value).toBe('');
    });
});
