// components/Authorization/index.js
// Re-export all authorization components for easy importing

export { default as RoleGuard, PlatformGuard, TenantGuard, CompanyAdminGuard, SharedGuard } from './RoleGuard';
export { default as PermissionGuard, SurveyReadGuard, AnalyticsGuard, UserManagementGuard, ActionGuard } from './PermissionGuard';
