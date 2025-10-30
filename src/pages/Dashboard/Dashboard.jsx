// src\pages\Dashboard\Dashboard.jsx
"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Table, Badge, ProgressBar } from "react-bootstrap"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js"
import {
  MdDashboard,
  MdPoll,
  MdPeople,
  MdTrendingUp,
  MdTrendingDown,
  MdAccessTime,
  MdVisibility,
  MdEdit,
  MdMoreVert,
  MdRefresh,
  MdDownload,
  MdAdd,
  MdBarChart,
  MdShowChart,
  MdPieChart,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import { Link, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { useAuth } from "../../context/AuthContext.jsx"


// Register Chart.js components including Filler
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
)

const Dashboard = ({ darkMode, limit = 5 }) => {
  const [stats, setStats] = useState({
    totalSurveys: 24,
    activeResponses: 1247,
    completionRate: 78.5,
    avgResponseTime: "3.2 min",
  })

  const [recentSurveys, setRecentSurveys] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const { user } = useAuth();

  const createNewSurvey = () => {
    navigate("/app/surveys/create");
  };

  const ViewTrendsAnalytics = () => {
    navigate("/app/analytics/trends");
  };

  const ViewRecentSurveys = () => {
    navigate("/app/surveys/responses");
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


  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setRecentSurveys([
        { id: 1, name: "Customer Satisfaction Q4", responses: 156, status: "Active", completion: 85 },
        { id: 2, name: "Product Feedback Survey", responses: 89, status: "Active", completion: 67 },
        { id: 3, name: "Employee Engagement", responses: 234, status: "Completed", completion: 100 },
        { id: 4, name: "Market Research Study", responses: 45, status: "Draft", completion: 0 },
        { id: 5, name: "User Experience Survey", responses: 178, status: "Active", completion: 92 },
        { id: 6, name: "Brand Awareness Survey", responses: 67, status: "Active", completion: 45 },
        { id: 7, name: "Website Usability Test", responses: 123, status: "Completed", completion: 100 },
        { id: 8, name: "Training Effectiveness", responses: 89, status: "Active", completion: 73 },
        { id: 9, name: "Customer Support Feedback", responses: 156, status: "Active", completion: 88 },
        { id: 10, name: "Product Launch Survey", responses: 234, status: "Draft", completion: 15 },
      ])
      setPagination((prev) => ({ ...prev, total: 10 }))
      setLoading(false)
    }, 1000)
  }, [])

  // Chart data with visible colors for both light and dark modes
  const responseData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Responses",
        data: [65, 78, 90, 81, 96, 105],
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

  const surveyTypeData = {
    labels: ["Customer Satisfaction", "Product Feedback", "Employee Engagement", "Market Research", "Other"],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          "#0d6efd",
          "#198754",
          "#ffc107",
          "#dc3545",
          "#6c757d",
        ],
        borderColor: darkMode ? "#1e293b" : "#ffffff",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  }

  const completionData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Completion Rate %",
        data: [75, 82, 78, 85],
        backgroundColor: "#054a4eff",
        borderColor: "#012a2dff",
        borderWidth: 0,
        borderRadius: 8,
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
          labelTextColor: function() {
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: darkMode ? "#e9ecef" : "#212529",
          usePointStyle: true,
          padding: 15,
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
          labelTextColor: function() {
            return darkMode ? "#e9ecef" : "#495057";
          }
        }
      },
    },
  }

  const getStatusBadge = (status) => {
    const variants = {
      Active: "success",
      Completed: "primary",
      Draft: "secondary",
      Paused: "warning",
    }
    return (
      <Badge bg={variants[status] || "secondary"} className="badge-enhanced">
        {status}
      </Badge>
    )
  }

  const currentSurveys = recentSurveys.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  useEffect(() => {
    setTimeout(() => {
      const dummyResponses = [
        {
          id: 1,
          surveyId: 1,
          surveyTitle: "Customer Satisfaction Survey",
          respondent: "John Doe",
          email: "john.doe@example.com",
          submittedAt: "2023-06-01 14:32",
          satisfaction: 4.5,
        },
        {
          id: 2,
          surveyId: 1,
          surveyTitle: "Customer Satisfaction Survey",
          respondent: "Jane Smith",
          email: "jane.smith@example.com",
          submittedAt: "2023-06-01 13:15",
          satisfaction: 3.8,
        },
        {
          id: 3,
          surveyId: 2,
          surveyTitle: "Product Feedback Survey",
          respondent: "Robert Johnson",
          email: "robert.j@example.com",
          submittedAt: "2023-06-01 11:45",
          satisfaction: 4.2,
        },
        {
          id: 4,
          surveyId: 4,
          surveyTitle: "Website Usability Survey",
          respondent: "Emily Davis",
          email: "emily.d@example.com",
          submittedAt: "2023-05-31 16:20",
          satisfaction: 4.0,
        },
        {
          id: 5,
          surveyId: 1,
          surveyTitle: "Customer Satisfaction Survey",
          respondent: "Michael Wilson",
          email: "michael.w@example.com",
          submittedAt: "2023-05-31 15:10",
          satisfaction: 4.7,
        },
      ]

      setResponses(dummyResponses.slice(0, limit))
      setLoading(false)
    }, 800)
  }, [limit])

  const getSatisfactionVariant = (score) => {
    if (score >= 4.5) return "success"
    if (score >= 3.5) return "primary"
    if (score >= 2.5) return "warning"
    return "danger"
  }

  // if (loading) {
  //   return (
  //     <Container fluid className="dashboard-container">
  //       <div className="loading-container">
  //         <div className="loading-spinner"></div>
  //         <p className="loading-text">Loading dashboard...</p>
  //       </div>
  //     </Container>
  //   )
  // }

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
            <Button variant="outline-secondary" size="sm">
              <MdRefresh size={16} className="me-1" />
              Refresh
            </Button>
            <Button variant="outline-secondary" size="sm">
              <MdDownload size={16} className="me-1" />
              Export
            </Button>
            <Button variant="primary" onClick={createNewSurvey} size="sm">
              <MdAdd size={16} className="me-1" />
              New Survey
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col xl={3} lg={6} md={6} xs={12}>
          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-icon icon-primary">
                <MdPoll />
              </div>
              <div className="stats-trend trend-up">
                <MdTrendingUp size={14} />
                <span>+12%</span>
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
              <div className="stats-trend trend-up">
                <MdTrendingUp size={14} />
                <span>+8%</span>
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
              <div className="stats-trend trend-up">
                <MdTrendingUp size={14} />
                <span>+5%</span>
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
              <div className="stats-trend trend-down">
                <MdTrendingDown size={14} />
                <span>-2%</span>
              </div>
            </div>
            <div className="stats-card-body">
              <h3>{stats.avgResponseTime}</h3>
              <p>Avg Response Time</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-3 mb-4">
        <Col lg={8}>
          <div className="chart-card">
            <h5>
              <MdShowChart size={20} style={{ marginBottom: '2px' }} />
              Response Trends
              <Button 
                variant="link" 
                onClick={ViewTrendsAnalytics} 
                size="sm" 
                className="float-end"
                style={{ textDecoration: 'none' }}
              >
                View Details →
              </Button>
            </h5>
            <div className="chart-container">
              <Line data={responseData} options={chartOptions} />
            </div>
          </div>
        </Col>
        <Col lg={4}>
          <div className="chart-card">
            <h5>
              <MdPieChart size={20} style={{ marginBottom: '2px' }} />
              Survey Types Distribution
            </h5>
            <div className="chart-container">
              <Doughnut data={surveyTypeData} options={doughnutOptions} />
            </div>
          </div>
        </Col>
      </Row>

      {/* Recent Surveys and Completion Rates */}
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
                        <div style={{ fontWeight: 500 }}>{survey.name}</div>
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
                          <button className="action-button" title="View Survey">
                            <MdVisibility size={18} />
                          </button>
                          <button className="action-button" title="Edit Survey">
                            <MdEdit size={18} />
                          </button>
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
            </div>
          </div>
        </Col>
        
        <Col lg={4}>
          <div className="chart-card">
            <h5>
              <MdBarChart size={20} style={{ marginBottom: '2px' }} />
              Weekly Completion
            </h5>
            <div className="chart-container">
              <Bar data={completionData} options={chartOptions} />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Dashboard
