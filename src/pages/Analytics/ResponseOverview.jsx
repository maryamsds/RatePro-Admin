// src/pages/Analytics/ResponseOverview.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { MdTableChart, MdFilterList, MdDownload, MdVisibility, MdSort, MdRefresh, MdSettings, MdFileDownload, MdError } from 'react-icons/md'
import Pagination from "../../components/Pagination/Pagination.jsx"
import { getFlaggedResponses, getSurveyResponses, exportResponsesCSV } from "../../api/services/analyticsService"
import axiosInstance from "../../api/axiosInstance"

const ResponseOverview = ({ darkMode }) => {
  const [sortBy, setSortBy] = useState("date")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [responses, setResponses] = useState([])
  const [surveys, setSurveys] = useState([])
  const [selectedSurvey, setSelectedSurvey] = useState("")
  const [totalResponses, setTotalResponses] = useState(0)
  const itemsPerPage = 10

  // Fetch surveys for dropdown
  const fetchSurveys = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/surveys')
      if (response.data.success) {
        setSurveys(response.data.data || response.data.surveys || [])
      }
    } catch (err) {
      console.error('Error fetching surveys:', err)
    }
  }, [])

  // Fetch responses based on selected survey or all
  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let data
      if (selectedSurvey) {
        // Fetch responses for specific survey
        data = await getSurveyResponses(selectedSurvey, {
          page: currentPage,
          limit: itemsPerPage,
          sort: sortBy,
          status: filterStatus !== 'all' ? filterStatus : undefined
        })
      } else {
        // Fetch all flagged/recent responses across tenant
        data = await getFlaggedResponses({
          range: '30d',
          limit: itemsPerPage,
          page: currentPage
        })
      }

      setResponses(data.responses || [])
      setTotalResponses(data.total || data.responses?.length || 0)
    } catch (err) {
      console.error('Error fetching responses:', err)
      setError('Failed to load responses. Please try again.')
      setResponses([])
    } finally {
      setLoading(false)
    }
  }, [selectedSurvey, currentPage, sortBy, filterStatus])

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  const handleExport = async () => {
    if (!selectedSurvey) {
      alert('Please select a survey to export')
      return
    }
    try {
      await exportResponsesCSV(selectedSurvey)
    } catch (err) {
      console.error('Error exporting:', err)
      alert('Export failed. Please try again.')
    }
  }

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || ''
    if (statusLower.includes('complete')) return 'completed'
    if (statusLower.includes('partial') || statusLower.includes('progress')) return 'partial'
    if (statusLower.includes('abandon')) return 'abandoned'
    return 'completed'
  }

  return (
    <div className="response-overview-container">
      <div className="page-header-section">
        <div className="section-icon">
          <MdTableChart />
        </div>
        <div className="section-content">
          <h1>Response Overview</h1>
          <p>View and analyze all survey responses</p>
        </div>
        <div className="section-actions">
          <button className="action-button secondary" onClick={fetchResponses} disabled={loading}>
            <MdRefresh className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <button className="action-button primary" onClick={handleExport} disabled={!selectedSurvey}>
            <MdDownload />
            Export
          </button>
        </div>
      </div>

      <div className="filter-controls-section">
        <div className="section-card">
          <div className="section-header">
            <div className="section-icon">
              <MdFilterList />
            </div>
            <h2>Filter & Sort</h2>
          </div>
          <div className="section-content">
            <div className="controls-grid">
              <div className="control-group">
                <label className="control-label">
                  <MdTableChart />
                  Survey
                </label>
                <select
                  className="control-select"
                  value={selectedSurvey}
                  onChange={(e) => {
                    setSelectedSurvey(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="">All Surveys (Recent)</option>
                  {surveys.map(survey => (
                    <option key={survey._id} value={survey._id}>
                      {survey.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="control-group">
                <label className="control-label">
                  <MdSort />
                  Sort By
                </label>
                <select
                  className="control-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div className="control-group">
                <label className="control-label">
                  <MdFilterList />
                  Filter by Status
                </label>
                <select
                  className="control-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="partial">Partial</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <div className="section-icon">
            <MdTableChart />
          </div>
          <h2>All Responses {totalResponses > 0 && `(${totalResponses})`}</h2>
        </div>
        <div className="section-content">
          {loading ? (
            <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="spinner"></div>
              <p>Loading responses...</p>
            </div>
          ) : error ? (
            <div className="error-state" style={{ padding: '2rem', textAlign: 'center' }}>
              <MdError size={48} color="#dc3545" />
              <p className="error-message">{error}</p>
              <button className="action-button primary" onClick={fetchResponses}>Retry</button>
            </div>
          ) : responses.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem', textAlign: 'center' }}>
              <MdTableChart size={48} style={{ opacity: 0.5 }} />
              <p>No responses found.</p>
              <p className="text-muted">Try adjusting your filters or selecting a different survey.</p>
            </div>
          ) : (
            <>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Survey</th>
                      <th>Respondent</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response) => (
                      <tr key={response._id || response.id}>
                        <td className="survey-name">{response.survey?.title || response.surveyTitle || 'N/A'}</td>
                        <td className="respondent-email">{response.contact?.email || response.email || (response.isAnonymous ? 'Anonymous' : 'N/A')}</td>
                        <td className="response-date">{response.createdAt ? new Date(response.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(response.status || 'Completed')}`}>
                            {response.status || 'Completed'}
                          </span>
                        </td>
                        <td className="response-score">
                          {response.rating ? (
                            <span className="score-value">{response.rating.toFixed(1)}</span>
                          ) : response.score !== undefined ? (
                            <span className="score-value">{response.score}</span>
                          ) : (
                            <span className="no-score">-</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-button small primary" title="View Response">
                              <MdVisibility />
                            </button>
                            <button className="action-button small secondary" title="Download">
                              <MdDownload />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <Pagination
                  current={currentPage}
                  total={totalResponses}
                  limit={itemsPerPage}
                  onChange={(page) => setCurrentPage(page)}
                  darkMode={darkMode}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResponseOverview
