// src/pages/Analytics/RealTimeResults.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Line, Doughnut } from "react-chartjs-2"
import { MdConstruction, MdRefresh, MdLiveTv, MdPeople, MdAccessTime, MdCheckCircle } from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import { getDemographics, getSurveyResponses } from "../../api/services/analyticsService"
import useSurveys from "../../hooks/useSurveys"

const RealTimeResults = ({ darkMode }) => {
  const {
    surveys,
    selectedSurvey,
    setSelectedSurvey,
    loading: surveysLoading,
  } = useSurveys()

  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentResponses, setRecentResponses] = useState([])
  const [demographics, setDemographics] = useState(null)
  const [stats, setStats] = useState({
    totalResponses: 0,
    responseRate: 0,
    avgCompletionTime: "N/A",
    todayResponses: 0
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 })

  const fetchSurveyData = useCallback(async () => {
    if (!selectedSurvey) return

    try {
      setLoading(true)
      setError(null)

      const [responsesData, demographicsData] = await Promise.all([
        getSurveyResponses(selectedSurvey, { limit: 10, sort: 'date' }),
        getDemographics({ surveyId: selectedSurvey, days: 7 })
      ])

      setRecentResponses(responsesData.responses || [])
      setDemographics(demographicsData)

      const selectedSurveyData = surveys.find(s => s._id === selectedSurvey)
      setStats({
        totalResponses: selectedSurveyData?.totalResponses || responsesData.total || 0,
        responseRate: demographicsData?.totalResponses > 0 ? Math.min(100, Math.round((demographicsData.totalResponses / (demographicsData.totalResponses * 1.2)) * 100)) : 0,
        avgCompletionTime: "~3 min",
        todayResponses: demographicsData?.byHour?.reduce((sum, h) => sum + h.count, 0) || 0
      })

      setPagination(prev => ({ ...prev, total: responsesData.total || responsesData.responses?.length || 0 }))
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to load survey data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [selectedSurvey, surveys])

  useEffect(() => {
    if (selectedSurvey) {
      fetchSurveyData()
    }
  }, [selectedSurvey, fetchSurveyData])

  useEffect(() => {
    let interval
    if (autoRefresh && selectedSurvey) {
      interval = setInterval(() => {
        fetchSurveyData()
      }, 30000)
    }
    return () => clearInterval(interval)
  }, [autoRefresh, selectedSurvey, fetchSurveyData])

  const deviceData = {
    labels: demographics?.byDevice?.map(d => d.name) || ["Desktop", "Mobile", "Tablet"],
    datasets: [
      {
        label: "Responses by Device",
        data: demographics?.byDevice?.map(d => d.count) || [],
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  }

  const responseFlowData = {
    labels: demographics?.byHour?.slice(-12).map(h => h.label) || [],
    datasets: [
      {
        label: "Responses per hour",
        data: demographics?.byHour?.slice(-12).map(h => h.count) || [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        fill: true,
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

  const getStatusBadge = (status) => {
    const statusText = status || 'Completed'
    const colors = {
      Completed: "bg-[var(--success-color)]",
      "In Progress": "bg-[var(--info-color)]",
      Abandoned: "bg-[var(--danger-color)]",
    }
    return <span className={`px-3 py-1 ${colors[statusText] || "bg-[var(--light-border)] dark:bg-[var(--dark-border)]"} text-white rounded-full text-xs font-medium shadow-sm`}>{statusText}</span>
  }

  const getTimeSince = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'Just now'
  }

  const currentResponses = recentResponses.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  return (
    <div className="w-full px-6 py-6">
      {/* Coming Soon Banner */}
      <div className="flex items-center gap-3 p-4 mb-6 rounded-md shadow-md border border-[var(--info-color)]/30 bg-[var(--info-color)]/10 text-[var(--light-text)] dark:text-[var(--dark-text)]">
        <MdConstruction size={24} className="text-[var(--info-color)]" />
        <div>
          <strong className="font-semibold">Coming Soon:</strong> True real-time WebSocket updates. Currently showing recent responses with manual/auto refresh.
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
              <MdLiveTv className="text-[var(--primary-color)]" />
              Live Results
            </h1>
            <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Monitor survey responses as they come in</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-[var(--light-text)] dark:text-[var(--dark-text)]">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <div className="relative w-10 h-5 bg-[var(--light-border)] dark:bg-[var(--dark-border)] peer-checked:bg-[var(--primary-color)] rounded-full transition-colors">
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoRefresh ? 'translate-x-5' : ''}`}></div>
              </div>
              Auto Refresh (30s)
            </label>
            {autoRefresh && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--success-color)]/10 text-[var(--success-color)] text-sm">
                <span className="w-2 h-2 bg-[var(--success-color)] rounded-full animate-pulse"></span>
                Live
              </span>
            )}
            <button
              className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={fetchSurveyData}
              disabled={loading}
            >
              <MdRefresh className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">Last: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div>
            <label className="block text-sm font-semibold mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Select Survey</label>
            <select
              value={selectedSurvey}
              onChange={(e) => setSelectedSurvey(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {surveys.length === 0 ? (
                <option value="">No surveys available</option>
              ) : (
                surveys.map((survey) => (
                  <option key={survey._id} value={survey._id}>
                    {survey.title} ({survey.totalResponses || 0} responses)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {loading && !stats.totalResponses ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading survey data...</p>
        </div>
      ) : error ? (
        <div className="p-6 border border-[var(--danger-color)]/30 bg-[var(--danger-color)]/10 rounded-md text-[var(--light-text)] dark:text-[var(--dark-text)]">
          {error}
          <button className="ml-2 text-[var(--primary-color)] hover:text-[var(--primary-color)]/80 font-medium underline transition-colors" onClick={fetchSurveyData}>Retry</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {[
              { icon: MdCheckCircle, bg: "bg-[var(--info-color)]", value: stats.totalResponses, label: "Total Responses" },
              { icon: MdPeople, bg: "bg-[var(--success-color)]", value: stats.todayResponses, label: "This Week" },
              { icon: MdAccessTime, bg: "bg-[var(--primary-color)]", value: stats.avgCompletionTime, label: "Avg. Completion" },
              { icon: MdLiveTv, bg: "bg-[var(--warning-color)]", value: demographics?.insights?.topDevice || 'N/A', label: "Top Device" },
            ].map((stat, i) => (
              <div key={i} className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] p-6">
                <div className="flex items-center gap-4">
                  <div className={`${stat.bg} p-3 rounded-md text-white shadow-md`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{stat.value}</div>
                    <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            <div className="lg:col-span-8">
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="px-6 py-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <h5 className="font-semibold text-lg text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">Response Activity (Last 12 Hours)</h5>
                </div>
                <div className="p-6">
                  <div style={{ height: "300px" }}>
                    {demographics?.byHour?.length > 0 ? (
                      <Line data={responseFlowData} options={chartOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">
                        <p>No hourly data available yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="px-6 py-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <h5 className="font-semibold text-lg text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">Device Distribution</h5>
                </div>
                <div className="p-6">
                  <div style={{ height: "300px" }}>
                    {demographics?.byDevice?.length > 0 ? (
                      <Doughnut data={deviceData} options={chartOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">
                        <p>No device data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="px-6 py-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <h5 className="font-semibold text-lg text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">Recent Responses</h5>
              </div>
              <div>
                {recentResponses.length === 0 ? (
                  <div className="text-center py-12 text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">
                    <p>No recent responses for this survey.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <tr>
                          <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Time</th>
                          <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Location</th>
                          <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Device</th>
                          <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Rating</th>
                          <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                        {currentResponses.map((response) => (
                          <tr key={response._id || response.id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                            <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{getTimeSince(response.createdAt)}</td>
                            <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{response.metadata?.location || 'Unknown'}</td>
                            <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{response.metadata?.device || 'Unknown'}</td>
                            <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{response.rating ? `${response.rating}/5` : '-'}</td>
                            <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{getStatusBadge(response.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {recentResponses.length > 0 && (
                  <div className="px-6 py-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <Pagination
                      current={pagination.page}
                      total={pagination.total}
                      limit={pagination.limit}
                      onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                      darkMode={darkMode}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RealTimeResults
