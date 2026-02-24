// src/pages/Surveys/components/ResponsibleUserDropdown.jsx
// ============================================================================
// Dropdown to assign a responsible user for a survey.
// Fetches eligible tenant members via GET /surveys/tenant-members.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { MdPerson, MdPersonAdd } from 'react-icons/md';
import axiosInstance from '../../../api/axiosInstance';

const ResponsibleUserDropdown = ({
    value,          // current responsibleUserId
    onChange,       // (userId) => void
    creatorId,      // fallback label: "Me (Creator)"
    disabled = false
}) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                setError(null);
                const { data } = await axiosInstance.get('/surveys/tenant-members');
                setMembers(data.members || []);
            } catch (err) {
                console.error('Error fetching tenant members:', err);
                setError('Failed to load team members');
                setMembers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    return (
        <div className="mb-3">
            <label className="flex items-center gap-1.5 font-semibold mb-1.5 text-sm">
                <MdPersonAdd size={16} />
                Responsible User
            </label>

            {error && (
                <p className="text-red-500 text-xs mb-1">{error}</p>
            )}

            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value || null)}
                disabled={disabled || loading}
                className="w-full px-3 py-2 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent disabled:opacity-50"
            >
                <option value="">
                    {loading ? 'Loading...' : 'Me (Creator - Default)'}
                </option>
                {members.map(member => (
                    <option key={member._id} value={member._id}>
                        {member.name || member.email}
                        {member._id === creatorId ? ' (You)' : ''}
                        {member.role === 'companyAdmin' ? ' — Admin' : ' — Member'}
                    </option>
                ))}
            </select>

            {value && members.length > 0 && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <MdPerson size={14} />
                    <span>
                        Assigned to: {members.find(m => m._id === value)?.name || 'Unknown'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ResponsibleUserDropdown;
