// src/pages/Unauthorized/Unauthorized.jsx
// ============================================================================
// 🚫 Unauthorized Access Page
// 
// Displays a clear authorization error message when users attempt to access
// pages they don't have permission for. Receives context via location state.
// ============================================================================

import { useLocation, useNavigate } from 'react-router-dom';
// react-bootstrap removed — using native HTML + Tailwind CSS
import { MdBlock, MdHome, MdArrowBack, MdSupport } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

// ============================================================================
// Role Display Configuration
// ============================================================================

const ROLE_LABELS = {
    admin: 'System Admin',
    companyAdmin: 'Company Admin',
    companyadmin: 'Company Admin',
    member: 'Member',
};

const SCOPE_LABELS = {
    platform: 'System Admin',
    tenant: 'Company Admin or Member',
    shared: 'Admin or Company Admin',
};

// ============================================================================
// Unauthorized Component
// ============================================================================

const Unauthorized = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Extract context from location state (passed by RoleGuard)
    const { userRole, requiredScope, redirectTo } = location.state || {};

    // Fallback values for direct access or missing state
    const displayRole = ROLE_LABELS[userRole] || ROLE_LABELS[user?.role] || 'Unknown';
    const displayRequired = SCOPE_LABELS[requiredScope] || 'Authorized Users';

    // Determine smart navigation based on user role
    const getHomePath = () => {
        const role = userRole || user?.role;
        switch (role?.toLowerCase()) {
            case 'admin':
                return '/app/subscription/plans';
            case 'companyadmin':
            case 'member':
                return '/app/dashboard';
            default:
                return '/login';
        }
    };

    const handleGoHome = () => {
        navigate(redirectTo || getHomePath());
    };

    const handleGoBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            handleGoHome();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] p-6">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg p-8 border border-[var(--light-border)] dark:border-[var(--dark-border)] max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-20 h-20 rounded-full bg-[var(--danger-color)]/10 dark:bg-[var(--danger-color)]/20 flex items-center justify-center mx-auto mb-6">
                    <MdBlock className="text-5xl text-[var(--danger-color)]" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-3">
                    403 - Unauthorized
                </h1>
                <p className="text-[var(--text-secondary)] mb-6">
                    You don't have permission to access this page or perform this action.
                </p>

                {/* Role Information */}
                <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-4 mb-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-[var(--text-secondary)]">Your Role:</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[var(--light-border)] dark:bg-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)]">
                            {displayRole}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-[var(--text-secondary)]">Required:</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[var(--primary-color)]/10 dark:bg-[var(--primary-color)]/20 text-[var(--primary-color)]">
                            {displayRequired}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center flex-wrap mb-6">
                    <button
                        type="button"
                        onClick={handleGoBack}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-medium border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                    >
                        <MdArrowBack size={18} />
                        Go Back
                    </button>
                    <button
                        type="button"
                        onClick={handleGoHome}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-medium bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors"
                    >
                        <MdHome size={18} />
                        Go to Home
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-sm text-[var(--text-secondary)]">
                    If you believe this is an error, please contact your administrator.
                </p>
            </div>
        </div>
    );
};

export default Unauthorized;
