import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimer } from '../hooks/useTimer';

describe('useTimer Hook', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should calculate remaining time correctly with sleep time', () => {
        const startTime = new Date('2024-01-15T08:00:00').getTime();
        const sleepTime = '22:00'; // 10 PM

        // Set current time to 10 AM (2 hours after start)
        vi.setSystemTime(new Date('2024-01-15T10:00:00'));

        const { result } = renderHook(() => useTimer({ startTime, sleepTime }));

        // Should have 12 hours remaining until 10 PM
        expect(result.current.remainingHours).toBe(12);
        expect(result.current.isExpired).toBe(false);
    });

    it('should handle sleep time on next day', () => {
        const startTime = new Date('2024-01-15T23:00:00').getTime();
        const sleepTime = '02:00'; // 2 AM next day

        vi.setSystemTime(new Date('2024-01-15T23:00:00'));

        const { result } = renderHook(() => useTimer({ startTime, sleepTime }));

        // Should have 3 hours remaining until 2 AM next day
        expect(result.current.remainingHours).toBe(3);
    });

    it('should fallback to 18 hours when no sleep time provided', () => {
        const startTime = new Date('2024-01-15T08:00:00').getTime();

        vi.setSystemTime(new Date('2024-01-15T10:00:00'));

        const { result } = renderHook(() => useTimer({ startTime }));

        // Should have 16 hours remaining (18 - 2 elapsed)
        expect(result.current.remainingHours).toBe(16);
    });

    it('should mark as expired when time is up', () => {
        const startTime = new Date('2024-01-15T08:00:00').getTime();
        const sleepTime = '22:00';

        // Set time to after sleep time
        vi.setSystemTime(new Date('2024-01-15T23:00:00'));

        const { result } = renderHook(() => useTimer({ startTime, sleepTime }));

        expect(result.current.isExpired).toBe(true);
        expect(result.current.remainingHours).toBe(0);
        expect(result.current.remainingMinutes).toBe(0);
    });

    it('should calculate percentage complete correctly', () => {
        const startTime = new Date('2024-01-15T08:00:00').getTime();
        const sleepTime = '22:00'; // 14 hours total

        // Set time to 50% through (8 AM + 7 hours = 3 PM)
        vi.setSystemTime(new Date('2024-01-15T15:00:00'));

        const { result } = renderHook(() => useTimer({ startTime, sleepTime }));

        expect(result.current.percentageComplete).toBeCloseTo(50, 0);
    });

    it('should return correct time status based on percentage', () => {
        const startTime = new Date('2024-01-15T08:00:00').getTime();
        const sleepTime = '22:00';

        // At start (0%) - should be "good"
        vi.setSystemTime(new Date('2024-01-15T08:00:00'));
        let { result } = renderHook(() => useTimer({ startTime, sleepTime }));
        expect(result.current.timeStatus).toBe('good');

        // At 65% - should be "warning"
        vi.setSystemTime(new Date('2024-01-15T17:06:00'));
        result = renderHook(() => useTimer({ startTime, sleepTime })).result;
        expect(result.current.timeStatus).toBe('warning');

        // At 85% - should be "danger"
        vi.setSystemTime(new Date('2024-01-15T19:54:00'));
        result = renderHook(() => useTimer({ startTime, sleepTime })).result;
        expect(result.current.timeStatus).toBe('danger');
    });

    it('should update when sleepTime changes', () => {
        const startTime = new Date('2024-01-15T08:00:00').getTime();
        vi.setSystemTime(new Date('2024-01-15T10:00:00'));

        const { result, rerender } = renderHook(
            ({ sleepTime }) => useTimer({ startTime, sleepTime }),
            { initialProps: { sleepTime: '22:00' } }
        );

        expect(result.current.remainingHours).toBe(12);

        // Change sleep time to 11 PM
        rerender({ sleepTime: '23:00' });

        // Should now have 13 hours remaining
        expect(result.current.remainingHours).toBe(13);
    });
});
