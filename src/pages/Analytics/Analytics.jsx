// src\pages\Analytics\Analytics.jsx

"use client"

import { useState, useEffect, useCallback } from "react"
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
import { getTenantSummary, getAllTrends } from "../../api/services/analyticsService"
import { toast } from "react-toastify"

const Analytics = () => {
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

  // Format dateRange ("7","30","90","365") → range string ("7d","30d",...) for getTenantSummary
  const formatRangeForTenantSummary = (range) => {
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

      const [summaryData, trendsData] = await Promise.all([
        getTenantSummary({ range: formatRangeForTenantSummary(dateRange) }),
        getAllTrends({ days: parseInt(dateRange, 10) })
      ])

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
        completion: 100,
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

  const npsBadgeColor = (nps) => {
    if (nps >= 50) return "bg-green-500"
    if (nps >= 0) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="p-6 border border-[var(--danger-color)] bg-[var(--danger-light)] rounded-lg">
          <h5 className="flex items-center gap-2 font-semibold text-[var(--danger-color)] mb-2">
            <MdWarning />
            Failed to Load Analytics
          </h5>
          <p className="text-[var(--danger-color)] mb-4">{error}</p>
          <button 
            onClick={handleRefresh} 
            className="px-4 py-2 rounded-lg border border-[var(--danger-color)] text-[var(--danger-color)] hover:bg-[var(--danger-color)] hover:text-white transition-colors font-medium inline-flex items-center gap-2"
          >
            <MdRefresh />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="w-full">
        {/* Modern Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary-color)] text-2xl">
                <MdAssessment />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Analytics Dashboard</h1>
                <p className="text-sm text-[var(--text-secondary)]">Comprehensive insights and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] outline-none text-sm transition-colors"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
              <button
                className="p-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <MdRefresh className={refreshing ? "animate-spin" : ""} />
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors font-medium text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdDownload />
                {exporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg p-6 transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${
                    metric.color === 'primary' ? 'bg-[var(--primary-color)]' :
                    metric.color === 'success' ? 'bg-[var(--success-color)]' :
                    metric.color === 'info' ? 'bg-[var(--info-color)]' :
                    metric.color === 'warning' ? 'bg-[var(--warning-color)]' :
                    'bg-[var(--secondary-color)]'
                  }`}>
                    <metric.icon />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">{metric.value}</div>
                    <div className="text-sm text-[var(--text-secondary)] mb-2">{metric.title}</div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      metric.trend === "up" ? "text-[var(--success-color)]" :
                      metric.trend === "down" ? "text-[var(--danger-color)]" :
                      "text-[var(--text-secondary)]"
                    }`}>
                      {metric.trend === "up" && <MdTrendingUp />}
                      {metric.trend === "down" && <MdTrendingDown />}
                      <span>{metric.change}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Chart Area */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Response Trends</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Track performance over time</p>
                </div>
                <div>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] outline-none text-sm transition-colors"
                  >
                    <option value="responses">Responses</option>
                    <option value="completion">Completion Rate</option>
                    <option value="engagement">Engagement</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-center items-center min-h-[300px] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-lg">
                <div className="text-center py-12">
                  <MdBarChart className="mx-auto text-[var(--text-secondary)] mb-3 text-5xl" />
                  <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium mb-1">Chart visualization would appear here</p>
                  <small className="text-[var(--text-secondary)]">Integration with Chart.js or similar library</small>
                </div>
              </div>
            </div>
          </div>

          {/* Top Surveys Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Top Performing Surveys</h3>
                <p className="text-sm text-[var(--text-secondary)]">Best engagement metrics</p>
              </div>
              <div className="space-y-4">
                {currentSurveys.length > 0 ? (
                  currentSurveys.map((survey, index) => (
                    <div key={survey.id || index} className="p-4 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] truncate mb-1">{survey.name}</div>
                          <div className="text-xs text-[var(--text-secondary)] mb-2">{survey.category}</div>
                          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                            <span>{survey.responses.toLocaleString()} responses</span>
                            {survey.avgRating > 0 && <span className="text-[var(--warning-color)]">{survey.avgRating.toFixed(1)}★</span>}
                          </div>
                        </div>
                        <div>
                          {survey.nps !== 0 && (
                            <span className={`px-2 py-1 ${npsBadgeColor(survey.nps)} text-white rounded-full text-xs font-medium whitespace-nowrap`}>
                              NPS: {survey.nps}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MdBarChart className="mx-auto text-[var(--text-secondary)] mb-2" size={32} />
                    <p className="text-[var(--text-secondary)]">No surveys available yet</p>
                  </div>
                )}
              </div>
              {topSurveys.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
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
        <div className="mb-6">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">Daily Response Activity</h3>
              <p className="text-sm text-[var(--text-secondary)]">Detailed performance breakdown</p>
            </div>

            {/* Desktop Table View */}
            {responseData.length > 0 ? (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Responses</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Completion Rate</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentResponses.map((data, index) => {
                        const globalIndex = (activityPagination.page - 1) * activityPagination.limit + index
                        const previousData = globalIndex > 0 ? responseData[globalIndex - 1] : null
                        return (
                          <tr key={index} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                            <td className="py-3 px-4">
                              <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{data.date}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{data.responses.toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-[var(--light-border)] dark:bg-[var(--dark-border)] rounded-full overflow-hidden">
                                  <div className="h-full bg-[var(--primary-color)] transition-all" style={{ width: `${data.completion}%` }}></div>
                                </div>
                                <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] min-w-[45px]">{data.completion}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {previousData ? (
                                <span className={`flex items-center text-lg ${
                                  data.responses > previousData.responses ? "text-[var(--success-color)]" :
                                  data.responses < previousData.responses ? "text-[var(--danger-color)]" :
                                  "text-[var(--text-secondary)]"
                                }`}>
                                  {data.responses > previousData.responses ? <MdTrendingUp /> : data.responses < previousData.responses ? <MdTrendingDown /> : "-"}
                                </span>
                              ) : (
                                <span className="text-[var(--text-secondary)]">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden space-y-3">
                  {currentResponses.map((data, index) => {
                    const globalIndex = (activityPagination.page - 1) * activityPagination.limit + index
                    const previousData = globalIndex > 0 ? responseData[globalIndex - 1] : null
                    return (
                      <div key={index} className="p-4 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{data.date}</span>
                          {previousData && (
                            <span className={`text-xl ${
                              data.responses > previousData.responses ? "text-[var(--success-color)]" :
                              data.responses < previousData.responses ? "text-[var(--danger-color)]" :
                              "text-[var(--text-secondary)]"
                            }`}>
                              {data.responses > previousData.responses ? <MdTrendingUp /> : data.responses < previousData.responses ? <MdTrendingDown /> : null}
                            </span>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--text-secondary)]">Responses:</span>
                            <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{data.responses.toLocaleString()}</span>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-[var(--text-secondary)]">Completion:</span>
                              <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{data.completion}%</span>
                            </div>
                            <div className="h-2 bg-[var(--light-border)] dark:bg-[var(--dark-border)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--primary-color)] transition-all" style={{ width: `${data.completion}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <Pagination
                    current={activityPagination.page}
                    total={activityPagination.total}
                    limit={activityPagination.limit}
                    onChange={(page) => setActivityPagination((prev) => ({ ...prev, page }))}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <MdBarChart className="mx-auto text-[var(--text-secondary)] mb-3" size={48} />
                <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">No Response Data Available</h5>
                <p className="text-[var(--text-secondary)]">Response activity data will appear here once surveys start receiving responses.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Analytics