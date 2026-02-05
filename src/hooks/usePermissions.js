// hooks/usePermissions.js
// ============================================================================
// Permission Hook for Role-Based UI Control
// 
// Mirrors backend enforceTenantScope logic:
// - System Admin BLOCKED from tenant features
// - Company Admin has full tenant-level permissions
// - Members require explicit permission assignments
// ============================================================================

import { useAuth } from "../context/AuthContext";

/**
 * Production-ready permission hook for frontend authorization
 * 
 * @returns {Object} Permission utilities
 * - isSystemAdmin: true if user is System Admin (blocked from tenant features)
 * - isCompanyAdmin: true if user is Company Admin (full tenant access)
 * - hasPermission: function to check specific permissions
 * - canAccessTenantFeatures: true if user can access tenant-scoped features
 */
export const usePermissions = () => {
    const { user } = useAuth();

    const isSystemAdmin = user?.role === "admin";
    const isCompanyAdmin = user?.role === "companyAdmin";
    const isMember = user?.role === "member";

    /**
     * Check if user has a specific permission
     * 
     * @param {string} permName - Permission name (e.g., "surveyAction:assign")
     * @returns {boolean}
     */
    const hasPermission = (permName) => {
        // System Admin should NOT access tenant features
        if (isSystemAdmin) return false;

        // Company Admin has full tenant-level permissions
        if (isCompanyAdmin) return true;

        // Members need explicit permission
        return user?.permissions?.includes(permName) || false;
    };

    /**
     * Check if user can access tenant-scoped features
     * System Admin is BLOCKED from tenant features
     */
    const canAccessTenantFeatures = !isSystemAdmin;

    /**
     * Check if user can assign actions for a specific survey
     * 
     * @param {Object} action - Action object with survey metadata
     * @returns {boolean}
     */
    const canAssignAction = (action) => {
        // System Admin blocked
        if (isSystemAdmin) return false;

        // Company Admin can assign all
        if (isCompanyAdmin) return true;

        // Members need permission AND must be actionManager for the survey
        if (!hasPermission("surveyAction:assign")) return false;

        // Check if user is actionManager for this survey
        const surveyActionManager = action?.survey?.actionManager || action?.metadata?.actionManager;
        if (!surveyActionManager) return false;

        return surveyActionManager.toString() === user?._id?.toString();
    };

    return {
        isSystemAdmin,
        isCompanyAdmin,
        isMember,
        hasPermission,
        canAccessTenantFeatures,
        canAssignAction,
        user,
    };
};

export default usePermissions;
