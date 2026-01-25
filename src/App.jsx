// src\App.jsx
"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"

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
import Notifications from "./pages/Notifications/Notifications"

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

              {/* Surveys */}
              <Route path="surveys" element={<SurveyList />} />
              <Route path="surveys/create" element={<SurveyBuilder darkMode={darkMode} />} />
              <Route path="surveys/builder" element={<SurveyBuilder darkMode={darkMode} />} />
              <Route path="surveys/builder/edit/:id" element={<SurveyBuilder darkMode={darkMode} />} />
              <Route path="surveys/builder/:id" element={<SurveyBuilder darkMode={darkMode} />} />
              <Route path="templates" element={<SurveyTemplates darkMode={darkMode} />} />
              <Route path="templates/create" element={<SurveyBuilder darkMode={darkMode} />} />
              <Route path="surveys/detail/:id" element={<SurveyDetail />} />
              <Route path="surveys/responses/:id" element={<SurveyResponses />} />
              <Route path="surveys/:id/analytics" element={<SurveyAnalytics />} />
              <Route path="surveys/:id/distribution" element={<SurveyDistribution />} />
              <Route path="surveys/customize/:id" element={<SurveyCustomization />} />
              <Route path="surveys/share/:id" element={<SurveySharing />} />
              <Route path="surveys/scheduling" element={<SurveyScheduling />} />
              <Route path="surveys/:surveyId/target-audience" element={<TargetAudienceSelection />} />
              <Route path="surveys/:surveyId/schedule" element={<SurveySchedule />} />
              <Route path="surveys/templates" element={<SurveyTemplates />} />
              <Route path="surveys/templates/create" element={<SurveyBuilder />} />
              <Route path="surveys/takesurvey/:id" element={<TakeSurvey />} />
              <Route path="surveys/settings" element={<SurveySettings />} />

              {/* Users */}
              <Route path="users" element={<UserList />} />
              <Route path="users/:id/edit" element={<UserForm />} />
              <Route path="users/create" element={<UserForm />} />

              {/* Access */}
              <Route path="access" element={<AccessManagement />} />
              <Route path="roles" element={<RoleManagement />} />

              {/* Audiences */}
              <Route path="audiences" element={<AudiencesSegments />} />
              <Route path="audiences/category" element={<AudienceCategory />} />
              <Route path="audiences/contacts" element={<ContactManagement />} />

              {/* Analytics */}
              <Route path="analytics" element={<Analytics />} />
              <Route path="analytics/dashboard" element={<AnalyticsDashboard />} />
              <Route path="analytics/feedback" element={<FeedbackAnalysis />} />
              <Route path="analytics/custom-reports" element={<CustomReports />} />
              <Route path="analytics/real-time" element={<RealTimeResults />} />
              <Route path="analytics/trends" element={<TrendAnalysis />} />
              <Route path="analytics/response-overview" element={<ResponseOverview />} />

              {/* Subscription Management */}
              <Route path="subscription/my-plan" element={<MyPlans />} />
              <Route path="subscription/usage" element={<UsageDashboard />} />

              {/* Admin: Subscription Management */}
              <Route path="subscription/features" element={<FeatureManagement />} />
              <Route path="subscription/plans" element={<PlanBuilder />} />
              <Route path="subscription/tenants" element={<TenantSubscriptions />} />
              {/* Support */}
              <Route path="support" element={<SupportTickets />} />
              <Route path="support/create" element={<CreateTicket />} />
              <Route path="support/tickets/:id" element={<TicketDetail />} />

              {/* Actions */}
              <Route path="actions" element={<ActionManagement />} />

              {/* Communication */}
              <Route path="communication/whatsapp" element={<WhatsAppSettings />} />
              <Route path="communication/sms" element={<SMSSettings />} />

              {/* Settings */}
              <Route path="settings" element={<Settings />} />
              <Route path="settings/thank-you" element={<CustomThankYou />} />

              {/* <Route path="settings/billing-plans" element={<BillingPlans />} /> */}
              <Route path="settings/thank-you" element={<ThankYouPage />} />
              <Route path="settings/email-templates" element={<EmailTemplates />} />
              <Route path="settings/notifications" element={<NotificationSettings />} />
              <Route path="settings/smtp" element={<SMTPConfig />} />
              <Route path="settings/theme" element={<ThemeSettings />} />

              {/* Notifications */}
              <Route path="notifications" element={<Notifications />} />

              {/* Profile */}
              <Route path="profile" element={<Profile />} />

              {/* Content */}
              <Route path="content/features" element={<Features />} />
              <Route path="content/pricing" element={<Pricing />} />
              <Route path="content/testimonials" element={<Testimonials />} />
              <Route path="content/widgets" element={<Widgets />} />
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