import React from 'react';
import { useTimer } from '../hooks/useTimer';
import './CountdownTimer.css';

interface CountdownTimerProps {
    startTime: number;
    sleepTime?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ startTime, sleepTime }) => {
    const { remainingHours, remainingMinutes, percentageComplete, isExpired, timeStatus } = useTimer({
        startTime,
        sleepTime,
    });

    const getStatusColor = () => {
        switch (timeStatus) {
            case 'good':
                return 'var(--color-accent-success)';
            case 'warning':
                return 'var(--color-accent-warning)';
            case 'danger':
                return 'var(--color-accent-danger)';
            default:
                return 'var(--color-accent-primary)';
        }
    };

    const getStatusText = () => {
        if (isExpired) return 'Time to Rest';
        if (timeStatus === 'danger') return 'Bedtime Approaching!';
        if (timeStatus === 'warning') return 'Stay Focused';
        return 'On Track';
    };

    return (
        <div className="countdown-timer">
            <div className="timer-header">
                <h3 className="timer-title">Time Until Bedtime</h3>
                <span className={`timer-status status-${timeStatus}`}>{getStatusText()}</span>
            </div>

            <div className="timer-display">
                <div className="time-block">
                    <span className="time-value">{remainingHours.toString().padStart(2, '0')}</span>
                    <span className="time-label">Hours</span>
                </div>
                <span className="time-separator">:</span>
                <div className="time-block">
                    <span className="time-value">{remainingMinutes.toString().padStart(2, '0')}</span>
                    <span className="time-label">Minutes</span>
                </div>
            </div>

            <div className="progress-bar-container">
                <div
                    className="progress-bar"
                    style={{
                        width: `${percentageComplete}%`,
                        background: getStatusColor(),
                    }}
                />
            </div>

            <div className="timer-info">
                <span className="timer-info-text">
                    {isExpired ? 'Time to rest and recharge' : `${Math.round(100 - percentageComplete)}% of your waking hours remaining`}
                </span>
            </div>
        </div>
    );
};
