import React, { useState, useRef } from 'react';
import type { AppSettings, AppState } from '../types';
import './Settings.css';

interface SettingsProps {
    settings: AppSettings;
    onUpdateSettings: (settings: AppSettings) => void;
    appState: AppState;
    onImportData: (data: AppState) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings, appState, onImportData }) => {
    const [wakeTime, setWakeTime] = useState(settings.wakeTime);
    const [sleepTime, setSleepTime] = useState(settings.sleepTime || '22:00');
    const [hasChanges, setHasChanges] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleWakeTimeChange = (value: string) => {
        setWakeTime(value);
        setHasChanges(true);
    };

    const handleSleepTimeChange = (value: string) => {
        setSleepTime(value);
        setHasChanges(true);
    };

    const handleSave = () => {
        onUpdateSettings({
            ...settings,
            wakeTime,
            sleepTime,
        });
        setHasChanges(false);
    };

    const handleReset = () => {
        setWakeTime(settings.wakeTime);
        setSleepTime(settings.sleepTime || '22:00');
        setHasChanges(false);
    };

    // Export data as JSON file
    const handleExport = () => {
        const dataStr = JSON.stringify(appState, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `signal-focus-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Import data from JSON file
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const importedData = JSON.parse(content) as AppState;

                // Validate the imported data structure
                if (!importedData.settings || !Array.isArray(importedData.history)) {
                    throw new Error('Invalid data format');
                }

                onImportData(importedData);
                setImportSuccess(true);
                setImportError(null);

                // Reset success message after 3 seconds
                setTimeout(() => setImportSuccess(false), 3000);
            } catch (error) {
                setImportError('Invalid backup file. Please select a valid Signal vs. Noise backup file.');
                setImportSuccess(false);
            }
        };
        reader.readAsText(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    // Calculate awake hours
    const calculateAwakeHours = () => {
        const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
        const [sleepHour, sleepMin] = sleepTime.split(':').map(Number);

        const wakeMinutes = wakeHour * 60 + wakeMin;
        const sleepMinutes = sleepHour * 60 + sleepMin;

        let awakeMinutes = sleepMinutes - wakeMinutes;
        if (awakeMinutes < 0) {
            awakeMinutes += 24 * 60; // Add 24 hours if sleep time is next day
        }

        const hours = Math.floor(awakeMinutes / 60);
        const minutes = awakeMinutes % 60;

        return { hours, minutes };
    };

    const { hours, minutes } = calculateAwakeHours();

    return (
        <div className="settings">
            <h3 className="settings-title">Settings</h3>

            <div className="settings-section">
                <h4 className="settings-section-title">Sleep Schedule</h4>
                <p className="settings-section-description">
                    Set your daily sleep schedule. Your focus window will be calculated based on your waking hours.
                </p>

                <div className="settings-form">
                    <div className="settings-field">
                        <label htmlFor="wake-time" className="settings-label">
                            Wake Time
                        </label>
                        <input
                            type="time"
                            id="wake-time"
                            value={wakeTime}
                            onChange={(e) => handleWakeTimeChange(e.target.value)}
                            className="settings-input"
                        />
                        <span className="settings-hint">When do you typically wake up?</span>
                    </div>

                    <div className="settings-field">
                        <label htmlFor="sleep-time" className="settings-label">
                            Sleep Time
                        </label>
                        <input
                            type="time"
                            id="sleep-time"
                            value={sleepTime}
                            onChange={(e) => handleSleepTimeChange(e.target.value)}
                            className="settings-input"
                        />
                        <span className="settings-hint">When do you typically go to bed?</span>
                    </div>

                    <div className="settings-summary">
                        <div className="summary-card">
                            <div className="summary-icon">⏰</div>
                            <div className="summary-content">
                                <div className="summary-label">Awake Hours</div>
                                <div className="summary-value">
                                    {hours}h {minutes > 0 ? `${minutes}m` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    {hasChanges && (
                        <div className="settings-actions">
                            <button onClick={handleReset} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleSave} className="btn btn-primary">
                                Save Changes
                            </button>
                        </div>
                    )}

                    {!hasChanges && (
                        <div className="settings-saved">
                            <span className="saved-icon">✓</span>
                            Settings saved
                        </div>
                    )}
                </div>
            </div>

            <div className="settings-info">
                <div className="info-card">
                    <h5 className="info-title">💡 How it works</h5>
                    <p className="info-text">
                        Your countdown timer will show the time remaining until your bedtime,
                        helping you stay focused on completing your mission-critical tasks during your waking hours.
                    </p>
                </div>
            </div>

            <div className="settings-section">
                <h4 className="settings-section-title">Data Backup</h4>
                <p className="settings-section-description">
                    Export your data to backup all tasks, history, and settings. Import to restore on another device or browser.
                </p>

                <div className="settings-form">
                    <div className="backup-actions">
                        <button onClick={handleExport} className="btn btn-secondary">
                            📥 Export Data
                        </button>
                        <button onClick={handleImportClick} className="btn btn-secondary">
                            📤 Import Data
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {importError && (
                        <div className="import-error">
                            <span className="error-icon">⚠️</span>
                            {importError}
                        </div>
                    )}

                    {importSuccess && (
                        <div className="import-success">
                            <span className="success-icon">✓</span>
                            Data imported successfully!
                        </div>
                    )}

                    <div className="backup-info">
                        <p className="backup-hint">
                            💡 <strong>Tip:</strong> Export your data regularly to keep a backup.
                            You can import it on any device to restore your tasks and history.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
