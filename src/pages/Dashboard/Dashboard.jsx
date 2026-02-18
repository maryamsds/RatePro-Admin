// src\pages\Dashboard\Dashboard.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import {
  MdPoll,
  MdPeople,
  MdTrendingUp,
  MdAccessTime,
  MdQuestionAnswer,
  MdBarChart,
  MdInfo,
  MdRefresh,
  MdDownload,
  MdAdd,
  MdShowChart,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import { Link, useNavigate, Navigate } from "react-router-dom"
import Swal from "sweetalert2"
import { useAuth } from "../../context/AuthContext.jsx"

// API Services
import { listSurveys } from "../../api/services/surveyService"
import { getExecutiveDashboard } from "../../api/services/dashboardService"


// Register Chart.js components including Filler
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const Dashboard = ({ darkMode }) => {
  const { user, authLoading, hasPermission } = useAuth();
  const navigate = useNavigate();

  // ============================================================================
  // 🔐 ROLE-BASED DASHBOARD ROUTING
  // ============================================================================
  // System Admin should not see tenant dashboard - redirect to platform dashboard
  // This is a safety net in case they bypass frontend guards
  if (!authLoading && user?.role === 'admin') {
    return <Navigate to="/app/platform" replace />;
  }

  const [stats, setStats] = useState({
    totalSurveys: 0,
    activeResponses: 0,
    completionRate: 0,
    avgSatisfaction: 0,
    npsScore: 0,
    satisfactionIndex: 0,
  })

  const [recentSurveys, setRecentSurveys] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [trendData, setTrendData] = useState({ labels: [], data: [] })

  // ============================================================================
  // 🔐 PERMISSION-BASED WIDGET VISIBILITY
  // ============================================================================
  const canViewSurveys = user?.role === 'companyAdmin' || hasPermission('survey:read');
  const canCreateSurvey = user?.role === 'companyAdmin' || hasPermission('survey:create');
  const canViewAnalytics = user?.role === 'companyAdmin' || hasPermission('analytics:view');

  const createNewSurvey = () => {
    navigate("/app/surveys/create");
  };

  const ViewTrendsAnalytics = () => {
    navigate("/app/analytics/trends");
  };

  const ViewRecentSurveys = () => {
    navigate("/app/surveys");
  };

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async (showRefreshSpinner = false) => {
    console.time("Dashboard Fetch Time");

    try {
      if (showRefreshSpinner) setRefreshing(true);
      else setLoading(true);
      setError(null);

      console.group("📡 Dashboard API Calls");

      const [dashboardData, surveysData] = await Promise.all([
        getExecutiveDashboard()
          .then(res => {
            console.log("✅ Raw Dashboard Response:", res);
            return res;
          })
          .catch(err => {
            console.warn("❌ Dashboard API error, using fallback:", err.message);
            return null;
          }),

        // Sort by lastResponseAt to show surveys with recent activity first
        listSurveys({ page: 1, limit: 10, sort: "-lastResponseAt" })
          .then(res => {
            console.log("✅ Raw Surveys Response:", res);
            return res;
          })
          .catch(err => {
            console.warn("❌ Surveys API error:", err.message);
            return { surveys: [], total: 0 };
          }),
      ]);

      console.groupEnd();

      // ================= DASHBOARD DATA =================
      console.group("📊 Dashboard KPI Mapping");

      // Use survey list total as fallback for totalSurveys
      const totalSurveysFromList = surveysData?.total || surveysData?.surveys?.length || 0;

      // The dashboardService transform returns { kpis: {...}, trends: {...} }
      // Use kpis from transform, with fallbacks to raw metrics if needed
      const kpis = dashboardData?.kpis || {};
      const rawMetrics = dashboardData?._raw?.metrics || {};

      console.log("📊 Transformed KPIs:", kpis);
      console.log("📊 Raw Metrics backup:", rawMetrics);

      // Extract KPIs - prefer transformed kpis, fallback to raw metrics
      const mappedStats = {
        totalSurveys: kpis.totalSurveys || rawMetrics.totalSurveys || totalSurveysFromList,
        activeResponses: kpis.totalResponses || rawMetrics.totalResponses || 0,
        completionRate: kpis.completionRate || rawMetrics.completionRate || 0,
        avgSatisfaction: kpis.avgSatisfaction || rawMetrics.averageRating || 0,
        npsScore: kpis.npsScore || rawMetrics.npsScore || 0,
        satisfactionIndex: kpis.satisfactionIndex || rawMetrics.satisfactionIndex || 0,
      };

      console.log("📈 Final Mapped Stats:", mappedStats);
      console.log("📊 Fallback used for totalSurveys:", !kpis.totalSurveys);
      console.groupEnd();

      setStats(mappedStats);

      // ================= TREND DATA =================
      console.group("📈 Trend Data Mapping");

      // Use satisfaction trend which has weekly data from backend
      // (responses trend only has single total value)
      if (dashboardData?.trends?.satisfaction) {
        const trendLabels = dashboardData.trends.satisfaction.labels || [];
        const trendDataValues = dashboardData.trends.satisfaction.data || [];

        console.log("Satisfaction Trend Labels:", trendLabels);
        console.log("Satisfaction Trend Data:", trendDataValues);

        setTrendData({
          labels: trendLabels,
          data: trendDataValues,
        });
      } else {
        console.warn("⚠️ No satisfaction trend data available");
        // No fallback — show empty trend
        setTrendData({
          labels: [],
          data: [],
        });
      }


      console.groupEnd();

      // ================= SURVEYS DATA =================
      if (surveysData?.surveys) {
        console.group("📝 Recent Surveys Transformation");
        console.log("Raw surveys count:", surveysData.surveys.length);

        const transformedSurveys = surveysData.surveys.map((survey) => ({
          id: survey.id || survey._id,
          name: survey.title,
          // surveyService.transformSurvey already maps totalResponses → responseCount
          responses: survey.responseCount || 0,
          // Backend returns completion rate in stats.completionRate
          completion: survey.stats?.completionRate || 0,
          status:
            survey.status === "active" ? "Active" :
              survey.status === "completed" ? "Completed" :
                survey.status === "draft" ? "Draft" :
                  survey.status === "paused" ? "Paused" :
                    survey.status === "published" ? "Active" :
                      survey.status,
        }));

        console.log("Transformed surveys:", transformedSurveys);
        console.groupEnd();

        setRecentSurveys(transformedSurveys);
        setPagination(prev => ({
          ...prev,
          total: surveysData.total || transformedSurveys.length
        }));
      }

    } catch (err) {
      console.error("🔥 Dashboard fetch fatal error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.timeEnd("Dashboard Fetch Time");
    }
  }, []);


  // Handle refresh button
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  useEffect(() => {
    if (
      user &&
      (user.role === "companyAdmin") &&
      !user.companyProfileUpdated
    ) {
      Swal.fire({
        title: "⚠️ Company Profile Update Required",
        text: "To unlock the full features of the platform, please complete your company profile. Without updating it, you may not be able to access all functionalities.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Update Profile",
        cancelButtonText: "Maybe Later",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/app/profile?tab=company")
        }
      })
    }
  }, [user, navigate])

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Chart data - use real data when available, fallback to placeholder
  const responseData = {
    labels: trendData.labels.length > 0 ? trendData.labels : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Responses",
        data: trendData.data.length > 0 ? trendData.data : [0, 0, 0, 0, 0, 0],
        borderColor: "#054a4eff",
        backgroundColor: darkMode ? "#054a4eff" : "#054a4eff",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#054a4eff",
        pointBorderWidth: 2,
        pointBorderColor: darkMode ? "#1e293b" : "#ffffff",
      },
    ],
  }

  // Mock data charts removed - no backend support for these visualizations
  // TODO: Implement backend APIs if these charts are needed:
  // - GET /api/analytics/survey-types (for Survey Type Distribution)
  // - GET /api/analytics/weekly-completion (for Weekly Completion chart)

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: darkMode ? "#e9ecef" : "#212529",
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: darkMode ? "#2d3748" : "#ffffff",
        titleColor: darkMode ? "#ffffff" : "#212529",
        bodyColor: darkMode ? "#e9ecef" : "#495057",
        borderColor: darkMode ? "#4a5568" : "#dee2e6",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          labelTextColor: function () {
            return darkMode ? "#e9ecef" : "#495057";
          }
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? "#cbd5e0" : "#495057",
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          borderColor: darkMode ? "#4a5568" : "#dee2e6",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? "#cbd5e0" : "#495057",
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          borderColor: darkMode ? "#4a5568" : "#dee2e6",
        },
      },
    },
  }

  // doughnutOptions removed - no longer needed without mock charts

  const currentSurveys = recentSurveys.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
              Dashboard Overview
            </h2>
            <p className="text-[var(--text-secondary)]">
              Welcome back! Here's what's happening with your surveys today.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                         border border-[var(--light-border)] dark:border-[var(--dark-border)]
                         text-[var(--light-text)] dark:text-[var(--dark-text)]
                         bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                         hover:bg-[var(--light-hover)]/10 dark:hover:bg-[var(--dark-hover)]/10
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-300"
            >
              {refreshing ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdRefresh size={16} />
              )}
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            {canCreateSurvey && (
              <button
                onClick={createNewSurvey}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                           bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]
                           text-white transition-colors duration-300"
              >
                <MdAdd size={16} />
                New Survey
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div 
          className="flex items-center gap-3 mb-6 p-4 rounded-md
                     bg-[var(--danger-light)] border border-[var(--danger-color)]
                     text-[var(--danger-color)]" 
          role="alert"
        >
          <span className="flex-1">{error}</span>
          <button 
            onClick={handleRefresh}
            className="text-sm text-[var(--primary-color)] hover:underline font-medium
                       bg-transparent border-0 cursor-pointer p-0 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--text-secondary)] text-lg">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Surveys Card */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                            rounded-md shadow-md p-6
                            border border-[var(--light-border)] dark:border-[var(--dark-border)]
                            transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-md
                                bg-[var(--primary-light)]">
                  <MdPoll className="text-[var(--primary-color)]" size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                {stats.totalSurveys}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm">Total Surveys</p>
            </div>

            {/* Active Responses Card */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                            rounded-md shadow-md p-6
                            border border-[var(--light-border)] dark:border-[var(--dark-border)]
                            transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-md
                                bg-[var(--success-light)]">
                  <MdPeople className="text-[var(--success-color)]" size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                {stats.activeResponses.toLocaleString()}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm">Active Responses</p>
            </div>

            {/* Completion Rate Card */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                            rounded-md shadow-md p-6
                            border border-[var(--light-border)] dark:border-[var(--dark-border)]
                            transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-md
                                bg-[var(--info-light)]">
                  <MdTrendingUp className="text-[var(--info-color)]" size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                {stats.completionRate}%
              </h3>
              <p className="text-[var(--text-secondary)] text-sm">Completion Rate</p>
            </div>

            {/* Avg Satisfaction Card */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                            rounded-md shadow-md p-6
                            border border-[var(--light-border)] dark:border-[var(--dark-border)]
                            transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-md
                                bg-[var(--warning-light)]">
                  <MdTrendingUp className="text-[var(--warning-color)]" size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                {typeof stats.avgSatisfaction === 'number' ? stats.avgSatisfaction.toFixed(2) : stats.avgSatisfaction}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm">Avg Satisfaction</p>
            </div>
          </div>

          {/* Charts Row - Only show if user can view analytics */}
          {canViewAnalytics && (
            <div className="mb-6">
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                              rounded-md shadow-md p-6
                              border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="flex items-center justify-between mb-6">
                  <h5 className="flex items-center gap-2 text-lg font-semibold
                                 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    <MdShowChart size={20} />
                    Satisfaction Trends
                  </h5>
                  <button
                    onClick={ViewTrendsAnalytics}
                    className="text-sm text-[var(--primary-color)] hover:underline font-medium
                               bg-transparent border-0 cursor-pointer p-0 transition-colors duration-300"
                  >
                    View Details →
                  </button>
                </div>
                <div className="w-full h-80">
                  <Line data={responseData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {/* Recent Surveys - Only show if user can view surveys */}
          {canViewSurveys ? (
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                            rounded-md shadow-md
                            border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="flex items-center justify-between p-6 border-b
                              border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <h5 className="flex items-center gap-2 text-lg font-semibold
                               text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  <MdPoll size={20} />
                  Recent Surveys
                </h5>
                <button
                  onClick={ViewRecentSurveys}
                  className="text-sm text-[var(--primary-color)] hover:underline font-medium
                             bg-transparent border-0 cursor-pointer p-0 transition-colors duration-300"
                >
                  View All →
                </button>
              </div>

              <div className="p-6">
                {recentSurveys.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MdPoll size={48} className="text-[var(--text-secondary)] mb-3" />
                    <h6 className="text-lg font-medium text-[var(--text-secondary)] mb-1">
                      No surveys yet
                    </h6>
                    <p className="text-[var(--text-secondary)] text-sm mb-4">
                      Create your first survey to get started
                    </p>
                    {canCreateSurvey && (
                      <button
                        onClick={createNewSurvey}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                                   bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]
                                   text-white transition-colors duration-300"
                      >
                        <MdAdd size={16} />
                        Create Survey
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse">
                        <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                          <tr>
                            <th className="p-3 text-left text-sm font-semibold
                                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                                           border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                              Survey Name
                            </th>
                            <th className="hidden md:table-cell p-3 text-left text-sm font-semibold
                                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                                           border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                              Responses
                            </th>
                            <th className="p-3 text-left text-sm font-semibold
                                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                                           border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                              Status
                            </th>
                            <th className="p-3 text-center text-sm font-semibold
                                           text-[var(--light-text)] dark:text-[var(--dark-text)]
                                           border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentSurveys.map((survey) => (
                            <tr key={survey.id}
                                className="hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]
                                           transition-colors duration-200">
                              <td className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <Link
                                  to={`/app/surveys/${survey.id}`}
                                  className="no-underline text-[var(--primary-color)] hover:text-[var(--primary-hover)]
                                             transition-colors duration-200"
                                >
                                  <div className="font-medium">{survey.name}</div>
                                </Link>
                                <small className="md:hidden text-[var(--text-secondary)] text-xs">
                                  {survey.responses} responses
                                </small>
                              </td>
                              <td className="hidden md:table-cell p-3 border-b
                                             border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <span className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                                  {survey.responses}
                                </span>
                              </td>
                              <td className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <span className={`
                                  inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium
                                  ${survey.status.toLowerCase() === 'active' 
                                    ? 'bg-[var(--success-light)] text-[var(--success-color)]'
                                    : survey.status.toLowerCase() === 'completed'
                                    ? 'bg-[var(--info-light)] text-[var(--info-color)]'
                                    : survey.status.toLowerCase() === 'draft'
                                    ? 'bg-[var(--warning-light)] text-[var(--warning-color)]'
                                    : survey.status.toLowerCase() === 'paused'
                                    ? 'bg-[var(--danger-light)] text-[var(--danger-color)]'
                                    : 'bg-[var(--primary-light)] text-[var(--primary-color)]'
                                  }
                                `}>
                                  {survey.status}
                                </span>
                              </td>
                              <td className="p-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                                <div className="flex gap-2 justify-center">
                                  <Link 
                                    to={`/app/surveys/responses/${survey.id}`}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded
                                               text-[var(--primary-color)] hover:bg-[var(--primary-light)]
                                               transition-colors duration-200"
                                    title="View Responses"
                                  >
                                    <MdQuestionAnswer size={18} />
                                  </Link>
                                  <Link 
                                    to={`/app/surveys/${survey.id}/analytics`}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded
                                               text-[var(--info-color)] hover:bg-[var(--info-light)]
                                               transition-colors duration-200"
                                    title="View Analytics"
                                  >
                                    <MdBarChart size={18} />
                                  </Link>
                                  <Link 
                                    to={`/app/surveys/detail/${survey.id}`}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded
                                               text-[var(--secondary-color)] hover:bg-gray-100 dark:hover:bg-gray-800
                                               transition-colors duration-200"
                                    title="Survey Details"
                                  >
                                    <MdInfo size={18} />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4
                                    border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="text-sm text-[var(--text-secondary)]">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} surveys
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md
                                     border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                     text-[var(--light-text)] dark:text-[var(--dark-text)]
                                     bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                                     hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     transition-colors duration-300"
                          disabled={pagination.page === 1}
                          onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                        >
                          <MdChevronLeft size={18} />
                          Previous
                        </button>
                        <button
                          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md
                                     border border-[var(--light-border)] dark:border-[var(--dark-border)]
                                     text-[var(--light-text)] dark:text-[var(--dark-text)]
                                     bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                                     hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     transition-colors duration-300"
                          disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                          onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                        >
                          Next
                          <MdChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Fallback for users without survey permissions */
            <div className="flex flex-col items-center justify-center py-16
                            bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                            rounded-md shadow-md
                            border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <MdPoll size={48} className="text-[var(--text-secondary)] mb-3" />
              <h6 className="text-lg font-medium text-[var(--text-secondary)] mb-1">
                Limited Access
              </h6>
              <p className="text-[var(--text-secondary)] text-sm">
                You don't have permission to view surveys. Contact your administrator for access.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard