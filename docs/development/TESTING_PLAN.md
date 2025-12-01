# Comprehensive Testing Plan: Signal vs. Noise Application

## 🎯 Testing Philosophy

This application has **time-dependent features** that make testing challenging:
- 18-hour countdown timer
- Daily session reset at midnight
- Sleep schedule calculations
- Task completion tracking over time

**Key Testing Principle**: We need to test **time manipulation** without waiting hours/days!

---

## 📋 Testing Layers

### 1. **Unit Testing** (Functions & Logic)
### 2. **Integration Testing** (Component Interactions)
### 3. **End-to-End Testing** (User Flows)
### 4. **Time-Based Testing** (Critical for this app!)
### 5. **Edge Case Testing**
### 6. **Performance Testing**
### 7. **Accessibility Testing**
### 8. **Cross-Browser Testing**

---

## 🧪 Layer 1: Unit Testing

### What to Test: Individual Functions

#### A. **Time Utilities** (`src/utils/utils.ts`)

**Test Cases**:
```typescript
describe('getTodayDateString', () => {
  it('should return date in YYYY-MM-DD format', () => {
    const result = getTodayDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('formatDate', () => {
  it('should format timestamp correctly', () => {
    const timestamp = new Date('2024-01-15').getTime();
    const result = formatDate(timestamp);
    expect(result).toBe('January 15, 2024');
  });
});

describe('calculateStreak', () => {
  it('should return 0 for empty history', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('should calculate consecutive days correctly', () => {
    const history = [
      { date: '2024-01-15', completedCount: 3, tasks: [...] },
      { date: '2024-01-14', completedCount: 2, tasks: [...] },
      { date: '2024-01-13', completedCount: 1, tasks: [...] },
    ];
    expect(calculateStreak(history)).toBe(3);
  });

  it('should break streak on missing day', () => {
    const history = [
      { date: '2024-01-15', completedCount: 3, tasks: [...] },
      { date: '2024-01-13', completedCount: 2, tasks: [...] }, // Missing 01-14
    ];
    expect(calculateStreak(history)).toBe(1);
  });

  it('should ignore days with 0 completed tasks', () => {
    const history = [
      { date: '2024-01-15', completedCount: 0, tasks: [...] },
      { date: '2024-01-14', completedCount: 3, tasks: [...] },
    ];
    expect(calculateStreak(history)).toBe(0);
  });
});
```

#### B. **Timer Hook** (`src/hooks/useTimer.ts`)

**Challenge**: Testing time-based logic!

**Solution**: Mock `Date.now()` and control time

```typescript
describe('useTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should calculate remaining time correctly', () => {
    const startTime = new Date('2024-01-15T08:00:00').getTime();
    const sleepTime = '22:00'; // 10 PM
    
    // Mock current time as 10 AM (2 hours after start)
    jest.setSystemTime(new Date('2024-01-15T10:00:00'));
    
    const { result } = renderHook(() => useTimer({ startTime, sleepTime }));
    
    expect(result.current.remainingHours).toBe(12); // 12 hours until 10 PM
  });

  it('should handle sleep time on next day', () => {
    const startTime = new Date('2024-01-15T23:00:00').getTime();
    const sleepTime = '02:00'; // 2 AM next day
    
    const { result } = renderHook(() => useTimer({ startTime, sleepTime }));
    
    expect(result.current.remainingHours).toBe(3); // 3 hours until 2 AM
  });

  it('should update every minute', () => {
    const startTime = Date.now();
    const sleepTime = '22:00';
    
    const { result } = renderHook(() => useTimer({ startTime, sleepTime }));
    
    const initialMinutes = result.current.remainingMinutes;
    
    // Fast-forward 1 minute
    jest.advanceTimersByTime(60000);
    
    expect(result.current.remainingMinutes).toBe(initialMinutes - 1);
  });
});
```

---

## 🔗 Layer 2: Integration Testing

### What to Test: Component Interactions

#### A. **Task Management Flow**

