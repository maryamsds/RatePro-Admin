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
  MdCheckCircle,
  MdStarRate,
  MdTrendingUp,
  MdTrendingDown,
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
import { getExecutiveDashboard, getDashboardTrends, getDashboardComparison } from "../../api/services/dashboardService"


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

// ============================================================================
// CONSTANTS
// ============================================================================
const RANGE_OPTIONS = [
  { label: "7 days", value: "7d", days: 7 },
  { label: "30 days", value: "30d", days: 30 },
  { label: "90 days", value: "90d", days: 90 },
]

const Dashboard = ({ darkMode }) => {
  const { user, authLoading, hasPermission } = useAuth();
  const navigate = useNavigate();

  // ============================================================================
  // 🔐 ROLE-BASED DASHBOARD ROUTING
  // ============================================================================
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
  const [refreshSuccess, setRefreshSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [trendData, setTrendData] = useState({ labels: [], data: [] })
  const [comparison, setComparison] = useState(null)
  const [selectedRange, setSelectedRange] = useState("30d")

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

  // Get the days number from the selected range
  const getSelectedDays = useCallback(() => {
    return RANGE_OPTIONS.find(o => o.value === selectedRange)?.days || 30;
  }, [selectedRange]);

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async (showRefreshSpinner = false) => {
    try {
      if (showRefreshSpinner) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const days = getSelectedDays();
      const range = selectedRange;

      const [dashboardData, surveysData, trendsData, comparisonData] = await Promise.all([
        getExecutiveDashboard({ range })
          .catch(err => {
            console.warn("❌ Dashboard API error:", err.message);
            return null;
          }),

        listSurveys({ page: 1, limit: 10, sort: "-lastResponseAt" })
          .catch(err => {
            console.warn("❌ Surveys API error:", err.message);
            return { surveys: [], total: 0 };
          }),

        getDashboardTrends({ days })
          .catch(err => {
            console.warn("❌ Trends API error:", err.message);
            return { labels: [], data: [], responseCounts: [] };
          }),

        getDashboardComparison({ days })
          .catch(err => {
            console.warn("❌ Comparison API error:", err.message);
            return null;
          }),
      ]);

      // ================= DASHBOARD DATA =================
      const totalSurveysFromList = surveysData?.total || surveysData?.surveys?.length || 0;
      const kpis = dashboardData?.kpis || {};
      const rawMetrics = dashboardData?._raw?.metrics || {};

      const mappedStats = {
        totalSurveys: kpis.totalSurveys || rawMetrics.totalSurveys || totalSurveysFromList,
        activeResponses: kpis.totalResponses || rawMetrics.totalResponses || 0,
        completionRate: kpis.completionRate || rawMetrics.completionRate || 0,
        avgSatisfaction: kpis.avgSatisfaction || rawMetrics.averageRating || 0,
        npsScore: kpis.npsScore || rawMetrics.npsScore || 0,
        satisfactionIndex: kpis.satisfactionIndex || rawMetrics.satisfactionIndex || 0,
      };

      setStats(mappedStats);

      // ================= TREND DATA =================
      setTrendData(trendsData);

      // ================= COMPARISON DATA =================
      setComparison(comparisonData);

      // ================= SURVEYS DATA =================
      if (surveysData?.surveys) {
        const transformedSurveys = surveysData.surveys.map((survey) => ({
          id: survey.id || survey._id,
          name: survey.title,
          responses: survey.responseCount || 0,
          completion: survey.stats?.completionRate || 0,
          status:
            survey.status === "active" ? "Active" :
              survey.status === "completed" ? "Completed" :
                survey.status === "draft" ? "Draft" :
                  survey.status === "paused" ? "Paused" :
                    survey.status === "published" ? "Active" :
                      survey.status,
        }));

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
    }
  }, [selectedRange, getSelectedDays]);


  // Handle refresh button
  const handleRefresh = async () => {
    await fetchDashboardData(true);
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 2000);
  };

  // Handle range change
  const handleRangeChange = (rangeValue) => {
    setSelectedRange(rangeValue);
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

  // Fetch data on mount and when range changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Chart data
  const responseData = {
    labels: trendData.labels.length > 0 ? trendData.labels : [],
    datasets: [
      {
        label: "Avg Satisfaction Rating",
        data: trendData.data.length > 0 ? trendData.data : [],
        borderColor: "#054a4eff",
        backgroundColor: darkMode ? "rgba(5, 74, 78, 0.15)" : "rgba(5, 74, 78, 0.1)",
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
          label: function (context) {
            const idx = context.dataIndex;
            const rating = context.parsed.y;
            const responses = trendData.responseCounts?.[idx] || 0;
            return [
              `Rating: ${rating.toFixed(2)} / 5.0`,
              `Responses: ${responses}`,
            ];
          },
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
        max: 5,
        ticks: {
          color: darkMode ? "#cbd5e0" : "#495057",
          stepSize: 1,
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          borderColor: darkMode ? "#4a5568" : "#dee2e6",
        },
      },
    },
  }

  const currentSurveys = recentSurveys.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  // ============================================================================
  // HELPER: Render trend badge
  // ============================================================================
  const TrendBadge = ({ value, suffix = "vs last period" }) => {
    if (value === undefined || value === null || value === 0) return null;
    const isPositive = value > 0;
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1
        ${isPositive ? 'text-[var(--success-color)]' : 'text-[var(--danger-color)]'}`}>
        {isPositive ? <MdTrendingUp size={14} /> : <MdTrendingDown size={14} />}
        {isPositive ? "+" : ""}{Math.abs(value).toFixed(1)}% {suffix}
      </span>
    );
  };

  // ============================================================================
  // HELPER: Metric tooltip
  // ============================================================================
  const MetricTooltip = ({ text }) => (
    <div className="group/tip relative inline-flex ml-1">
      <MdInfo size={14} className="text-[var(--text-secondary)] opacity-50 cursor-help" />
      <div className="invisible group-hover/tip:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2
                      bg-[var(--dark-card)] text-[var(--dark-text)] text-xs rounded shadow-lg
                      whitespace-nowrap z-10 max-w-xs">
        {text}
      </div>
    </div>
  );

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
          <div className="flex gap-2 flex-wrap items-center">
            {/* Date Range Filter */}
            <div className="inline-flex rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] overflow-hidden">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleRangeChange(opt.value)}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer border-0
                    ${selectedRange === opt.value
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                         border border-[var(--light-border)] dark:border-[var(--dark-border)]
                         text-[var(--light-text)] dark:text-[var(--dark-text)]
                         bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                         hover:bg-[var(--light-hover)]/10 dark:hover:bg-[var(--dark-hover)]/10
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-300 cursor-pointer"
            >
              {refreshing ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdRefresh size={16} />
              )}
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            {/* Refresh success indicator */}
            {refreshSuccess && (
              <span className="inline-flex items-center gap-1 text-sm text-[var(--success-color)] transition-opacity duration-300">
                <MdCheckCircle size={16} />
                Updated
              </span>
            )}

            {canCreateSurvey && (
              <button
                onClick={createNewSurvey}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                           bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]
                           text-white transition-colors duration-300 cursor-pointer border-0"
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
              <div className="flex items-center">
                <p className="text-[var(--text-secondary)] text-sm">Total Surveys</p>
                <MetricTooltip text="Total number of surveys created in your organization" />
              </div>
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
              <div className="flex items-center">
                <p className="text-[var(--text-secondary)] text-sm">Active Responses</p>
                <MetricTooltip text="Total completed survey responses in the selected period" />
              </div>
              <TrendBadge value={comparison?.changes?.responseCount} />
            </div>

            {/* Completion Rate Card */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                            rounded-md shadow-md p-6
                            border border-[var(--light-border)] dark:border-[var(--dark-border)]
                            transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-md
                                bg-[var(--info-light)]">
                  <MdCheckCircle className="text-[var(--info-color)]" size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                {stats.completionRate}%
              </h3>
              <div className="flex items-center">
                <p className="text-[var(--text-secondary)] text-sm">Completion Rate</p>
                <MetricTooltip text="Percentage of started surveys that were fully completed" />
              </div>
            </div>

            {/* Avg Satisfaction Card */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                            rounded-md shadow-md p-6
                            border border-[var(--light-border)] dark:border-[var(--dark-border)]
                            transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-md
                                bg-[var(--warning-light)]">
                  <MdStarRate className="text-[var(--warning-color)]" size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
                {stats.activeResponses === 0 ? "—" : (typeof stats.avgSatisfaction === 'number' ? stats.avgSatisfaction.toFixed(2) : stats.avgSatisfaction)}
              </h3>
              <div className="flex items-center">
                <p className="text-[var(--text-secondary)] text-sm">Avg Satisfaction</p>
                <MetricTooltip text="Average rating across all survey responses (1-5 scale). Shows — when no responses exist." />
              </div>
              <TrendBadge value={comparison?.changes?.avgRating} />
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

                {/* Chart or Empty State */}
                {trendData.data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-80 text-[var(--text-secondary)]">
                    <MdShowChart size={48} className="mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-1">No trend data available yet</p>
                    <p className="text-sm">Collect more survey responses to see satisfaction trends</p>
                  </div>
                ) : (
                  <div className="w-full h-80">
                    <Line data={responseData} options={chartOptions} />
                  </div>
                )}
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
                                   text-white transition-colors duration-300 cursor-pointer border-0"
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
                                  {/* View Responses */}
                                  <Link 
                                    to={`/app/surveys/responses/${survey.id}`}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded
                                               text-[var(--primary-color)] hover:bg-[var(--primary-light)]
                                               transition-colors duration-200 relative group"
                                    aria-label={`View responses for ${survey.name}`}
                                  >
                                    <MdQuestionAnswer size={18} />
                                    <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                                     px-2 py-1 bg-[var(--dark-card)] text-[var(--dark-text)] text-xs rounded
                                                     whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                      View Responses
                                    </span>
                                  </Link>
                                  {/* View Analytics */}
                                  <Link 
                                    to={`/app/surveys/${survey.id}/analytics`}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded
                                               text-[var(--info-color)] hover:bg-[var(--info-light)]
                                               transition-colors duration-200 relative group"
                                    aria-label={`Analyze results for ${survey.name}`}
                                  >
                                    <MdBarChart size={18} />
                                    <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                                     px-2 py-1 bg-[var(--dark-card)] text-[var(--dark-text)] text-xs rounded
                                                     whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                      Analyze Results
                                    </span>
                                  </Link>
                                  {/* Survey Details */}
                                  <Link 
                                    to={`/app/surveys/detail/${survey.id}`}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded
                                               text-[var(--secondary-color)] hover:bg-gray-100 dark:hover:bg-gray-800
                                               transition-colors duration-200 relative group"
                                    aria-label={`View details for ${survey.name}`}
                                  >
                                    <MdInfo size={18} />
                                    <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                                     px-2 py-1 bg-[var(--dark-card)] text-[var(--dark-text)] text-xs rounded
                                                     whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                      Survey Details
                                    </span>
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
                                     transition-colors duration-300 cursor-pointer"
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
                                     transition-colors duration-300 cursor-pointer"
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