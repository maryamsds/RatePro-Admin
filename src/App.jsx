// src\App.jsx
"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"
import { TenantGuard, PlatformGuard, CompanyAdminGuard, SharedGuard } from "./components/Authorization"

// Layout & Pages
import Layout from "./components/Layout/Layout"
import Dashboard from "./pages/Dashboard/Dashboard"

// Auth Pages
import Login from "./pages/Auth/Login"
import ForgotPasswordFlow from "./pages/Auth/ForgotPasswordFlow"
import ResetPassword from "./pages/Auth/ResetPassword"
import EnterEmail from "./pages/Auth/EnterEmail"
import EnterResetCode from "./pages/Auth/EnterResetCode"

// Public Pages
import TakeSurvey from "./pages/Surveys/TakeSurvey"
import ThankYou from "./pages/Settings/ThankYouPage"
import CustomThankYou from "./pages/Settings/CustomThankYou"

// 404
import NotFound from "./pages/NotFound/NotFound"

import SurveyList from "./pages/Surveys/SurveyList"
import SurveyBuilder from "./pages/Surveys/SurveyBuilder"
import SurveyDistribution from "./pages/Surveys/SurveyDistribution"
import SurveySettings from "./pages/Surveys/SurveySettings"
import SurveyDetail from "./pages/Surveys/SurveyDetail"
import SurveyResponses from "./pages/Surveys/SurveyResponses"
import SurveyAnalytics from "./pages/Surveys/SurveyAnalytics"
import SurveyScheduling from "./pages/Surveys/SurveyScheduling"
import SurveySchedule from "./pages/Surveys/SurveySchedule"
import TargetAudienceSelection from "./pages/Surveys/TargetAudienceSelection"
import SurveyTemplates from "./pages/Surveys/SurveyTemplates"
import SurveyCustomization from "./pages/Surveys/SurveyCustomization"
import SurveySharing from "./pages/Surveys/SurveySharing"
// import Templates from "./pages/Templates/Templates"
import AudiencesSegments from "./pages/Audiences/AudienceSegments"
import AudienceCategory from "./pages/Audiences/AudienceCategory"
import Analytics from "./pages/Analytics/Analytics"
import AnalyticsDashboard from "./pages/Analytics/AnalyticsDashboard"
import RealTimeResults from "./pages/Analytics/RealTimeResults"
import TrendAnalysis from "./pages/Analytics/TrendAnalysis"
import CustomReports from "./pages/Analytics/CustomReports"
import ResponseOverview from "./pages/Analytics/ResponseOverview"
import Settings from "./pages/Settings/Settings"
import ThankYouPage from "./pages/Settings/ThankYouPage"
import NotificationSettings from "./pages/Settings/NotificationSettings"
import ThemeSettings from "./pages/Settings/ThemeSettings"
import SMTPConfig from "./pages/Settings/SMTPConfig"
import Profile from "./pages/Profile/Profile"
import UserList from "./pages/UserManagement/UserList"
import UserForm from "./pages/UserManagement/UserForm"
import AccessManagement from "./pages/AccessManagement/AccessManagement"
import RoleManagement from "./pages/AccessManagement/RoleManagement"
import EmailTemplates from "./pages/Settings/EmailTemplates"
import DropdownSettings from "./pages/Settings/DropdownSettings"
import SupportTickets from "./pages/Support/SupportTickets"
import TicketDetail from "./pages/Support/TicketDetail"
import CreateTicket from "./pages/Support/CreateTicket"
import Testimonials from "./pages/ContentManagement/Testimonials"
import Widgets from "./pages/ContentManagement/Widgets"
import Features from "./pages/ContentManagement/Features"
import Pricing from "./pages/ContentManagement/Pricing"
// Subscription Pages
import MyPlans from './pages/Subscription/MyPlans';
import PlanBuilder from "./pages/Subscription/PlanBuilder";
import FeatureManagement from "./pages/Subscription/FeatureManagement";
import TenantSubscriptions from "./pages/Subscription/TenantSubscriptions";
import UsageDashboard from "./pages/Subscription/UsageDashboard";
import ContactManagement from "./pages/Audiences/ContactManagement"
import Support from "./pages/Support/CreateTicket"
import VerifyEmail from "./pages/Auth/VerifyEmail"
import TokenRedirector from "./components/TokenRedirector"
import WhatsAppSettings from "./pages/Communication/WhatsAppSettings"
import SMSSettings from "./pages/Communication/SMSSettings"
import FeedbackAnalysis from "./pages/Analytics/FeedbackAnalysis"
import ActionManagement from "./pages/Actions/ActionManagement"
import { ToastContainer } from "react-toastify"
import { useAuth } from "./context/AuthContext"
import FullScreenLoader from "./components/Loader/FullScreenLoader"
// PlanBuilder import moved above
import ExecutiveDashboard from "./pages/Dashboard/ExecutiveDashboard"
import PlatformDashboard from "./pages/Dashboard/PlatformDashboard"
import Notifications from "./pages/Notifications/Notifications"
import Unauthorized from "./pages/Unauthorized/Unauthorized"

