// src/components/Actions/AssignmentHistory.jsx
import React from 'react';
// react-bootstrap removed — using native HTML + Tailwind CSS
import { MdPerson, MdSwapHoriz, MdSchedule, MdAutorenew } from 'react-icons/md';

/**
 * Format date to readable string
 */
const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * AssignmentHistory Component
 * 
 * Displays a timeline of assignment changes for an action.
 * Shows who assigned to whom, when, and if it was auto/manual.
 */
const AssignmentHistory = ({ history = [], className = '' }) => {
    if (!history || history.length === 0) {
        return (
            <div className={`text-[var(--text-muted)] text-center py-3 ${className}`}>
                <MdSchedule size={24} className="mb-2 block mx-auto" />
                <small>No assignment history</small>
            </div>
        );
    }

    // Sort by date descending (most recent first)
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.at) - new Date(a.at)
    );

    return (
        <div className={className}>
            <h6 className="mb-3 flex items-center">
                <MdSwapHoriz className="mr-2" />
                Assignment History
            </h6>

            <div className="assignment-timeline">
                {sortedHistory.map((entry, index) => (
                    <div
                        key={index}
                        className="px-0 py-2 border-b border-[var(--border-color)] last:border-b-0"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-start">
                                <div className="mr-3">
                                    {entry.auto ? (
                                        <MdAutorenew className="text-cyan-500" size={20} />
                                    ) : (
                                        <MdPerson className="text-blue-600" size={20} />
                                    )}
                                </div>

                                <div>
                                    <div className="mb-1">
                                        {entry.from ? (
                                            <>
                                                <span className="text-[var(--text-muted)]">
                                                    {entry.fromName || 'Previous assignee'}
                                                </span>
                                                <MdSwapHoriz className="mx-2 text-[var(--text-muted)] inline" />
                                            </>
                                        ) : (
                                            <span className="text-[var(--text-muted)] mr-2">Assigned to</span>
                                        )}
                                        <strong>{entry.toName || entry.toTeam || 'User'}</strong>
                                    </div>

                                    {entry.note && (
                                        <small className="text-[var(--text-muted)] block">
                                            {entry.note}
                                        </small>
                                    )}

                                    <small className="text-[var(--text-muted)]">
                                        <MdSchedule className="mr-1 inline" size={12} />
                                        {formatDateTime(entry.at)}
                                    </small>
                                </div>
                            </div>

                            <span
                                className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.auto
                                        ? 'bg-cyan-100 text-cyan-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {entry.auto ? 'Auto' : 'Manual'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssignmentHistory;