```typescript
describe('Task Management Integration', () => {
  it('should add task and update counter', () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText(/Add mission-critical task/);
    const addButton = screen.getByText('Add Task');
    
    fireEvent.change(input, { target: { value: 'Test task' } });
    fireEvent.click(addButton);
    
    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.getByText('1 of 5 tasks (maximum 5 allowed)')).toBeInTheDocument();
  });

  it('should show timer after adding first task', () => {
    render(<App />);
    
    // No timer initially
    expect(screen.queryByText('Time Until Bedtime')).not.toBeInTheDocument();
    
    // Add task
    addTask('First task');
    
    // Timer should appear
    expect(screen.getByText('Time Until Bedtime')).toBeInTheDocument();
  });

  it('should hide timer when all tasks deleted', () => {
    render(<App />);
    
    addTask('Task 1');
    expect(screen.getByText('Time Until Bedtime')).toBeInTheDocument();
    
    const deleteButton = screen.getByLabelText('Delete task');
    fireEvent.click(deleteButton);
    
    expect(screen.queryByText('Time Until Bedtime')).not.toBeInTheDocument();
  });
});
```

#### B. **Settings Integration**

```typescript
describe('Settings Integration', () => {
  it('should update timer when sleep time changes', async () => {
    jest.useFakeTimers();
    const startTime = new Date('2024-01-15T08:00:00').getTime();
    jest.setSystemTime(startTime);
    
    render(<App />);
    
    // Add task to show timer
    addTask('Test task');
    
    // Go to settings
    fireEvent.click(screen.getByText('Settings'));
    
    // Change sleep time
    const sleepInput = screen.getByLabelText('Sleep Time');
    fireEvent.change(sleepInput, { target: { value: '23:00' } });
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Go back to Today tab
    fireEvent.click(screen.getByText('Today'));
    
    // Timer should reflect new sleep time (15 hours until 11 PM)
    await waitFor(() => {
      expect(screen.getByText(/15.*Hours/)).toBeInTheDocument();
    });
  });
});
```

---

## 🎭 Layer 3: End-to-End Testing

### What to Test: Complete User Journeys

#### A. **Daily Workflow Test**

```typescript
describe('Complete Daily Workflow', () => {
  it('should handle full day cycle', () => {
    // Day 1: Morning
    jest.setSystemTime(new Date('2024-01-15T08:00:00'));
    
    const { rerender } = render(<App />);
    
    // Add tasks
    addTask('Morning task 1');
    addTask('Morning task 2');
    addTask('Morning task 3');
    
    // Complete first task
    const checkbox1 = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox1);
    
    // Verify celebration appears
    expect(screen.getByText('🎉')).toBeInTheDocument();
    
    // Day 1: Evening - complete more tasks
    jest.setSystemTime(new Date('2024-01-15T20:00:00'));
    rerender(<App />);
    
    const checkbox2 = screen.getAllByRole('checkbox')[1];
    fireEvent.click(checkbox2);
    
    // Day 2: Next morning - session should reset
    jest.setSystemTime(new Date('2024-01-16T08:00:00'));
    rerender(<App />);
    
    // Previous session should be in history
    fireEvent.click(screen.getByText('History'));
    expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('2 / 3 tasks')).toBeInTheDocument();
    
    // Analytics should show streak
    fireEvent.click(screen.getByText('Analytics'));
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
  });
});
```

---

## ⏰ Layer 4: Time-Based Testing (CRITICAL!)

### Challenge: Testing Time-Dependent Features

#### Strategy 1: **Mock System Time**

```typescript
describe('Time-Based Features', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should reset session at midnight', () => {
    // Start at 11:59 PM
    jest.setSystemTime(new Date('2024-01-15T23:59:00'));
    
    const { rerender } = render(<App />);
    addTask('Late night task');
    
    // Fast-forward to 12:01 AM next day
    jest.setSystemTime(new Date('2024-01-16T00:01:00'));
    rerender(<App />);
    
    // Session should reset
    expect(screen.queryByText('Late night task')).not.toBeInTheDocument();
  });

  it('should show correct time status colors', () => {
    const startTime = new Date('2024-01-15T08:00:00').getTime();
    const sleepTime = '22:00'; // 14 hours total
    
    // Start: 0% elapsed - should be "good" (green)
    jest.setSystemTime(startTime);
    let { container } = render(<CountdownTimer startTime={startTime} sleepTime={sleepTime} />);
    expect(container.querySelector('.status-good')).toBeInTheDocument();
    
    // 60% elapsed - should be "warning" (yellow)
    jest.setSystemTime(startTime + (14 * 60 * 60 * 1000 * 0.6));
    container = render(<CountdownTimer startTime={startTime} sleepTime={sleepTime} />).container;
    expect(container.querySelector('.status-warning')).toBeInTheDocument();
    
    // 85% elapsed - should be "danger" (red)
    jest.setSystemTime(startTime + (14 * 60 * 60 * 1000 * 0.85));
    container = render(<CountdownTimer startTime={startTime} sleepTime={sleepTime} />).container;
    expect(container.querySelector('.status-danger')).toBeInTheDocument();
  });
});
```

