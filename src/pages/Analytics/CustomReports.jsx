// src/pages/Analytics/CustomReports.jsx
"use client"

import { useEffect, useState } from "react"
import { MdReport, MdSettings, MdLibraryBooks, MdPlayArrow, MdSave, MdDownload, MdDelete, MdRefresh, MdBarChart, MdPeople, MdTrendingUp, MdCompare, MdConstruction, MdError } from 'react-icons/md'
import Pagination from "../../components/Pagination/Pagination.jsx"
import { exportAnalyticsPDF, exportResponsesCSV } from "../../api/services/analyticsService"
import useSurveys from "../../hooks/useSurveys"

const CustomReports = ({ darkMode }) => {
  // Centralized survey fetching — autoSelect false: uses checkbox multi-select
  const {
    surveys,
    loading,
    error,
    refetch,
  } = useSurveys({ autoSelect: false })

  const [reportType, setReportType] = useState("summary")
  const [dateRange, setDateRange] = useState("30d")
  const [selectedSurveys, setSelectedSurveys] = useState([])
  const [generating, setGenerating] = useState(false)
  const [reportName, setReportName] = useState("")
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 })

  const handleSurveySelection = (surveyId) => {
    setSelectedSurveys((prev) => (prev.includes(surveyId) ? prev.filter((id) => id !== surveyId) : [...prev, surveyId]))
  }

  const handleGenerateReport = async () => {
    if (selectedSurveys.length === 0) {
      alert('Please select at least one survey')
      return
    }

    try {
      setGenerating(true)

      // Export for the first selected survey
      const surveyId = selectedSurveys[0]

      if (reportType === 'detailed') {
        await exportResponsesCSV(surveyId)
      } else {
        await exportAnalyticsPDF(surveyId)
      }

      alert('Report downloaded successfully!')
    } catch (err) {
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const currentSurveys = surveys.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  return (
    <div className="p-6 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[var(--primary-color)] flex items-center justify-center text-white">
            <MdReport className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Custom Reports</h1>
            <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70">Create and export custom survey reports</p>
          </div>
        </div>
        <div>
          <button 
            className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] border border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={refetch} 
            disabled={loading}
          >
            <MdRefresh className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Coming Soon Banner for Advanced Features */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-4 rounded-md mb-6 flex items-center gap-4">
        <MdConstruction size={24} className="flex-shrink-0" />
        <div>
          <strong>Coming Soon:</strong> Saved report templates and scheduled report generation.
          Currently, you can export individual survey reports.
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary-color)] bg-opacity-10 flex items-center justify-center">
                <MdSettings className="text-xl text-[var(--primary-color)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Generate Report</h2>
            </div>

            <div>
              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading surveys...</p>
                </div>
              ) : error ? (
                <div className="py-12 text-center">
                  <MdError size={48} className="mx-auto mb-4 text-[var(--danger-color)]" />
                  <p className="text-[var(--danger-color)] mb-4">{error}</p>
                  <button 
                    className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"
                    onClick={refetch}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Report Type</label>
                      <select
                        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <option value="summary">Summary Report (PDF)</option>
                        <option value="detailed">Detailed Export (CSV)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">Date Range</label>
                      <select
                        className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                      >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                      </select>
                    </div>
                  </div>

                  {/* Survey Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] mb-2">
                      Select Surveys ({selectedSurveys.length} selected)
                    </label>
                    {surveys.length === 0 ? (
                      <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">No surveys available. Create a survey first.</p>
                    ) : (
                      <div className="max-h-[200px] overflow-y-auto border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md">
                        {surveys.map((survey) => (
                          <label 
                            key={survey._id} 
                            className="flex items-center gap-3 p-3 hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] cursor-pointer border-b border-[var(--light-border)] dark:border-[var(--dark-border)] last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSurveys.includes(survey._id)}
                              onChange={() => handleSurveySelection(survey._id)}
                              className="w-4 h-4 rounded border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]"
                            />
                            <span className="flex-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">{survey.title}</span>
                            <span className="text-xs text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-60">
                              {survey.totalResponses || 0} responses
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="pt-4">
                    <button
                      className="w-full px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      onClick={handleGenerateReport}
                      disabled={generating || selectedSurveys.length === 0}
                    >
                      {generating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <MdPlayArrow className="text-xl" />
                          Generate Report
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary-color)] bg-opacity-10 flex items-center justify-center">
                <MdLibraryBooks className="text-xl text-[var(--primary-color)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Quick Export</h2>
            </div>

            <div>
              <p className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] opacity-70 mb-4">
                Export reports for your most active surveys:
              </p>
              <div className="space-y-2">
                {surveys.slice(0, 4).map(survey => (
                  <button
                    key={survey._id}
                    className="w-full px-4 py-3 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-border)] dark:hover:bg-[var(--dark-border)] transition-colors flex items-center gap-3 text-left"
                    onClick={async () => {
                      try {
                        await exportAnalyticsPDF(survey._id)
                      } catch (err) {
                        alert('Export failed')
                      }
                    }}
                  >
                    <MdBarChart className="text-xl text-[var(--primary-color)] flex-shrink-0" />
                    <span className="truncate">{survey.title.length > 20 ? survey.title.substring(0, 20) + '...' : survey.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomReports
