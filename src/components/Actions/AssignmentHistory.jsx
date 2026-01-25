// src/components/Actions/AssignmentHistory.jsx
import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
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
            <div className={`text-muted text-center py-3 ${className}`}>
                <MdSchedule size={24} className="mb-2 d-block mx-auto" />
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
            <h6 className="mb-3 d-flex align-items-center">
                <MdSwapHoriz className="me-2" />
                Assignment History
            </h6>

            <ListGroup variant="flush" className="assignment-timeline">
                {sortedHistory.map((entry, index) => (
                    <ListGroup.Item
                        key={index}
                        className="px-0 py-2 border-start-0 border-end-0"
                    >
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex align-items-start">
                                <div className="timeline-icon me-3">
                                    {entry.auto ? (
                                        <MdAutorenew className="text-info" size={20} />
                                    ) : (
                                        <MdPerson className="text-primary" size={20} />
                                    )}
                                </div>

                                <div>
                                    <div className="mb-1">
                                        {entry.from ? (
                                            <>
                                                <span className="text-muted">
                                                    {entry.fromName || 'Previous assignee'}
                                                </span>
                                                <MdSwapHoriz className="mx-2 text-muted" />
                                            </>
                                        ) : (
                                            <span className="text-muted me-2">Assigned to</span>
                                        )}
                                        <strong>{entry.toName || entry.toTeam || 'User'}</strong>
                                    </div>

                                    {entry.note && (
                                        <small className="text-muted d-block">
                                            {entry.note}
                                        </small>
                                    )}

                                    <small className="text-muted">
                                        <MdSchedule className="me-1" size={12} />
                                        {formatDateTime(entry.at)}
                                    </small>
                                </div>
                            </div>

                            <Badge
                                bg={entry.auto ? 'info' : 'secondary'}
                                className="ms-2"
                                pill
                            >
                                {entry.auto ? 'Auto' : 'Manual'}
                            </Badge>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
};

export default AssignmentHistory;
