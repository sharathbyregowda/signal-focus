import { useState, useEffect } from 'react';
import './SessionNotes.css';

interface SessionNotesProps {
    notes: string;
    onNotesChange: (notes: string) => void;
    lastSaved?: number;
}

const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 5000) return 'just now';
    if (diff < 60000) return 'a few seconds ago';

    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `at ${displayHours}:${displayMinutes} ${ampm}`;
};

export const SessionNotes: React.FC<SessionNotesProps> = ({
    notes,
    onNotesChange,
    lastSaved
}) => {
    const [localNotes, setLocalNotes] = useState(notes);
    const [isSaving, setIsSaving] = useState(false);

    // Sync with parent when notes prop changes
    useEffect(() => {
        setLocalNotes(notes);
    }, [notes]);

    // Debounced auto-save (500ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localNotes !== notes) {
                setIsSaving(true);
                onNotesChange(localNotes);
                setTimeout(() => setIsSaving(false), 300);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [localNotes, notes, onNotesChange]);

    return (
        <div className="session-notes">
            <label htmlFor="session-notes-input">
                📝 Session Notes (Optional)
            </label>
            <textarea
                id="session-notes-input"
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                placeholder="How did today go? Any reflections, wins, or challenges?"
                rows={4}
            />
            <div className="notes-meta">
                {isSaving && <span className="saving">Saving...</span>}
                {!isSaving && lastSaved && (
                    <span className="saved">
                        Saved {formatTimestamp(lastSaved)}
                    </span>
                )}
            </div>
        </div>
    );
};
