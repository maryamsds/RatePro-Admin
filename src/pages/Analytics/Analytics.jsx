// src\pages\Analytics\Analytics.jsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Container, Form, Button, Alert, Badge } from "react-bootstrap"
import {
  MdTrendingUp,
  MdTrendingDown,
  MdBarChart,
  MdPieChart,
  MdDownload,
  MdRefresh,
  MdAssessment,
  MdAccessTime,
  MdWarning
} from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import { getTenantSummary, getAllTrends, exportAnalyticsPDF, downloadFile } from "../../api/services/analyticsService"
import { toast } from "react-toastify"

const Analytics = ({ darkMode }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [dateRange, setDateRange] = useState("30")
  const [selectedMetric, setSelectedMetric] = useState("responses")

  // Data states
  const [metrics, setMetrics] = useState([])
  const [topSurveys, setTopSurveys] = useState([])
  const [responseData, setResponseData] = useState([])

  // Separate paginations
  const [surveyPagination, setSurveyPagination] = useState({ page: 1, limit: 3, total: 0 })
  const [activityPagination, setActivityPagination] = useState({ page: 1, limit: 5, total: 0 })

  // Map dateRange to API range format
  const getApiRange = (range) => {
    const rangeMap = {
      "7": "7d",
      "30": "30d",
      "90": "90d",
      "365": "365d"
    }
    return rangeMap[range] || "30d"
  }

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setError(null)
      const apiRange = getApiRange(dateRange)

      // Fetch data from backend APIs
      const [summaryData, trendsData] = await Promise.all([
        getTenantSummary({ range: apiRange }),
        getAllTrends({ range: apiRange })
      ])

      console.log("summaryData", summaryData)
      console.log("trendsData", trendsData)

      // Transform summary data into metrics cards
      const transformedMetrics = [
        {
          title: "Total Responses",
          value: formatNumber(summaryData.totalResponses || 0),
          change: formatChange(summaryData.trends?.responsesOverTime),
          trend: getTrendDirection(summaryData.trends?.responsesOverTime),
          icon: MdBarChart,
          color: "primary",
        },
        {
          title: "Overall Satisfaction",
          value: `${(summaryData.overallSatisfaction || 0).toFixed(1)}%`,
          change: formatChange(summaryData.trends?.satisfactionOverTime),
          trend: getTrendDirection(summaryData.trends?.satisfactionOverTime),
          icon: MdTrendingUp,
          color: "success",
        },
        {
          title: "NPS Score",
          value: (summaryData.overallNPS || 0).toFixed(0),
          change: formatChange(summaryData.trends?.npsOverTime),
          trend: getTrendDirection(summaryData.trends?.npsOverTime),
          icon: MdAccessTime,
          color: "info",
        },
        {
          title: "Active Surveys",
          value: formatNumber(summaryData.activeSurveys || 0),
          change: `${summaryData.totalSurveys || 0} total`,
          trend: "neutral",
          icon: MdPieChart,
          color: "warning",
        },
      ]
      setMetrics(transformedMetrics)

      // Transform top surveys
      const transformedSurveys = (summaryData.topSurveys || []).map(survey => ({
        id: survey.id,
        name: survey.title || "Untitled Survey",
        responses: survey.responseCount || 0,
        completion: 100, // Not available from summary, default to 100
        avgRating: survey.avgRating || 0,
        nps: survey.nps || 0,
        category: "Survey",
      }))
      setTopSurveys(transformedSurveys)
      setSurveyPagination(prev => ({ ...prev, total: transformedSurveys.length }))

      // Transform volume trend data for response activity table
      const volumeLabels = trendsData.volume?.labels || []
      const volumeResponses = trendsData.volume?.responses || []
      const transformedResponseData = volumeLabels.map((label, index) => ({
        date: formatTrendLabel(label),
        responses: volumeResponses[index] || 0,
        completion: calculateCompletionFromIndex(volumeResponses, index),
      })).slice(-10) // Last 10 data points
      setResponseData(transformedResponseData)
      setActivityPagination(prev => ({ ...prev, total: transformedResponseData.length }))

    } catch (err) {
      console.error("Error fetching analytics data:", err)
      setError(err.message || "Failed to load analytics data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [dateRange])

  console.log("metrics", metrics)
  console.log("topSurveys", topSurveys)
  console.log("responseData", responseData)

  // Initial load
  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalyticsData()
    toast.success("Analytics refreshed successfully")
  }

  // Handle export
  const handleExport = async () => {
    try {
      setExporting(true)
      // Export tenant-wide analytics - use a placeholder survey ID or export all
      // Since there's no single survey, we'll show info message
      toast.info("Export functionality requires a specific survey. Please visit Survey Analytics for detailed exports.")
    } catch (err) {
      console.error("Export error:", err)
      toast.error("Failed to export analytics")
    } finally {
      setExporting(false)
    }
  }

  // Helper functions
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatChange = (trendArray) => {
    if (!Array.isArray(trendArray) || trendArray.length < 2) return "N/A"
    const recent = trendArray[trendArray.length - 1]?.value || trendArray[trendArray.length - 1] || 0
    const previous = trendArray[trendArray.length - 2]?.value || trendArray[trendArray.length - 2] || 0
    if (previous === 0) return "+0%"
    const change = ((recent - previous) / previous) * 100
    return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`
  }

  const getTrendDirection = (trendArray) => {
    if (!Array.isArray(trendArray) || trendArray.length < 2) return "neutral"
    const recent = trendArray[trendArray.length - 1]?.value || trendArray[trendArray.length - 1] || 0
    const previous = trendArray[trendArray.length - 2]?.value || trendArray[trendArray.length - 2] || 0
    if (recent > previous) return "up"
    if (recent < previous) return "down"
    return "neutral"
  }

  const formatTrendLabel = (label) => {
    // If label is a date string, format it; otherwise return as-is
    if (!label) return ""
    try {
      const date = new Date(label)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0]
      }
    } catch {
      // Not a valid date
    }
    return label
  }

  const calculateCompletionFromIndex = (responses, index) => {
    // Calculate a pseudo-completion rate based on response volume trends
    if (!responses.length) return 0
    const max = Math.max(...responses)
    if (max === 0) return 0
    return Math.round((responses[index] / max) * 100)
  }

  // Pagination derived data
  const currentSurveys = topSurveys.slice(
    (surveyPagination.page - 1) * surveyPagination.limit,
    surveyPagination.page * surveyPagination.limit
  )

  const currentResponses = responseData.slice(
    (activityPagination.page - 1) * activityPagination.limit,
    activityPagination.page * activityPagination.limit
  )



  // Loading state
  if (loading) {
    return (
      <div className="analytics-container">
        <div className="analytics-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="analytics-container">
        <Container fluid className="p-0">
          <Alert variant="danger" className="m-4">
            <Alert.Heading>
              <MdWarning className="me-2" />
              Failed to Load Analytics
            </Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={handleRefresh}>
              <MdRefresh className="me-2" />
              Try Again
            </Button>
          </Alert>
        </Container>
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
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="icon-btn"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <MdRefresh className={refreshing ? "spin" : ""} />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  <MdDownload className="me-2" />
                  {exporting ? "Exporting..." : "Export"}
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
                  <div className={`stat-trend ${metric.trend === "up" ? "trend-up" : metric.trend === "down" ? "trend-down" : "trend-neutral"}`}>
                    {metric.trend === "up" && <MdTrendingUp />}
                    {metric.trend === "down" && <MdTrendingDown />}
                    <span>{metric.change}</span>
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
              <div className="chart-container d-flex justify-content-center align-items-center">
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
                {currentSurveys.length > 0 ? (
                  currentSurveys.map((survey, index) => (
                    <div key={survey.id || index} className="survey-item">
                      <div className="survey-info">
                        <div className="survey-name">{survey.name}</div>
                        <div className="survey-category">{survey.category}</div>
                        <div className="survey-stats">
                          <span>{survey.responses.toLocaleString()} responses</span>
                          {survey.avgRating > 0 && <span>{survey.avgRating.toFixed(1)}★</span>}
                        </div>
                      </div>
                      <div className="survey-rating">
                        {survey.nps !== 0 && (
                          <Badge bg={survey.nps >= 50 ? "success" : survey.nps >= 0 ? "warning" : "danger"}>
                            NPS: {survey.nps}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state text-center py-4">
                    <MdBarChart className="text-muted mb-2" size={32} />
                    <p className="text-muted mb-0">No surveys available yet</p>
                  </div>
                )}
              </div>
              {topSurveys.length > 0 && (
                <div className="pagination-section">
                  <Pagination
                    current={surveyPagination.page}
                    total={surveyPagination.total}
                    limit={surveyPagination.limit}
                    onChange={(page) => setSurveyPagination((prev) => ({ ...prev, page }))}
                  />
                </div>
              )}
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
            {responseData.length > 0 ? (
              <>
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
                      {currentResponses.map((data, index) => {
                        const globalIndex = (activityPagination.page - 1) * activityPagination.limit + index
                        const previousData = globalIndex > 0 ? responseData[globalIndex - 1] : null
                        return (
                          <div key={index} className="table-row">
                            <div className="table-cell">
                              <span className="date-text">{data.date}</span>
                            </div>
                            <div className="table-cell">
                              <span className="response-count">{data.responses.toLocaleString()}</span>
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
                              {previousData ? (
                                <span className={data.responses > previousData.responses ? "trend-up" : data.responses < previousData.responses ? "trend-down" : "trend-neutral"}>
                                  {data.responses > previousData.responses ? <MdTrendingUp /> : data.responses < previousData.responses ? <MdTrendingDown /> : "-"}
                                </span>
                              ) : (
                                <span className="trend-neutral">-</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Mobile Cards View */}
                <div className="activity-cards d-md-none">
                  {currentResponses.map((data, index) => {
                    const globalIndex = (activityPagination.page - 1) * activityPagination.limit + index
                    const previousData = globalIndex > 0 ? responseData[globalIndex - 1] : null
                    return (
                      <div key={index} className="activity-card">
                        <div className="activity-card-header">
                          <span className="activity-date">{data.date}</span>
                          {previousData && (
                            <span className={data.responses > previousData.responses ? "trend-up" : data.responses < previousData.responses ? "trend-down" : "trend-neutral"}>
                              {data.responses > previousData.responses ? <MdTrendingUp /> : data.responses < previousData.responses ? <MdTrendingDown /> : null}
                            </span>
                          )}
                        </div>
                        <div className="activity-card-body">
                          <div className="activity-meta">
                            <div className="meta-item">
                              <span className="meta-label">Responses:</span>
                              <span className="meta-value">{data.responses.toLocaleString()}</span>
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
                    )
                  })}
                </div>

                <div className="pagination-section">
                  <Pagination
                    current={activityPagination.page}
                    total={activityPagination.total}
                    limit={activityPagination.limit}
                    onChange={(page) => setActivityPagination((prev) => ({ ...prev, page }))}
                  />
                </div>
              </>
            ) : (
              <div className="empty-state text-center py-5">
                <MdBarChart className="text-muted mb-3" size={48} />
                <h5 className="text-muted">No Response Data Available</h5>
                <p className="text-muted mb-0">Response activity data will appear here once surveys start receiving responses.</p>
              </div>
            )}
          </div>
        </div>

      </Container>
    </div>
  )
}

export default Analytics