// src\pages\Analytics\Analytics.jsx

"use client"

import { useState, useEffect } from "react"
import { Container, Form, Button, Table, Badge } from "react-bootstrap"
import { 
  MdTrendingUp, 
  MdTrendingDown, 
  MdBarChart, 
  MdPieChart, 
  MdDownload, 
  MdRefresh,
  MdAssessment,
  MdInsertChart,
  MdTimeline
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"

const Analytics = ({ darkMode }) => {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30")
  const [selectedMetric, setSelectedMetric] = useState("responses")

  // Separate paginations
  const [surveyPagination, setSurveyPagination] = useState({ page: 1, limit: 1, total: 0 })
  const [activityPagination, setActivityPagination] = useState({ page: 1, limit: 1, total: 0 })


  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setSurveyPagination((prev) => ({ ...prev, total: topSurveys.length }))
      setActivityPagination((prev) => ({ ...prev, total: responseData.length }))
      setLoading(false)
    }, 1000)
  }, [])
  

  const metrics = [
    {
      title: "Total Responses",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: MdBarChart,
      color: "primary",
    },
    {
      title: "Completion Rate",
      value: "78.3%",
      change: "+5.2%",
      trend: "up",
      icon: MdTrendingUp,
      color: "success",
    },
    {
      title: "Avg Response Time",
      value: "3.2 min",
      change: "-8.1%",
      trend: "down",
      icon: MdTrendingDown,
      color: "info",
    },
    {
      title: "Survey Engagement",
      value: "85.7%",
      change: "+3.4%",
      trend: "up",
      icon: MdPieChart,
      color: "warning",
    },
  ]

  const topSurveys = [
    {
      name: "Customer Satisfaction Q4",
      responses: 456,
      completion: 89,
      avgRating: 4.2,
      category: "Customer Feedback",
    },
    {
      name: "Product Feedback Survey",
      responses: 234,
      completion: 76,
      avgRating: 3.8,
      category: "Product Development",
    },
    {
      name: "Employee Engagement",
      responses: 189,
      completion: 92,
      avgRating: 4.5,
      category: "HR",
    },
    {
      name: "Market Research Study",
      responses: 167,
      completion: 68,
      avgRating: 3.9,
      category: "Market Research",
    },
    {
      name: "Website Usability Test",
      responses: 143,
      completion: 84,
      avgRating: 4.1,
      category: "UX Research",
    },
    {
      name: "Brand Awareness Survey",
      responses: 98,
      completion: 71,
      avgRating: 3.7,
      category: "Marketing",
    },
  ]

  const responseData = [
    { date: "2024-01-15", responses: 45, completion: 78 },
    { date: "2024-01-16", responses: 52, completion: 82 },
    { date: "2024-01-17", responses: 38, completion: 75 },
    { date: "2024-01-18", responses: 61, completion: 85 },
    { date: "2024-01-19", responses: 47, completion: 79 },
    { date: "2024-01-20", responses: 55, completion: 88 },
  ]

  const currentSurveys = topSurveys.slice(
    (surveyPagination.page - 1) * surveyPagination.limit,
    surveyPagination.page * surveyPagination.limit
  )

  const currentResponses = responseData.slice(
    (activityPagination.page - 1) * activityPagination.limit,
    activityPagination.page * activityPagination.limit
  )
  
  

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="analytics-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-container">
      <Container fluid className="p-0">
        {/* Modern Header Section */}
        <div className="page-header-section">
          <div className="header-content">
            <div className="header-main w-100 d-flex justify-content-between align-items-center">
              <div className="page-title-section">
                <div className="page-icon">
                  <MdAssessment />
                </div>
                <div className="page-info">
                  <h1 className="page-title">Analytics Dashboard</h1>
                  <p className="page-subtitle">Comprehensive insights and performance metrics</p>
                </div>
              </div>
              <div className="header-actions">
                <Form.Select
                  size="sm"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="date-range-select"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 3 months</option>
                  <option value="365">Last year</option>
                </Form.Select>
                <Button variant="outline-secondary" size="sm" className="icon-btn">
                  <MdRefresh />
                </Button>
                <Button variant="primary" size="sm">
                  <MdDownload className="me-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stats-grid">
            {metrics.map((metric, index) => (
              <div key={index} className="stat-card">
                <div className={`stat-icon stat-icon-${metric.color}`}>
                  <metric.icon />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{metric.value}</div>
                  <div className="stat-label">{metric.title}</div>
                  <div className={`stat-trend ${metric.trend === "up" ? "trend-up" : "trend-down"}`}>
                    {metric.trend === "up" ? <MdTrendingUp /> : <MdTrendingDown />}
                    {metric.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid analytics-grid">
          {/* Chart Area */}
          <div className="chart-section">
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <h3>Response Trends</h3>
                  <p>Track performance over time</p>
                </div>
                <div className="section-actions">
                  <Form.Select
                    size="sm"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="metric-select"
                  >
                    <option value="responses">Responses</option>
                    <option value="completion">Completion Rate</option>
                    <option value="engagement">Engagement</option>
                  </Form.Select>
                </div>
              </div>
              <div className="chart-container">
                <div className="chart-placeholder">
                  <div className="placeholder-content">
                    <MdBarChart className="placeholder-icon" />
                    <p className="placeholder-text">Chart visualization would appear here</p>
                    <small className="placeholder-hint">Integration with Chart.js or similar library</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Surveys Sidebar */}
          <div className="sidebar-section">
            <div className="section-card">
              <div className="section-header">
                <div className="section-title">
                  <h3>Top Performing Surveys</h3>
                  <p>Best engagement metrics</p>
                </div>
              </div>
              <div className="surveys-list">
                {currentSurveys.map((survey, index) => (
                  <div key={index} className="survey-item">
                    <div className="survey-info">
                      <div className="survey-name">{survey.name}</div>
                      <div className="survey-category">{survey.category}</div>
                      <div className="survey-stats">
                        <span>{survey.responses} responses</span>
                        <span>{survey.completion}% complete</span>
                      </div>
                    </div>
                    <div className="survey-rating">
                      <Badge bg="primary">{survey.avgRating}★</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pagination-section">
                <Pagination
                  current={surveyPagination.page}
                  total={surveyPagination.total}
                  limit={surveyPagination.limit}
                  onChange={(page) => setSurveyPagination((prev) => ({ ...prev, page }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Table Section */}
        <div className="activity-section">
          <div className="section-card">
            <div className="section-header">
              <div className="section-title">
                <h3>Daily Response Activity</h3>
                <p>Detailed performance breakdown</p>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="activity-table d-none d-md-block">
              <div className="modern-table">
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">Date</div>
                    <div className="table-cell">Responses</div>
                    <div className="table-cell">Completion Rate</div>
                    <div className="table-cell">Trend</div>
                  </div>
                </div>
                <div className="table-body">
                  {currentResponses.map((data, index) => (
                    <div key={index} className="table-row">
                      <div className="table-cell">
                        <span className="date-text">{data.date}</span>
                      </div>
                      <div className="table-cell">
                        <span className="response-count">{data.responses}</span>
                      </div>
                      <div className="table-cell">
                        <div className="completion-wrapper">
                          <div className="progress-bar-wrapper">
                            <div className="progress-fill" style={{ width: `${data.completion}%` }}></div>
                          </div>
                          <span className="completion-text">{data.completion}%</span>
                        </div>
                      </div>
                      <div className="table-cell">
                        {index > 0 && responseData[index - 1] ? (
                          <span className={data.responses > responseData[index - 1].responses ? "trend-up" : "trend-down"}>
                            {data.responses > responseData[index - 1].responses ? <MdTrendingUp /> : <MdTrendingDown />}
                          </span>
                        ) : (
                          <span className="trend-neutral">-</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="activity-cards d-md-none">
              {currentResponses.map((data, index) => (
                <div key={index} className="activity-card">
                  <div className="activity-card-header">
                    <span className="activity-date">{data.date}</span>
                    {index > 0 && responseData[index - 1] && (
                      <span className={data.responses > responseData[index - 1].responses ? "trend-up" : "trend-down"}>
                        {data.responses > responseData[index - 1].responses ? <MdTrendingUp /> : <MdTrendingDown />}
                      </span>
                    )}
                  </div>
                  <div className="activity-card-body">
                    <div className="activity-meta">
                      <div className="meta-item">
                        <span className="meta-label">Responses:</span>
                        <span className="meta-value">{data.responses}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Completion:</span>
                        <div className="completion-wrapper">
                          <div className="progress-bar-wrapper">
                            <div className="progress-fill" style={{ width: `${data.completion}%` }}></div>
                          </div>
                          <span className="completion-text">{data.completion}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination-section">
              <Pagination
                current={activityPagination.page}
                total={activityPagination.total}
                limit={activityPagination.limit}
                onChange={(page) => setActivityPagination((prev) => ({ ...prev, page }))}
              />
            </div>
          </div>
        </div>

      </Container>
    </div>
  )
}

export default Analytics