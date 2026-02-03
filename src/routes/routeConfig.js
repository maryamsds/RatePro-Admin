// routes/routeConfig.js
// ============================================================================
// Centralized Route Configuration for Multi-Tenant SaaS Application
// 
// Defines all routes with strict role-based authorization requirements.
// This file serves as the single source of truth for route access control.
// 
// Roles:
// - Admin: Platform/System Admin - Manages the entire SaaS platform
// - CompanyAdmin: Tenant-level Admin - Manages their company/tenant
// ============================================================================

/**
 * Route Scopes:
 * - PLATFORM: System Admin only (platform settings, subscription management)
 * - TENANT: Company Admin only (company-level management)
 * - SHARED: Both roles with different responsibilities
 */
export const ROUTE_SCOPES = {
    PLATFORM: 'platform',
    TENANT: 'tenant',
    SHARED: 'shared',
};

/**
 * Route Categories with Strict Authorization Requirements
 * 
 * Each route explicitly defines:
 * - allowedRoles: Roles that can access this route
 * - scope: platform | tenant | shared
 * - intent: What each allowed role can do on that route
 */
export const ROUTE_CONFIG = {
    // ============================================================================
    // 🔴 PLATFORM LAYER - Admin Only (System/Platform Level)
    // ============================================================================
    platform: {
        scope: ROUTE_SCOPES.PLATFORM,
        allowedRoles: ['admin'],
        deniedRoles: ['companyAdmin'],
        routes: [
            // Platform Dashboard
            {
                path: 'platform',
                name: 'Platform Dashboard',
                allowedRoles: ['admin'],
                scope: 'platform',
                intent: {
                    admin: 'View and manage platform-wide metrics and operations'
                }
            },

            // Global Settings
            {
                path: 'settings',
                name: 'Global Settings',
                allowedRoles: ['admin'],
                scope: 'platform',
                intent: {
                    admin: 'Manage global application settings'
                }
            },
            {
                path: 'settings/smtp',
                name: 'SMTP Configuration',
                allowedRoles: ['admin'],
                scope: 'platform',
                intent: {
                    admin: 'Configure platform-wide email/SMTP settings'
                }
            },
            {
                path: 'settings/theme',
                name: 'Theme Settings',
                allowedRoles: ['admin'],
                scope: 'platform',
                intent: {
                    admin: 'Manage application-wide theme configuration'
                }
            },
            {
                path: 'settings/email-templates',
                name: 'Email Templates',
                allowedRoles: ['admin'],
                scope: 'platform',
                intent: {
                    admin: 'Manage platform email templates'
                }
            },

            // Communication Settings (Platform Level)
            {
                path: 'communication/whatsapp',
                name: 'WhatsApp Settings',
                allowedRoles: ['admin'],
                scope: 'platform',
                intent: {
                    admin: 'Manage platform WhatsApp integration settings'
                }
            },

            // Subscription Management
            {
                path: 'subscription/features',
                name: 'Feature Management',
                allowedRoles: ['admin'],
                scope: 'platform',
                intent: {
                    admin: 'Create and manage subscription features'
                }
            },
            {
                path: 'subscription/plans',
                name: 'Plan Builder',
                allowedRoles: ['admin'],
                scope: 'platform',
                intent: {
                    admin: 'Create and manage subscription plans'
                }
            },
            {
                path: 'subscription/tenants',
                name: 'Tenant Subscriptions',
                allowedRoles: ['admin'],
                scope: 'platform',
                intent: {
                    admin: 'Manage tenant subscription assignments and billing'
                }
            },

            // Support (Platform Level)
            {
                path: 'support',
                name: 'Support Management',
                allowedRoles: ['admin'],
                scope: 'platform',
                intent: {
                    admin: 'Manage all user support tickets across all tenants'
                }
            },
        ],
    },

    // ============================================================================
    // 🟡 SHARED ROUTES - Admin & CompanyAdmin (Different Responsibilities)
    // ============================================================================
    shared: {
        scope: ROUTE_SCOPES.SHARED,
        allowedRoles: ['admin', 'companyAdmin'],
        deniedRoles: [],
        routes: [
            // Templates
            {
                path: 'templates',
                name: 'Templates',
                allowedRoles: ['admin', 'companyAdmin'],
                scope: 'shared',
                intent: {
                    admin: 'Create, edit, and manage survey templates for all tenants',
                    companyAdmin: 'Browse and use available templates (read-only, no creation)'
                }
            },

            // Survey Builder
            {
                path: 'surveys/builder',
                name: 'Survey Builder',
                allowedRoles: ['admin', 'companyAdmin'],
                scope: 'shared',
                intent: {
                    admin: 'Create survey templates for the platform',
                    companyAdmin: 'Create actual surveys for their company'
                }
            },

            // User Management
            {
                path: 'users',
                name: 'User Management',
                allowedRoles: ['admin', 'companyAdmin'],
                scope: 'shared',
                intent: {
                    admin: 'Manage all application users across all roles and tenants',
                    companyAdmin: 'Manage only their company members'
                }
            },
            {
                path: 'users/create',
                name: 'Create User',
                allowedRoles: ['admin', 'companyAdmin'],
                scope: 'shared',
                intent: {
                    admin: 'Create CompanyAdmin or User roles for any tenant',
                    companyAdmin: 'Create company members for their own tenant only'
                }
            },
            {
                path: 'users/:id',
                name: 'User Details',
                allowedRoles: ['admin', 'companyAdmin'],
                scope: 'shared',
                intent: {
                    admin: 'View and update any user in the system',
                    companyAdmin: 'View and update only their company\'s users'
                }
            },
        ],
    },

    // ============================================================================
    // 🔵 TENANT LAYER - CompanyAdmin Only (Tenant-Level Management)
    // ============================================================================
    tenant: {
        scope: ROUTE_SCOPES.TENANT,
        allowedRoles: ['companyAdmin'],
        deniedRoles: ['admin'],
        routes: [
            // Dashboard
            {
                path: 'dashboard',
                name: 'Dashboard',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'View company dashboard and metrics'
                }
            },

            // Surveys (Tenant-specific)
            {
                path: 'surveys',
                name: 'Survey List',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:read'],
                intent: {
                    companyAdmin: 'View and manage company surveys'
                }
            },
            {
                path: 'surveys/create',
                name: 'Create Survey',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:create'],
                intent: {
                    companyAdmin: 'Create new surveys for their company'
                }
            },
            {
                path: 'surveys/builder/edit/:id',
                name: 'Edit Survey',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:update'],
                intent: {
                    companyAdmin: 'Edit existing company surveys'
                }
            },
            {
                path: 'surveys/builder/:id',
                name: 'Survey Builder Detail',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:create'],
                intent: {
                    companyAdmin: 'Build and configure surveys'
                }
            },
            {
                path: 'surveys/detail/:id',
                name: 'Survey Detail',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:detail:view'],
                intent: {
                    companyAdmin: 'View detailed survey information'
                }
            },
            {
                path: 'surveys/responses/:id',
                name: 'Survey Responses',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:responses:view'],
                intent: {
                    companyAdmin: 'View survey responses'
                }
            },
            {
                path: 'surveys/:id/analytics',
                name: 'Survey Analytics',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:analytics:view'],
                intent: {
                    companyAdmin: 'View survey analytics and insights'
                }
            },
            {
                path: 'surveys/:id/distribution',
                name: 'Survey Distribution',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:share'],
                intent: {
                    companyAdmin: 'Configure survey distribution channels'
                }
            },
            {
                path: 'surveys/customize/:id',
                name: 'Survey Customization',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:settings:update'],
                intent: {
                    companyAdmin: 'Customize survey appearance and behavior'
                }
            },
            {
                path: 'surveys/share/:id',
                name: 'Survey Sharing',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:share'],
                intent: {
                    companyAdmin: 'Share surveys with respondents'
                }
            },
            {
                path: 'surveys/scheduling',
                name: 'Survey Scheduling',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:settings:update'],
                intent: {
                    companyAdmin: 'Schedule survey distribution'
                }
            },
            {
                path: 'surveys/:surveyId/target-audience',
                name: 'Target Audience',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:settings:update'],
                intent: {
                    companyAdmin: 'Define survey target audience'
                }
            },
            {
                path: 'surveys/:surveyId/schedule',
                name: 'Survey Schedule',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:settings:update'],
                intent: {
                    companyAdmin: 'Configure survey scheduling'
                }
            },
            {
                path: 'surveys/templates',
                name: 'Survey Templates',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:read'],
                intent: {
                    companyAdmin: 'Browse and use survey templates'
                }
            },
            {
                path: 'surveys/settings',
                name: 'Survey Settings',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['survey:settings:update'],
                intent: {
                    companyAdmin: 'Configure company-wide survey settings'
                }
            },

            // Analytics (Tenant-specific)
            {
                path: 'analytics',
                name: 'Analytics Overview',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['analytics:view'],
                intent: {
                    companyAdmin: 'View company analytics overview'
                }
            },
            {
                path: 'analytics/dashboard',
                name: 'Analytics Dashboard',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['analytics:view'],
                intent: {
                    companyAdmin: 'View detailed analytics dashboard'
                }
            },
            {
                path: 'analytics/feedback',
                name: 'Feedback Analysis',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['analytics:view'],
                intent: {
                    companyAdmin: 'Analyze feedback data'
                }
            },
            {
                path: 'analytics/custom-reports',
                name: 'Custom Reports',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['analytics:view'],
                intent: {
                    companyAdmin: 'Create and view custom reports'
                }
            },
            {
                path: 'analytics/real-time',
                name: 'Real-time Results',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['analytics:view'],
                intent: {
                    companyAdmin: 'Monitor real-time survey results'
                }
            },
            {
                path: 'analytics/trends',
                name: 'Trend Analysis',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['analytics:view'],
                intent: {
                    companyAdmin: 'Analyze trends over time'
                }
            },
            {
                path: 'analytics/response-overview',
                name: 'Response Overview',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['analytics:view'],
                intent: {
                    companyAdmin: 'View response statistics'
                }
            },

            // Actions (Tenant-specific)
            {
                path: 'actions',
                name: 'Action Management',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['action:read'],
                intent: {
                    companyAdmin: 'Manage automated actions'
                }
            },

            // Audiences (Tenant-specific)
            {
                path: 'audiences',
                name: 'Audiences & Segments',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['audience:read'],
                intent: {
                    companyAdmin: 'Manage audience segments'
                }
            },
            {
                path: 'audiences/category',
                name: 'Audience Category',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['audience:read'],
                intent: {
                    companyAdmin: 'Manage audience categories'
                }
            },
            {
                path: 'audiences/contacts',
                name: 'Contact Management',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                permissions: ['contact:read'],
                intent: {
                    companyAdmin: 'Manage contact lists'
                }
            },

            // Subscription (Tenant viewing their own plan)
            {
                path: 'subscription/my-plan',
                name: 'My Plan',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'View current subscription plan'
                }
            },
            {
                path: 'subscription/usage',
                name: 'Usage Dashboard',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'Monitor subscription usage'
                }
            },

            // Communication (Tenant-specific)
            {
                path: 'communication/sms',
                name: 'SMS Settings',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'Configure company SMS settings'
                }
            },

            // Tenant Settings
            {
                path: 'settings/thank-you',
                name: 'Thank You Page',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'Configure thank you page settings'
                }
            },
            {
                path: 'settings/notifications',
                name: 'Notification Settings',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'Configure notification preferences'
                }
            },

            // Access Management
            {
                path: 'access',
                name: 'Access Management',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'Manage company access controls'
                }
            },
            {
                path: 'roles',
                name: 'Role Management',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'Manage company roles'
                }
            },

            // Profile
            {
                path: 'profile',
                name: 'Profile',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'Manage personal profile'
                }
            },

            // Notifications
            {
                path: 'notifications',
                name: 'Notifications',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'View notifications'
                }
            },

            // Content Management
            {
                path: 'content/features',
                name: 'Features',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'View feature content'
                }
            },
            {
                path: 'content/pricing',
                name: 'Pricing',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'View pricing information'
                }
            },
            {
                path: 'content/testimonials',
                name: 'Testimonials',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'View testimonials'
                }
            },
            {
                path: 'content/widgets',
                name: 'Widgets',
                allowedRoles: ['companyAdmin'],
                scope: 'tenant',
                intent: {
                    companyAdmin: 'Manage company widgets'
                }
            },
        ],
    },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a role has access to a specific route
 * @param {string} path - The route path to check
 * @param {string} role - The user's role (admin | companyAdmin)
 * @returns {boolean} - Whether the role has access
 */
