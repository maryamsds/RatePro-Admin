// src/pages/Analytics/ResponseOverview.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { MdTableChart, MdFilterList, MdDownload, MdVisibility, MdSort, MdRefresh, MdSettings, MdFileDownload, MdError } from 'react-icons/md'
import Pagination from "../../components/Pagination/Pagination.jsx"
import { getFlaggedResponses, getSurveyResponses, exportResponsesCSV } from "../../api/services/analyticsService"
import useSurveys from "../../hooks/useSurveys"

const ResponseOverview = ({ darkMode }) => {
  // Centralized survey fetching — autoSelect false: shows all flagged if no survey selected
  const {
    surveys,
    selectedSurvey,
    setSelectedSurvey,
  } = useSurveys({ autoSelect: false })

  const [sortBy, setSortBy] = useState("date")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [responses, setResponses] = useState([])
  const [totalResponses, setTotalResponses] = useState(0)
  const itemsPerPage = 10

  // Fetch responses based on selected survey or all
  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let data
      if (selectedSurvey) {
        data = await getSurveyResponses(selectedSurvey, {
          page: currentPage,
          limit: itemsPerPage,
          sort: sortBy,
          status: filterStatus !== 'all' ? filterStatus : undefined
        })
      } else {
        data = await getFlaggedResponses({
          range: '30d',
          limit: itemsPerPage,
          page: currentPage
        })
      }

      setResponses(data.responses || [])
      setTotalResponses(data.total || data.responses?.length || 0)
    } catch (err) {
      setError('Failed to load responses. Please try again.')
      setResponses([])
    } finally {
      setLoading(false)
    }
  }, [selectedSurvey, currentPage, sortBy, filterStatus])

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
      alert('Export failed. Please try again.')
    }
  }

  const getStatusBadgeClasses = (status) => {
    const statusLower = status?.toLowerCase() || ''
    if (statusLower.includes('complete')) {
      return 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
    }
    if (statusLower.includes('partial') || statusLower.includes('progress')) {
      return 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
    }
    if (statusLower.includes('abandon')) {
      return 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
    }
    return 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <MdTableChart className="text-2xl text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Response Overview</h1>
              <p className="text-sm text-[var(--text-secondary)]">View and analyze all survey responses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={fetchResponses} 
              disabled={loading}
            >
              <MdRefresh className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button 
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleExport} 
              disabled={!selectedSurvey}
            >
              <MdDownload />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
            <MdFilterList className="text-xl text-purple-500" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Filter & Sort</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
              <MdTableChart className="text-[var(--primary-color)]" />
              Survey
            </label>
            <select
              className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
              <MdSort className="text-[var(--primary-color)]" />
              Sort By
            </label>
            <select
              className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Date</option>
              <option value="rating">Rating</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
              <MdFilterList className="text-[var(--primary-color)]" />
              Filter by Status
            </label>
            <select
              className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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

      {/* Responses Table */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div className="flex items-center gap-3 p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
            <MdTableChart className="text-xl text-blue-500" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
            All Responses {totalResponses > 0 && `(${totalResponses})`}
          </h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[var(--text-secondary)]">Loading responses...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <MdError className="text-5xl text-[var(--danger-color)]" />
              <p className="text-[var(--danger-color)] font-medium">{error}</p>
              <button 
                className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90"
                onClick={fetchResponses}
              >
                Retry
              </button>
            </div>
          ) : responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <MdTableChart className="text-5xl text-[var(--text-secondary)] opacity-50" />
              <p className="text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium">No responses found.</p>
              <p className="text-[var(--text-secondary)] text-sm">Try adjusting your filters or selecting a different survey.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <tr>
                      <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Survey</th>
                      <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Respondent</th>
                      <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Date</th>
                      <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Status</th>
                      <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Rating</th>
                      <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                    {responses.map((response) => (
                      <tr 
                        key={response._id || response.id}
                        className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors"
                      >
                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium">
                          {response.survey?.title || response.surveyTitle || 'N/A'}
                        </td>
                        <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {response.contact?.email || response.email || (response.isAnonymous ? 'Anonymous' : 'N/A')}
                        </td>
                        <td className="p-3 text-[var(--text-secondary)]">
                          {response.createdAt ? new Date(response.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClasses(response.status || 'Completed')}`}>
                            {response.status || 'Completed'}
                          </span>
                        </td>
                        <td className="p-3">
                          {response.rating ? (
                            <span className="text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">
                              {response.rating.toFixed(1)}
                            </span>
                          ) : response.score !== undefined ? (
                            <span className="text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">
                              {response.score}
                            </span>
                          ) : (
                            <span className="text-[var(--text-secondary)]">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button 
                              className="p-2 rounded-md transition-colors bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 hover:bg-blue-500/20 dark:hover:bg-blue-500/30"
                              title="View Response"
                            >
                              <MdVisibility />
                            </button>
                            <button 
                              className="p-2 rounded-md transition-colors bg-green-500/10 dark:bg-green-500/20 text-green-500 hover:bg-green-500/20 dark:hover:bg-green-500/30"
                              title="Download"
                            >
                              <MdDownload />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 pt-6 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
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