#### Strategy 2: **Manual Time Manipulation in Browser**

For manual testing, create a **debug panel**:

```typescript
// Add to App.tsx in development mode
{process.env.NODE_ENV === 'development' && (
  <div className="debug-panel">
    <button onClick={() => {
      // Fast-forward 1 hour
      const newTime = Date.now() + (60 * 60 * 1000);
      // Update session start time
    }}>
      +1 Hour
    </button>
    <button onClick={() => {
      // Jump to next day
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // Trigger reset
    }}>
      Next Day
    </button>
  </div>
)}
```

---

## 🔍 Layer 5: Edge Case Testing

### Critical Edge Cases

#### A. **Boundary Conditions**

```typescript
describe('Edge Cases', () => {
  it('should handle exactly 3 tasks (minimum)', () => {
    render(<App />);
    addTask('Task 1');
    addTask('Task 2');
    addTask('Task 3');
    
    expect(screen.getByText('3 of 5 tasks')).toBeInTheDocument();
    expect(screen.queryByText(/minimum 3 required/)).not.toBeInTheDocument();
  });

  it('should handle exactly 5 tasks (maximum)', () => {
    render(<App />);
    for (let i = 1; i <= 5; i++) {
      addTask(`Task ${i}`);
    }
    
    const input = screen.getByPlaceholderText(/Maximum 5 tasks reached/);
    expect(input).toBeDisabled();
  });

  it('should handle sleep time = wake time (0 hours awake)', () => {
    // Edge case: user sets same wake and sleep time
    const startTime = Date.now();
    const sleepTime = new Date(startTime).toTimeString().slice(0, 5);
    
    const { container } = render(<CountdownTimer startTime={startTime} sleepTime={sleepTime} />);
    
    // Should show 24 hours (next day)
    expect(screen.getByText(/24.*Hours/)).toBeInTheDocument();
  });

  it('should handle task text with 200 characters (max length)', () => {
    const longText = 'a'.repeat(200);
    render(<App />);
    
    const input = screen.getByPlaceholderText(/Add mission-critical task/);
    fireEvent.change(input, { target: { value: longText } });
    fireEvent.click(screen.getByText('Add Task'));
    
    expect(screen.getByText(longText)).toBeInTheDocument();
  });
});
```

#### B. **LocalStorage Edge Cases**

```typescript
describe('LocalStorage Edge Cases', () => {
  it('should handle corrupted localStorage data', () => {
    localStorage.setItem('signal-focus-app', 'invalid json{{{');
    
    // Should not crash, should use default state
    expect(() => render(<App />)).not.toThrow();
  });

  it('should handle localStorage quota exceeded', () => {
    // Fill localStorage
    try {
      for (let i = 0; i < 10000; i++) {
        localStorage.setItem(`test-${i}`, 'x'.repeat(1000));
      }
    } catch (e) {
      // Quota exceeded
    }
    
    // App should still work
    render(<App />);
    addTask('Test task');
    
    // Should gracefully handle save failure
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });
});
```

---

## 🚀 Layer 6: Performance Testing

### What to Test: Speed & Efficiency

```typescript
describe('Performance', () => {
  it('should render large task list efficiently', () => {
    const startTime = performance.now();
    
    render(<TaskList tasks={generateTasks(100)} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100); // Should render in < 100ms
  });

  it('should not cause memory leaks with timer', () => {
    const { unmount } = render(<App />);
    addTask('Test');
    
    const initialMemory = (performance as any).memory?.usedJSHeapSize;
    
    // Unmount and remount multiple times
    for (let i = 0; i < 10; i++) {
      unmount();
      render(<App />);
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize;
    
    // Memory shouldn't grow significantly
    expect(finalMemory - initialMemory).toBeLessThan(1000000); // < 1MB
  });
});
```

