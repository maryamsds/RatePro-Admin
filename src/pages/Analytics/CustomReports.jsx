// src/pages/Analytics/CustomReports.jsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { MdReport, MdSettings, MdLibraryBooks, MdPlayArrow, MdSave, MdDownload, MdDelete, MdRefresh, MdBarChart, MdPeople, MdTrendingUp, MdCompare, MdConstruction, MdError } from 'react-icons/md'
import Pagination from "../../components/Pagination/Pagination.jsx"
import axiosInstance from "../../api/axiosInstance"
import { exportAnalyticsPDF, exportResponsesCSV } from "../../api/services/analyticsService"

const CustomReports = ({ darkMode }) => {
  const [reportType, setReportType] = useState("summary")
  const [dateRange, setDateRange] = useState("30d")
  const [selectedSurveys, setSelectedSurveys] = useState([])
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [reportName, setReportName] = useState("")
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 })

  // Fetch real surveys from backend
  const fetchSurveys = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axiosInstance.get('/surveys')
      if (response.data.success) {
        setSurveys(response.data.data || response.data.surveys || [])
      }
    } catch (err) {
      console.error('Error fetching surveys:', err)
      setError('Failed to load surveys. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

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

      // For now, export PDF for the first selected survey
      // TODO: Backend needs a proper report generation endpoint
      const surveyId = selectedSurveys[0]

      if (reportType === 'detailed') {
        await exportResponsesCSV(surveyId)
      } else {
        await exportAnalyticsPDF(surveyId)
      }

      alert('Report downloaded successfully!')
    } catch (err) {
      console.error('Error generating report:', err)
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
    <div className="custom-reports-container">
      <div className="page-header-section">
        <div className="section-icon">
          <MdReport />
        </div>
        <div className="section-content">
          <h1>Custom Reports</h1>
          <p>Create and export custom survey reports</p>
        </div>
        <div className="section-actions">
          <button className="action-button secondary" onClick={fetchSurveys} disabled={loading}>
            <MdRefresh className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Coming Soon Banner for Advanced Features */}
      <div className="info-banner" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <MdConstruction size={24} />
        <div>
          <strong>Coming Soon:</strong> Saved report templates and scheduled report generation.
          Currently, you can export individual survey reports.
        </div>
      </div>

      <div className="content-grid">
        <div className="main-content">
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">
                <MdSettings />
              </div>
              <h2>Generate Report</h2>
            </div>
            <div className="section-content">
              {loading ? (
                <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>
                  <div className="spinner"></div>
                  <p>Loading surveys...</p>
                </div>
              ) : error ? (
                <div className="error-state" style={{ padding: '2rem', textAlign: 'center' }}>
                  <MdError size={48} color="#dc3545" />
                  <p className="error-message">{error}</p>
                  <button className="action-button primary" onClick={fetchSurveys}>Retry</button>
                </div>
              ) : (
                <div className="form-container">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Report Type</label>
                      <select
                        className="form-select"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <option value="summary">Summary Report (PDF)</option>
                        <option value="detailed">Detailed Export (CSV)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date Range</label>
                      <select
                        className="form-select"
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

                  <div className="form-group">
                    <label className="form-label">Select Surveys ({selectedSurveys.length} selected)</label>
                    {surveys.length === 0 ? (
                      <p className="text-muted">No surveys available. Create a survey first.</p>
                    ) : (
                      <div className="survey-selector" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {surveys.map((survey) => (
                          <label key={survey._id} className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={selectedSurveys.includes(survey._id)}
                              onChange={() => handleSurveySelection(survey._id)}
                            />
                            <span className="checkmark"></span>
                            {survey.title}
                            <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.85rem' }}>
                              {survey.totalResponses || 0} responses
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button
                      className="action-button primary"
                      onClick={handleGenerateReport}
                      disabled={generating || selectedSurveys.length === 0}
                    >
                      {generating ? (
                        <>
                          <div className="spinner small"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <MdPlayArrow />
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

        <div className="sidebar-content">
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">
                <MdLibraryBooks />
              </div>
              <h2>Quick Export</h2>
            </div>
            <div className="section-content">
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                Export reports for your most active surveys:
              </p>
              <div className="template-grid">
                {surveys.slice(0, 4).map(survey => (
                  <button
                    key={survey._id}
                    className="template-button"
                    onClick={async () => {
                      try {
                        await exportAnalyticsPDF(survey._id)
                      } catch (err) {
                        alert('Export failed')
                      }
                    }}
                  >
                    <MdBarChart />
                    {survey.title.length > 20 ? survey.title.substring(0, 20) + '...' : survey.title}
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