export const hasRouteAccess = (path, role) => {
    const routeConfig = getRouteConfig(path);
    if (!routeConfig) return false;
    return routeConfig.allowedRoles.includes(role);
};

/**
 * Get the intent/purpose for a role on a specific route
 * @param {string} path - The route path
 * @param {string} role - The user's role
 * @returns {string|null} - The intent description or null
 */
export const getRouteIntent = (path, role) => {
    const routeConfig = getRouteConfig(path);
    if (!routeConfig || !routeConfig.intent) return null;
    return routeConfig.intent[role] || null;
};

/**
 * Check if a path belongs to platform scope (Admin only)
 * @param {string} path - The route path
 * @returns {boolean}
 */
export const isPlatformRoute = (path) => {
    return ROUTE_CONFIG.platform.routes.some(r => path.includes(r.path));
};

/**
 * Check if a path belongs to tenant scope (CompanyAdmin only)
 * @param {string} path - The route path
 * @returns {boolean}
 */
export const isTenantRoute = (path) => {
    return ROUTE_CONFIG.tenant.routes.some(r => path.includes(r.path));
};

/**
 * Check if a path is a shared route (Admin & CompanyAdmin with different responsibilities)
 * @param {string} path - The route path
 * @returns {boolean}
 */
export const isSharedRoute = (path) => {
    return ROUTE_CONFIG.shared.routes.some(r => path.includes(r.path));
};

