// src\pages\Dashboard\Dashboard.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Card, Button, Table, Badge, ProgressBar, Spinner } from "react-bootstrap"
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
  MdVisibility,
  MdEdit,
  MdMoreVert,
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
    avgResponseTime: "-- min",
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
    navigate("/app/surveys/responses");
  };

  // Fetch dashboard data from API
  // const fetchDashboardData = useCallback(async (showRefreshSpinner = false) => {
  //   try {
  //     if (showRefreshSpinner) setRefreshing(true);
  //     else setLoading(true);
  //     setError(null);

  //     // Fetch dashboard stats and recent surveys in parallel
  //     const [dashboardData, surveysData] = await Promise.all([
  //       getExecutiveDashboard().catch(err => {
  //         console.warn("Dashboard API error, using fallback:", err.message);
  //         return null;
  //       }),
  //       listSurveys({ page: 1, limit: 10, sort: "-createdAt" }).catch(err => {
  //         console.warn("Surveys API error:", err.message);
  //         return { surveys: [], total: 0 };
  //       }),
  //     ]);

  //     // Update stats from dashboard API
  //     if (dashboardData) {
  //       setStats({
  //         totalSurveys: dashboardData.kpis?.totalSurveys || 0,
  //         activeResponses: dashboardData.kpis?.totalResponses || 0,
  //         completionRate: dashboardData.kpis?.completionRate || 0,
  //         avgResponseTime: dashboardData.kpis?.avgResponseTime || "-- min",
  //         npsScore: dashboardData.kpis?.npsScore || 0,
  //         satisfactionIndex: dashboardData.kpis?.satisfactionIndex || 0,
  //       });

  //       // Set trend data for chart
  //       if (dashboardData.trends?.responses) {
  //         setTrendData({
  //           labels: dashboardData.trends.responses.labels || [],
  //           data: dashboardData.trends.responses.data || [],
  //         });
  //       }
  //     }

  //     // Update recent surveys
  //     if (surveysData?.surveys) {
  //       const transformedSurveys = surveysData.surveys.map((survey) => ({
  //         id: survey.id || survey._id,
  //         name: survey.title,
  //         responses: survey.responseCount || 0,
  //         status: survey.status === "active" ? "Active" :
  //           survey.status === "completed" ? "Completed" :
  //             survey.status === "draft" ? "Draft" :
  //               survey.status === "paused" ? "Paused" : survey.status,
  //         completion: survey.stats?.completionRate || 0,
  //       }));
  //       setRecentSurveys(transformedSurveys);
  //       setPagination(prev => ({ ...prev, total: surveysData.total || transformedSurveys.length }));
  //     }

  //   } catch (err) {
  //     console.error("Dashboard fetch error:", err);
  //     setError("Failed to load dashboard data. Please try again.");
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // }, []);
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

        listSurveys({ page: 1, limit: 10, sort: "-createdAt" })
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
        avgResponseTime: kpis.avgResponseTime || rawMetrics.avgResponseTime || "-- min",
        npsScore: kpis.npsScore || rawMetrics.npsScore || 0,
        satisfactionIndex: kpis.satisfactionIndex || rawMetrics.satisfactionIndex || 0,
      };

      console.log("📈 Final Mapped Stats:", mappedStats);
      console.log("📊 Fallback used for totalSurveys:", !kpis.totalSurveys);
      console.groupEnd();

      setStats(mappedStats);

      // ================= TREND DATA =================
      console.group("📈 Trend Data Mapping");

      if (dashboardData?.trends?.responses) {
        const trendLabels = dashboardData.trends.responses.labels || [];
        const trendDataValues = dashboardData.trends.responses.data || [];

        console.log("Labels:", trendLabels);
        console.log("Data:", trendDataValues);

        setTrendData({
          labels: trendLabels,
          data: trendDataValues,
        });
      } else {
        console.warn("⚠️ No trend data available, using fallback");
        // Generate placeholder trend from survey responses
        setTrendData({
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          data: [0, 0, 0, mappedStats.activeResponses],
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
          // Backend returns totalResponses directly on survey object
          responses: survey.totalResponses || 0,
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
    <Container fluid className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h2>Dashboard Overview</h2>
            <p>Welcome back! Here's what's happening with your surveys today.</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Spinner animation="border" size="sm" className="me-1" />
              ) : (
                <MdRefresh size={16} className="me-1" />
              )}
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            {canCreateSurvey && (
              <Button variant="primary" onClick={createNewSurvey} size="sm">
                <MdAdd size={16} className="me-1" />
                New Survey
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <span>{error}</span>
          <Button variant="link" className="ms-auto p-0" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <Row className="g-3 mb-4">
            <Col xl={3} lg={6} md={6} xs={12}>
              <div className="stats-card">
                <div className="stats-card-header">
                  <div className="stats-icon icon-primary">
                    <MdPoll />
                  </div>
                </div>
                <div className="stats-card-body">
                  <h3>{stats.totalSurveys}</h3>
                  <p>Total Surveys</p>
                </div>
              </div>
            </Col>

            <Col xl={3} lg={6} md={6} xs={12}>
              <div className="stats-card">
                <div className="stats-card-header">
                  <div className="stats-icon icon-success">
                    <MdPeople />
                  </div>
                </div>
                <div className="stats-card-body">
                  <h3>{stats.activeResponses.toLocaleString()}</h3>
                  <p>Active Responses</p>
                </div>
              </div>
            </Col>

            <Col xl={3} lg={6} md={6} xs={12}>
              <div className="stats-card">
                <div className="stats-card-header">
                  <div className="stats-icon icon-info">
                    <MdTrendingUp />
                  </div>
                </div>
                <div className="stats-card-body">
                  <h3>{stats.completionRate}%</h3>
                  <p>Completion Rate</p>
                </div>
              </div>
            </Col>

            <Col xl={3} lg={6} md={6} xs={12}>
              <div className="stats-card">
                <div className="stats-card-header">
                  <div className="stats-icon icon-warning">
                    <MdAccessTime />
                  </div>
                </div>
                <div className="stats-card-body">
                  <h3>{stats.avgResponseTime}</h3>
                  <p>Avg Response Time</p>
                </div>
              </div>
            </Col>
          </Row>

          {/* Charts Row - Only show if user can view analytics */}
          {canViewAnalytics && (
            <Row className="g-3 mb-4">
              <Col lg={12}>
                <div className="chart-card">
                  <h5 className="d-flex align-items-center gap-2">
                    <MdShowChart size={20} />
                    Response Trends
                    <Button
                      variant="link"
                      onClick={ViewTrendsAnalytics}
                      size="sm"
                      className="ms-auto text-decoration-none"
                    >
                      View Details →
                    </Button>
                  </h5>
                  <div className="chart-container d-flex justify-content-center align-items-center">
                    <Line data={responseData} options={chartOptions} />
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {/* Recent Surveys and Completion Rates - Only show if user can view surveys */}
          {canViewSurveys ? (
            <Row className="g-3">
              <Col lg={8}>
                <div className="recent-surveys-section">
                  <div className="section-header">
                    <h5>
                      <MdPoll size={20} />
                      Recent Surveys
                    </h5>
                    <Button
                      variant="link"
                      onClick={ViewRecentSurveys}
                      size="sm"
                      style={{ textDecoration: 'none' }}
                    >
                      View All →
                    </Button>
                  </div>
                  <div className="table-container">
                    {recentSurveys.length === 0 ? (
                      <div className="text-center py-5">
                        <MdPoll size={48} className="text-muted mb-3" />
                        <h6 className="text-muted">No surveys yet</h6>
                        <p className="text-muted small mb-3">Create your first survey to get started</p>
                        {canCreateSurvey && (
                          <Button variant="primary" size="sm" onClick={createNewSurvey}>
                            <MdAdd size={16} className="me-1" />
                            Create Survey
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        <Table className="custom-table" hover responsive>
                          <thead>
                            <tr>
                              <th>Survey Name</th>
                              <th className="d-none d-md-table-cell">Responses</th>
                              <th>Status</th>
                              <th className="d-none d-lg-table-cell">Progress</th>
                              <th className="text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentSurveys.map((survey) => (
                              <tr key={survey.id}>
                                <td>
                                  <Link
                                    to={`/app/surveys/${survey.id}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                  >
                                    <div style={{ fontWeight: 500 }}>{survey.name}</div>
                                  </Link>
                                  <small className="d-md-none text-muted">{survey.responses} responses</small>
                                </td>
                                <td className="d-none d-md-table-cell">
                                  <strong>{survey.responses}</strong>
                                </td>
                                <td>
                                  <span className={`status-badge status-${survey.status.toLowerCase()}`}>
                                    {survey.status}
                                  </span>
                                </td>
                                <td className="d-none d-lg-table-cell">
                                  <div className="progress-container" style={{ width: '120px' }}>
                                    <div className="progress-bar-wrapper">
                                      <div
                                        className="progress-bar-fill"
                                        style={{ width: `${survey.completion}%` }}
                                      ></div>
                                    </div>
                                    <span className="progress-text">{survey.completion}%</span>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <div className="d-flex gap-1 justify-content-center">
                                    <Link to={`/app/surveys/${survey.id}`} className="action-button" title="View Survey">
                                      <MdVisibility size={18} />
                                    </Link>
                                    <Link to={`/app/surveys/${survey.id}/edit`} className="action-button" title="Edit Survey">
                                      <MdEdit size={18} />
                                    </Link>
                                    <button className="action-button" title="More Options">
                                      <MdMoreVert size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        <div className="pagination-container">
                          <div className="pagination-info">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} surveys
                          </div>
                          <div className="pagination-controls">
                            <button
                              className="pagination-button"
                              disabled={pagination.page === 1}
                              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                            >
                              <MdChevronLeft size={18} />
                              Previous
                            </button>
                            <button
                              className="pagination-button"
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
              </Col>

              {/* Weekly Completion chart removed - no backend API support */}
            </Row>
          ) : (
            /* Fallback for users without survey permissions */
            <Row className="g-3">
              <Col lg={12}>
                <div className="text-center py-5">
                  <MdPoll size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">Limited Access</h6>
                  <p className="text-muted small">You don't have permission to view surveys. Contact your administrator for access.</p>
                </div>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  )
}

export default Dashboard