---

## ♿ Layer 7: Accessibility Testing

### What to Test: A11y Compliance

```typescript
describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText(/Add mission-critical task/);
    input.focus();
    
    // Type task
    fireEvent.change(input, { target: { value: 'Keyboard task' } });
    
    // Press Enter to submit
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByText('Keyboard task')).toBeInTheDocument();
  });

  it('should have proper ARIA labels', () => {
    render(<App />);
    addTask('Test task');
    
    const deleteButton = screen.getByLabelText('Delete task');
    expect(deleteButton).toBeInTheDocument();
  });
});
```

---

## 🌐 Layer 8: Cross-Browser Testing

### Manual Testing Checklist

**Browsers to Test**:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

**Features to Verify**:
1. ✅ CSS animations work (celebration emojis)
2. ✅ LocalStorage persists
3. ✅ Time input fields work
4. ✅ Responsive design adapts
5. ✅ Emojis render correctly
6. ✅ Gradients display properly

---

## 📝 Testing Checklist Summary

### Before Each Release

#### Unit Tests
- [ ] All utility functions pass
- [ ] Timer calculations correct
- [ ] Streak calculations accurate

#### Integration Tests
- [ ] Task CRUD operations work
- [ ] Settings update timer
- [ ] History saves correctly

#### E2E Tests
- [ ] Complete daily workflow
- [ ] Multi-day scenarios
- [ ] Focus mode flow

#### Time-Based Tests
- [ ] Session resets at midnight
- [ ] Timer counts down correctly
- [ ] Sleep schedule calculations work

#### Edge Cases
- [ ] Min/max task limits
- [ ] Boundary times (midnight, etc.)
- [ ] Empty states
- [ ] LocalStorage failures

#### Performance
- [ ] No memory leaks
- [ ] Fast render times
- [ ] Smooth animations

#### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] ARIA labels present

#### Cross-Browser
- [ ] Works on all major browsers
- [ ] Mobile responsive
- [ ] Emojis render correctly

---

## 🛠️ Recommended Testing Tools

### Testing Framework
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
npm install --save-dev jest-environment-jsdom
```

### Time Mocking
```bash
npm install --save-dev @sinonjs/fake-timers
```

### Accessibility
```bash
npm install --save-dev jest-axe
```

### E2E Testing
```bash
npm install --save-dev playwright
# or
npm install --save-dev cypress
```

---

## 🎯 Priority Testing Order

### High Priority (Must Test)
1. ✅ Task CRUD operations
2. ✅ Timer countdown accuracy
3. ✅ Daily session reset
4. ✅ LocalStorage persistence
5. ✅ Settings integration

### Medium Priority (Should Test)
6. ✅ Streak calculations
7. ✅ Focus mode
8. ✅ History view
9. ✅ Analytics display
10. ✅ Responsive design

### Low Priority (Nice to Test)
11. ✅ Animation smoothness
12. ✅ Edge cases
13. ✅ Performance metrics
14. ✅ Cross-browser quirks

---

## 💡 Pro Testing Tips

### 1. **Use Test Data Builders**
```typescript
function createMockSession(overrides = {}) {
  return {
    date: '2024-01-15',
    tasks: [],
    startTime: Date.now(),
    completedCount: 0,
    ...overrides,
  };
}
```

### 2. **Create Custom Render Helpers**
```typescript
function renderWithProviders(ui, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => (
      <LocalStorageProvider>
        {children}
      </LocalStorageProvider>
    ),
    ...options,
  });
}
```

### 3. **Use Snapshot Testing for UI**
```typescript
it('should match snapshot', () => {
  const { container } = render(<TaskList tasks={mockTasks} />);
  expect(container).toMatchSnapshot();
});
```

---

## 🎓 Key Takeaways

1. **Mock time aggressively** - Don't wait for real time to pass
2. **Test edge cases** - Midnight, max/min values, empty states
3. **Verify persistence** - LocalStorage must survive refreshes
4. **Check time zones** - Ensure app works across time zones
5. **Test cleanup** - No memory leaks from intervals/timers
6. **Accessibility matters** - Keyboard nav and screen readers
7. **Mobile testing** - Touch interactions, smaller screens

---

This comprehensive testing plan ensures the Signal vs. Noise app is **robust, reliable, and production-ready**! 🚀