/**
 * Get route configuration by path
 * @param {string} path - The route path to look up
 * @returns {Object|null} - The route configuration or null
 */
export const getRouteConfig = (path) => {
    for (const [category, config] of Object.entries(ROUTE_CONFIG)) {
        const route = config.routes.find(r => path.includes(r.path));
        if (route) {
            return { ...route, category };
        }
    }
    return null;
};

/**
 * Get all routes accessible by a specific role
 * @param {string} role - The user's role (admin | companyAdmin)
 * @returns {Array} - Array of accessible routes
 */
export const getRoutesForRole = (role) => {
    const accessibleRoutes = [];

    for (const [category, config] of Object.entries(ROUTE_CONFIG)) {
        config.routes.forEach(route => {
            if (route.allowedRoles.includes(role)) {
                accessibleRoutes.push({
                    ...route,
                    category,
                    intent: route.intent[role]
                });
            }
        });
    }

    return accessibleRoutes;
};

/**
 * Validate if a role can perform actions on a route (strict enforcement)
 * No fallbacks - explicit denial if not allowed
 * @param {string} path - The route path
 * @param {string} role - The user's role
 * @returns {Object} - { allowed: boolean, reason: string }
 */
export const validateRouteAccess = (path, role) => {
    const routeConfig = getRouteConfig(path);

    // Route not found - deny access
    if (!routeConfig) {
        return {
            allowed: false,
            reason: 'Route not configured in access control'
        };
    }

    // Check if role is explicitly allowed
    if (routeConfig.allowedRoles.includes(role)) {
        return {
            allowed: true,
            reason: routeConfig.intent[role] || 'Access granted'
        };
    }

    // Explicit denial - no fallbacks
    return {
        allowed: false,
        reason: `Route '${path}' is not accessible by role '${role}'. Allowed roles: ${routeConfig.allowedRoles.join(', ')}`
    };
};

export default ROUTE_CONFIG;
