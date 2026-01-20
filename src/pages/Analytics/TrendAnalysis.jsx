// src\pages\Analytics\TrendAnalysis.jsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Line, Bar } from "react-chartjs-2"
import {
  MdTrendingUp,
  MdAnalytics,
  MdDateRange,
  MdBarChart,
  MdShowChart,
  MdRefresh,
  MdDownload
} from "react-icons/md"
import {
  getAllTrends,
  getSatisfactionTrend,
  getEngagementTrend
} from "../../api/services/analyticsService"

const TrendAnalysis = () => {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("responses")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [trendsData, setTrendsData] = useState(null)

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllTrends({ range: timeRange })

      // DEBUG: Log raw API response
      console.log('[TrendAnalysis] getAllTrends response:', data)

      setTrendsData(data)
    } catch (err) {
      console.error('Error fetching trends:', err)
      setError('Failed to load trend data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchTrends()
  }, [fetchTrends])

  // Check if we have data - no mock fallbacks!
  const hasData = trendsData &&
    (trendsData.satisfaction?.labels?.length > 0 || trendsData.volume?.responses?.length > 0)

  // Build chart data from API response only
  const trendData = {
    labels: trendsData?.satisfaction?.labels || [],
    datasets: [
      {
        label: "Survey Responses",
        data: trendsData?.volume?.responses || [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
      {
        label: "Satisfaction Score",
        data: trendsData?.satisfaction?.values || [],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.1,
      },
    ],
  }

  // NPS comparison data - use real data only
  const comparisonData = {
    labels: trendsData?.nps?.labels || [],
    datasets: [
      {
        label: "NPS Score",
        data: trendsData?.nps?.scores || [],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Previous Period",
        data: trendsData?.nps?.previousScores || [],
        backgroundColor: "rgba(255, 206, 86, 0.5)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="trend-analysis-container">
      {/* Header Section */}
      <div className="page-header-section">
        <div className="header-content">
          <div className="header-left">
            <div className="page-icon">
              <MdTrendingUp />
            </div>
            <div className="page-info">
              <h1 className="page-title">Trend Analysis</h1>
              <p className="page-subtitle">Analyze survey performance trends over time</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline-primary">
              <MdRefresh />
              <span>Refresh Data</span>
            </button>
            <button className="btn btn-outline-primary">
              <MdDownload />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="controls-grid">
          <div className="control-panel">
            <div className="control-header">
              <div className="control-icon">
                <MdDateRange />
              </div>
              <h3 className="control-title">Time Range</h3>
            </div>
            <div className="control-content">
              <select
                className="time-range-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>

          <div className="control-panel">
            <div className="control-header">
              <div className="control-icon">
                <MdAnalytics />
              </div>
              <h3 className="control-title">Metric</h3>
            </div>
            <div className="control-content">
              <div className="metric-buttons">
                <button
                  className={`metric-btn ${selectedMetric === "responses" ? "active" : ""}`}
                  onClick={() => setSelectedMetric("responses")}
                >
                  Responses
                </button>
                <button
                  className={`metric-btn ${selectedMetric === "completion" ? "active" : ""}`}
                  onClick={() => setSelectedMetric("completion")}
                >
                  Completion Rate
                </button>
                <button
                  className={`metric-btn ${selectedMetric === "engagement" ? "active" : ""}`}
                  onClick={() => setSelectedMetric("engagement")}
                >
                  Engagement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Overview Chart */}
      <div className="chart-section">
        <div className="section-card">
          <div className="section-header">
            <div className="section-icon">
              <MdShowChart />
            </div>
            <h2 className="section-title">Trend Overview</h2>
          </div>
          <div className="chart-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading trend data...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p className="error-message">{error}</p>
                <button onClick={fetchTrends} className="btn btn-primary">Retry</button>
              </div>
            ) : !hasData ? (
              <div className="empty-state">
                <MdShowChart size={48} />
                <p>No trend data available for the selected period.</p>
                <p className="text-muted">Try selecting a different time range or submitting more survey responses.</p>
              </div>
            ) : (
              <Line data={trendData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Year-over-Year Comparison Chart */}
      <div className="comparison-section">
        <div className="section-card">
          <div className="section-header">
            <div className="section-icon">
              <MdBarChart />
            </div>
            <h2 className="section-title">Year-over-Year Comparison</h2>
          </div>
          <div className="chart-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading comparison data...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p className="error-message">{error}</p>
              </div>
            ) : !trendsData?.nps?.labels?.length ? (
              <div className="empty-state">
                <MdBarChart size={48} />
                <p>No NPS comparison data available.</p>
              </div>
            ) : (
              <Bar data={comparisonData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrendAnalysis
