import { useState, useEffect } from 'react';

interface UseTimerResult {
    remainingMs: number;
    remainingHours: number;
    remainingMinutes: number;
    percentageComplete: number;
    isExpired: boolean;
    timeStatus: 'good' | 'warning' | 'danger';
}

interface UseTimerProps {
    startTime: number;
    sleepTime?: string; // HH:MM format
}

export function useTimer({ startTime, sleepTime }: UseTimerProps): UseTimerResult {
    const [now, setNow] = useState(Date.now());
    const [endTime, setEndTime] = useState<number>(() => {
        // Initial calculation
        if (sleepTime) {
            const [sleepHour, sleepMin] = sleepTime.split(':').map(Number);
            const startDate = new Date(startTime);
            const endDate = new Date(startDate);
            endDate.setHours(sleepHour, sleepMin, 0, 0);

            if (endDate.getTime() <= startTime) {
                endDate.setDate(endDate.getDate() + 1);
            }

            return endDate.getTime();
        } else {
            return startTime + (18 * 60 * 60 * 1000);
        }
    });

    // Recalculate endTime when sleepTime changes
    useEffect(() => {
        if (sleepTime) {
            const [sleepHour, sleepMin] = sleepTime.split(':').map(Number);
            const startDate = new Date(startTime);
            const endDate = new Date(startDate);
            endDate.setHours(sleepHour, sleepMin, 0, 0);

            if (endDate.getTime() <= startTime) {
                endDate.setDate(endDate.getDate() + 1);
            }

            setEndTime(endDate.getTime());
        } else {
            setEndTime(startTime + (18 * 60 * 60 * 1000));
        }
    }, [sleepTime, startTime]);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const remainingMs = Math.max(0, endTime - now);
    const elapsedMs = now - startTime;
    const totalDuration = endTime - startTime;

    const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
    const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

    const percentageComplete = Math.min(100, (elapsedMs / totalDuration) * 100);
    const isExpired = remainingMs === 0;

    // Determine time status based on remaining percentage
    let timeStatus: 'good' | 'warning' | 'danger' = 'good';
    if (percentageComplete >= 80) {
        timeStatus = 'danger';
    } else if (percentageComplete >= 60) {
        timeStatus = 'warning';
    }

    return {
        remainingMs,
        remainingHours,
        remainingMinutes,
        percentageComplete,
        isExpired,
        timeStatus,
    };
}
