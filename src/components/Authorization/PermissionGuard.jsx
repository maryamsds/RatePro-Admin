// components/Authorization/PermissionGuard.jsx
// ============================================================================
// Permission-based Route Guard Component
// 
// Protects routes based on user permissions (from customRoles).
// Used for Member role to check specific feature access.
// IMPORTANT: This is a SECOND LINE of defense. Backend must enforce too.
// ============================================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FullScreenLoader from '../Loader/FullScreenLoader';

/**
 * PermissionGuard - Protects routes based on user permissions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} [props.anyOf] - User needs at least ONE of these permissions
 * @param {string[]} [props.allOf] - User needs ALL of these permissions
 * @param {string} [props.redirectTo] - Where to redirect unauthorized users
 * @param {React.ReactNode} [props.fallback] - Optional fallback UI instead of redirect
 */
const PermissionGuard = ({
    children,
    anyOf = [],
    allOf = [],
    redirectTo = '/app/dashboard',
    fallback = null
}) => {
    const { user, authLoading, hasPermission } = useAuth();
    const location = useLocation();

    // Show loader while auth is being checked
    if (authLoading) {
        return <FullScreenLoader />;
    }

    // Not logged in - redirect to login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const userRole = user.role?.toLowerCase();

    // Admin and CompanyAdmin bypass permission checks (they have full access within their scope)
    if (userRole === 'admin' || userRole === 'companyadmin') {
        return children;
    }

    // For members, check permissions
    let hasAccess = true;

    // Check "anyOf" - user needs at least one permission
    if (anyOf.length > 0) {
        hasAccess = anyOf.some(perm => hasPermission(perm));
        if (!hasAccess) {
            console.warn(`[PermissionGuard] Access denied - needs one of: [${anyOf.join(', ')}]`);
        }
    }

    // Check "allOf" - user needs all permissions
    if (hasAccess && allOf.length > 0) {
        hasAccess = allOf.every(perm => hasPermission(perm));
        if (!hasAccess) {
            console.warn(`[PermissionGuard] Access denied - needs all of: [${allOf.join(', ')}]`);
        }
    }

    // No access
    if (!hasAccess) {
        // Return fallback if provided (for partial page hiding)
        if (fallback !== null) {
            return fallback;
        }
        // Otherwise redirect
        return <Navigate to={redirectTo} replace />;
    }

    // Authorized - render children
    return children;
};

// ============================================================================
// Pre-configured Permission Guards for common features
// ============================================================================

/**
 * Survey access guard - needs survey:read permission
 */
export const SurveyReadGuard = ({ children }) => (
    <PermissionGuard anyOf={['survey:read', 'survey:create', 'survey:update']}>
        {children}
    </PermissionGuard>
);

/**
 * Analytics access guard - needs analytics permissions
 */
export const AnalyticsGuard = ({ children }) => (
    <PermissionGuard anyOf={['analytics:view', 'dashboard:view']}>
        {children}
    </PermissionGuard>
);

/**
 * User management guard
 */
export const UserManagementGuard = ({ children }) => (
    <PermissionGuard anyOf={['user:read', 'user:create', 'user:update']}>
        {children}
    </PermissionGuard>
);

/**
 * Action management guard
 */
export const ActionGuard = ({ children }) => (
    <PermissionGuard anyOf={['action:read', 'action:create', 'action:update']}>
        {children}
    </PermissionGuard>
);

export default PermissionGuard;
