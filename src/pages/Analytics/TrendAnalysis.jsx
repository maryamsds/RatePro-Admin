// src\pages\Analytics\TrendAnalysis.jsx

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Line } from "react-chartjs-2"
import {
  MdTrendingUp,
  MdAnalytics,
  MdDateRange,
  MdShowChart,
  MdRefresh,
  MdDownload
} from "react-icons/md"
import { getAllTrends } from "../../api/services/analyticsService"
import { toast } from "react-toastify"

/**
 * Parse range string ("7d","30d","90d","1y") → integer days
 * @param {string} rangeStr
 * @returns {number}
 */
const parseDays = (rangeStr) => {
  const map = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }
  return map[rangeStr] || 30
}

const TrendAnalysis = () => {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("responses")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [trendsData, setTrendsData] = useState(null)
  const abortRef = useRef(null)

  const fetchTrends = useCallback(async () => {
    // Cancel any in-flight request to prevent race conditions
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)
      const data = await getAllTrends({ days: parseDays(timeRange) })
      setTrendsData(data)
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return
      setError("Failed to load trend data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchTrends()
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [fetchTrends])

  // Handle export — no tenant-wide export endpoint exists
  const handleExport = () => {
    toast.info("Visit Survey Analytics or Custom Reports for detailed exports.")
  }

  // Check if we have data - no mock fallbacks
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
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--primary-color)] text-white">
              <MdTrendingUp className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Trend Analysis</h1>
              <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mt-1">Analyze survey performance trends over time</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={fetchTrends}
              disabled={loading}
            >
              <MdRefresh className={loading ? "animate-spin" : ""} />
              <span>Refresh Data</span>
            </button>
            <button
              className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white flex items-center gap-2"
              onClick={handleExport}
            >
              <MdDownload />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--primary-color)] bg-opacity-10">
              <MdDateRange className="text-xl text-[var(--primary-color)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Time Range</h3>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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

        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--primary-color)] bg-opacity-10">
              <MdAnalytics className="text-xl text-[var(--primary-color)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Metric</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedMetric === "responses"
                  ? "bg-[var(--primary-color)] text-white"
                  : "bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--primary-color)] hover:bg-opacity-10"
              }`}
              onClick={() => setSelectedMetric("responses")}
            >
              Responses
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedMetric === "completion"
                  ? "bg-[var(--primary-color)] text-white"
                  : "bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--primary-color)] hover:bg-opacity-10"
              }`}
              onClick={() => setSelectedMetric("completion")}
            >
              Completion Rate
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedMetric === "engagement"
                  ? "bg-[var(--primary-color)] text-white"
                  : "bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--primary-color)] hover:bg-opacity-10"
              }`}
              onClick={() => setSelectedMetric("engagement")}
            >
              Engagement
            </button>
          </div>
        </div>
      </div>

      {/* Trend Overview Chart */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--primary-color)] bg-opacity-10">
            <MdShowChart className="text-xl text-[var(--primary-color)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Trend Overview</h2>
        </div>
        <div className="h-96 flex justify-center items-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading trend data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-[var(--danger-color)] text-center">{error}</p>
              <button onClick={fetchTrends} className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]">Retry</button>
            </div>
          ) : !hasData ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <MdShowChart size={48} className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-50" />
              <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">No trend data available for the selected period.</p>
              <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Try selecting a different time range or submitting more survey responses.</p>
            </div>
          ) : (
            <Line data={trendData} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  )
}

export default TrendAnalysis
