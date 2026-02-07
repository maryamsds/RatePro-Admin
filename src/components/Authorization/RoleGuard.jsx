// components/Authorization/RoleGuard.jsx
// ============================================================================
// Role-based Route Guard Component
// 
// Protects routes based on user roles.
// IMPORTANT: This is a SECOND LINE of defense. Backend must enforce too.
// ============================================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FullScreenLoader from '../Loader/FullScreenLoader';

/**
 * RoleGuard - Protects routes based on user roles
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Roles that can access this route
 * @param {string[]} [props.deniedRoles] - Roles explicitly blocked (takes precedence)
 * @param {string} [props.redirectTo] - Where to redirect unauthorized users
 * @param {string} [props.scope] - 'platform' | 'tenant' | 'shared' for semantic clarity
 */
const RoleGuard = ({
    children,
    allowedRoles = [],
    deniedRoles = [],
    redirectTo,
    scope = 'shared'
}) => {
    const { user, authLoading } = useAuth();
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

    // Check denied roles first (takes precedence)
    if (deniedRoles.length > 0) {
        const isDenied = deniedRoles.map(r => r.toLowerCase()).includes(userRole);
        if (isDenied) {
            console.warn(`[RoleGuard] Access denied for role '${userRole}' - explicitly blocked`);
            return (
                <Navigate
                    to="/unauthorized"
                    replace
                    state={{
                        userRole: userRole ?? 'Unknown',
                        requiredScope: scope ?? 'Restricted',
                        redirectTo: getRedirectPath(userRole, redirectTo, scope),
                    }}
                />
            );
        }
    }

    // Check allowed roles
    if (allowedRoles.length > 0) {
        const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(userRole);
        if (!isAllowed) {
            console.warn(`[RoleGuard] Access denied for role '${userRole}' - not in allowed list: [${allowedRoles.join(', ')}]`);
            return (
                <Navigate
                    to="/unauthorized"
                    replace
                    state={{
                        userRole: userRole ?? 'Unknown',
                        requiredScope: scope ?? 'Restricted',
                        redirectTo: getRedirectPath(userRole, redirectTo, scope),
                    }}
                />
            );
        }
    }

    // Authorized - render children
    return children;
};

/**
 * Determine redirect path based on user role and scope
 */
function getRedirectPath(role, customRedirect, scope) {
    if (customRedirect) return customRedirect;

    // Smart redirect based on role
    switch (role) {
        case 'admin':
            // Admin trying to access tenant routes → go to admin dashboard
            return '/app/subscription/plans';
        case 'companyadmin':
        case 'member':
            // Tenant user trying to access platform routes → go to tenant dashboard
            return '/app/dashboard';
        default:
            return '/app/dashboard';
    }
}

// ============================================================================
// Pre-configured Guards for common patterns
// ============================================================================

/**
 * Platform-only guard - Only System Admin can access
 * Blocks: companyAdmin, member
 */
export const PlatformGuard = ({ children }) => (
    <RoleGuard
        allowedRoles={['admin']}
        scope="platform"
        redirectTo="/app/dashboard"
    >
        {children}
    </RoleGuard>
);

/**
 * Tenant-only guard - Only Company Admin and Member can access
 * Blocks: admin (System Admin should not access tenant data)
 */
export const TenantGuard = ({ children }) => (
    <RoleGuard
        deniedRoles={['admin']}
        allowedRoles={['companyAdmin', 'member']}
        scope="tenant"
        redirectTo="/app/subscription/plans"
    >
        {children}
    </RoleGuard>
);

/**
 * CompanyAdmin-only guard - Only Company Admin can access
 * Blocks: admin, member
 */
export const CompanyAdminGuard = ({ children }) => (
    <RoleGuard
        allowedRoles={['companyAdmin']}
        deniedRoles={['admin']}
        scope="tenant"
    >
        {children}
    </RoleGuard>
);

/**
 * Shared guard - Both Admin and CompanyAdmin can access
 * Different responsibilities per role (handled at component level)
 */
export const SharedGuard = ({ children }) => (
    <RoleGuard
        allowedRoles={['admin', 'companyAdmin']}
        scope="shared"
    >
        {children}
    </RoleGuard>
);

export default RoleGuard;
