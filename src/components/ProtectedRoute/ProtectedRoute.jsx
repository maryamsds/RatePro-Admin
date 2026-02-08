// components/ProtectedRoute/ProtectedRoute.jsx
// ============================================================================
// Protected Route with Permission Enforcement
// 
// Check Order:
// 1. Auth check (is user logged in?)
// 2. Tenant association (does user belong to a tenant for tenant routes?)
// 3. Permission check (does user have required permission?)
// 4. Render children
// ============================================================================
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import FullScreenLoader from "../Loader/FullScreenLoader";

/**
 * ProtectedRoute - Guards routes with auth and permission checks
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.requiredPermission - Optional permission required (e.g., "survey:read")
 * @param {string[]} props.allowedRoles - Optional array of allowed roles (e.g., ["companyAdmin", "member"])
 * @param {boolean} props.requiresTenant - Whether route requires tenant association (default: false)
 */
const ProtectedRoute = ({
  children,
  requiredPermission,
  allowedRoles,
  requiresTenant = false
}) => {
  const { user, authLoading } = useAuth();
  const { hasPermission, isSystemAdmin, isCompanyAdmin, isMember, canAccessTenantFeatures } = usePermissions();
  const location = useLocation();

  // 1. Auth Loading State
  if (authLoading) {
    return <FullScreenLoader />;
  }

  // 2. Auth Check - User must be logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Tenant Association Check (for tenant-scoped routes)
  if (requiresTenant && !user.tenant) {
    console.warn(`[ProtectedRoute] User ${user.email} has no tenant for tenant-scoped route`);
    return <Navigate to="/unauthorized" state={{ reason: "No tenant association" }} replace />;
  }

  // 4. Role Check - If specific roles are required
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role;
    if (!allowedRoles.includes(userRole)) {
      console.warn(`[ProtectedRoute] Role ${userRole} not in allowed: ${allowedRoles.join(", ")}`);
      return <Navigate to="/unauthorized" state={{ reason: "Role not permitted" }} replace />;
    }
  }

  // 5. Permission Check - If specific permission is required
  if (requiredPermission) {
    // System Admin blocked from tenant features
    if (isSystemAdmin) {
      console.warn(`[ProtectedRoute] System Admin blocked from tenant permission: ${requiredPermission}`);
      return <Navigate to="/unauthorized" state={{ reason: "System Admin cannot access tenant features" }} replace />;
    }

    // CompanyAdmin has all tenant permissions
    if (isCompanyAdmin) {
      // Pass through - CompanyAdmin has full tenant access
    }
    // Members need explicit permission
    else if (isMember && !hasPermission(requiredPermission)) {
      console.warn(`[ProtectedRoute] Member lacks permission: ${requiredPermission}`);
      return <Navigate to="/unauthorized" state={{ reason: `Missing permission: ${requiredPermission}` }} replace />;
    }
  }

  // All checks passed - render children
  return children;
};

export default ProtectedRoute;