function App() {
  // const navigate = useNavigate();
  const { authLoading, globalLoading } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("darkMode")
      return saved !== null
        ? JSON.parse(saved)
        : window.matchMedia("(prefers-color-scheme: dark)").matches
    } catch (err) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  })

  const toggleTheme = () => {
    setDarkMode((prev) => !prev)
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
  }, [darkMode])

  return (
    <div>
      <>
        {(authLoading || globalLoading) && <FullScreenLoader />}
        <div className={`app-container ${darkMode ? "dark" : "light"}`}>
          <Routes>
            <Route path="/auth-redirect" element={<TokenRedirector />} />
            {/* Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/enter-email" element={<EnterEmail />} />
            <Route path="/enter-reset-code" element={<EnterResetCode />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Public Pages */}
            <Route path="/survey/:id" element={<TakeSurvey />} />
            <Route path="/survey/:id/password" element={<TakeSurvey />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/thank-you/:surveyId" element={<CustomThankYou />} />
            <Route path="/support" element={<Support />} />

            {/* Authorization Error Page - Outside protected routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Layout */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleTheme={toggleTheme} />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />

              {/* ============================================================================ */}
              {/* � PLATFORM LAYER - Admin Only (System/Platform Level)                      */}
              {/* Routes: /platform, /settings, /settings/smtp, /settings/theme,              */}
              {/*         /settings/email-templates, /communication/whatsapp,                 */}
              {/*         /subscription/features, /subscription/plans, /subscription/tenants, */}
              {/*         /support                                                            */}
              {/* ============================================================================ */}

              {/* Platform Dashboard */}
              <Route path="platform" element={<PlatformGuard><PlatformDashboard darkMode={darkMode} /></PlatformGuard>} />

              {/* Global Settings - Admin Only */}
              <Route path="settings" element={<PlatformGuard><Settings /></PlatformGuard>} />
              <Route path="settings/smtp" element={<PlatformGuard><SMTPConfig /></PlatformGuard>} />
              <Route path="settings/theme" element={<PlatformGuard><ThemeSettings /></PlatformGuard>} />
              <Route path="settings/email-templates" element={<PlatformGuard><EmailTemplates /></PlatformGuard>} />
              <Route path="settings/dropdowns" element={<PlatformGuard><DropdownSettings /></PlatformGuard>} />

              {/* Communication Settings - Admin Only */}
              <Route path="communication/whatsapp" element={<PlatformGuard><WhatsAppSettings /></PlatformGuard>} />

              {/* Subscription Management - Admin Only */}
              <Route path="subscription/features" element={<PlatformGuard><FeatureManagement /></PlatformGuard>} />
              <Route path="subscription/plans" element={<PlatformGuard><PlanBuilder /></PlatformGuard>} />
              <Route path="subscription/tenants" element={<PlatformGuard><TenantSubscriptions /></PlatformGuard>} />

              {/* Support Management - Admin Only */}
              <Route path="support" element={<PlatformGuard><SupportTickets /></PlatformGuard>} />
              <Route path="support/create" element={<PlatformGuard><CreateTicket /></PlatformGuard>} />
              <Route path="support/tickets/:id" element={<PlatformGuard><TicketDetail /></PlatformGuard>} />

              {/* ============================================================================ */}
              {/* � SHARED LAYER - Admin & CompanyAdmin (Different Responsibilities)         */}
              {/* Routes: /templates, /surveys/builder, /users, /users/create, /users/:id     */}
              {/* ============================================================================ */}

              {/* Templates - Admin: Create/manage templates, CompanyAdmin: Use templates only */}
              <Route path="templates" element={<SharedGuard><SurveyTemplates darkMode={darkMode} /></SharedGuard>} />

              {/* Survey Builder - Admin: Create templates, CompanyAdmin: Create surveys */}
              <Route path="surveys/builder" element={<SharedGuard><SurveyBuilder darkMode={darkMode} /></SharedGuard>} />

              {/* User Management - Admin: All users, CompanyAdmin: Company members only */}
              <Route path="users" element={<SharedGuard><UserList /></SharedGuard>} />
              <Route path="users/create" element={<SharedGuard><UserForm /></SharedGuard>} />
              <Route path="users/:id" element={<SharedGuard><UserForm /></SharedGuard>} />
              <Route path="users/:id/edit" element={<SharedGuard><UserForm /></SharedGuard>} />

              {/* ============================================================================ */}
              {/* 🔵 TENANT LAYER - CompanyAdmin Only (Tenant-Level Management)               */}
              {/* ============================================================================ */}

              {/* Dashboard */}
              <Route path="dashboard" element={<TenantGuard><Dashboard /></TenantGuard>} />

              {/* Surveys - CompanyAdmin Only */}
              <Route path="surveys" element={<TenantGuard><SurveyList /></TenantGuard>} />
              <Route path="surveys/create" element={<TenantGuard><SurveyBuilder darkMode={darkMode} /></TenantGuard>} />
              <Route path="surveys/builder/edit/:id" element={<TenantGuard><SurveyBuilder darkMode={darkMode} /></TenantGuard>} />
              <Route path="surveys/builder/:id" element={<TenantGuard><SurveyBuilder darkMode={darkMode} /></TenantGuard>} />
              <Route path="templates/create" element={<TenantGuard><SurveyBuilder darkMode={darkMode} /></TenantGuard>} />
              <Route path="surveys/detail/:id" element={<TenantGuard><SurveyDetail /></TenantGuard>} />
              <Route path="surveys/responses/:id" element={<TenantGuard><SurveyResponses /></TenantGuard>} />
              <Route path="surveys/:id/analytics" element={<TenantGuard><SurveyAnalytics /></TenantGuard>} />
              <Route path="surveys/:id/distribution" element={<TenantGuard><SurveyDistribution /></TenantGuard>} />
              <Route path="surveys/customize/:id" element={<TenantGuard><SurveyCustomization /></TenantGuard>} />
              <Route path="surveys/share/:id" element={<TenantGuard><SurveySharing /></TenantGuard>} />
              <Route path="surveys/scheduling" element={<TenantGuard><SurveyScheduling /></TenantGuard>} />
              <Route path="surveys/:surveyId/target-audience" element={<TenantGuard><TargetAudienceSelection /></TenantGuard>} />
              <Route path="surveys/:surveyId/schedule" element={<TenantGuard><SurveySchedule /></TenantGuard>} />
              <Route path="surveys/templates" element={<TenantGuard><SurveyTemplates /></TenantGuard>} />
              <Route path="surveys/templates/create" element={<TenantGuard><SurveyBuilder /></TenantGuard>} />
              <Route path="surveys/takesurvey/:id" element={<TenantGuard><TakeSurvey /></TenantGuard>} />
              <Route path="surveys/settings" element={<TenantGuard><SurveySettings /></TenantGuard>} />

              {/* Analytics - CompanyAdmin Only */}
              <Route path="analytics" element={<TenantGuard><Analytics /></TenantGuard>} />
              <Route path="analytics/dashboard" element={<TenantGuard><AnalyticsDashboard /></TenantGuard>} />
              <Route path="analytics/feedback" element={<TenantGuard><FeedbackAnalysis /></TenantGuard>} />
              <Route path="analytics/custom-reports" element={<TenantGuard><CustomReports /></TenantGuard>} />
              <Route path="analytics/real-time" element={<TenantGuard><RealTimeResults /></TenantGuard>} />
              <Route path="analytics/trends" element={<TenantGuard><TrendAnalysis /></TenantGuard>} />
              <Route path="analytics/response-overview" element={<TenantGuard><ResponseOverview /></TenantGuard>} />

              {/* Actions - CompanyAdmin Only */}
              <Route path="actions" element={<TenantGuard><ActionManagement /></TenantGuard>} />

              {/* Audiences - CompanyAdmin Only */}
              <Route path="audiences" element={<TenantGuard><AudiencesSegments /></TenantGuard>} />
              <Route path="audiences/category" element={<TenantGuard><AudienceCategory /></TenantGuard>} />
              <Route path="audiences/contacts" element={<TenantGuard><ContactManagement /></TenantGuard>} />

              {/* Subscription (Tenant viewing their own plan) - CompanyAdmin Only */}
              <Route path="subscription/my-plan" element={<TenantGuard><MyPlans /></TenantGuard>} />
              <Route path="subscription/usage" element={<TenantGuard><UsageDashboard /></TenantGuard>} />

              {/* Communication (Tenant-specific) - CompanyAdmin Only */}
              <Route path="communication/sms" element={<TenantGuard><SMSSettings /></TenantGuard>} />

              {/* Tenant Settings - CompanyAdmin Only */}
              <Route path="settings/thank-you" element={<TenantGuard><ThankYouPage /></TenantGuard>} />
              <Route path="settings/notifications" element={<TenantGuard><NotificationSettings /></TenantGuard>} />

              {/* Access Management - CompanyAdmin Only */}
              <Route path="access" element={<CompanyAdminGuard><AccessManagement /></CompanyAdminGuard>} />
              <Route path="roles" element={<CompanyAdminGuard><RoleManagement /></CompanyAdminGuard>} />

              {/* Profile - CompanyAdmin Only */}
              <Route path="profile" element={<TenantGuard><Profile /></TenantGuard>} />

              {/* Notifications - CompanyAdmin Only */}
              <Route path="notifications" element={<TenantGuard><Notifications /></TenantGuard>} />

              {/* Content Management - CompanyAdmin Only */}
              <Route path="content/features" element={<TenantGuard><Features /></TenantGuard>} />
              <Route path="content/pricing" element={<TenantGuard><Pricing /></TenantGuard>} />
              <Route path="content/testimonials" element={<TenantGuard><Testimonials /></TenantGuard>} />
              <Route path="content/widgets" element={<TenantGuard><Widgets /></TenantGuard>} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </>
      <ToastContainer />
    </div>
  )
}

export default App