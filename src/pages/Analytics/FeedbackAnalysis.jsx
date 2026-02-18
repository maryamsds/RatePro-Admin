// src/pages/Analytics/FeedbackAnalysis.jsx
"use client"

import { useState, useEffect } from "react"
import { MdAnalytics, MdRefresh, MdSentimentSatisfied, MdSentimentDissatisfied, MdTrendingUp, MdWarning } from "react-icons/md"
import { getSurveySentiment, getSurveySummary } from "../../api/services/analyticsService"
import useSurveys from "../../hooks/useSurveys"

const FeedbackAnalysis = () => {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [timeRange, setTimeRange] = useState('30d')

  const {
    surveys,
    selectedSurvey,
    setSelectedSurvey,
    loading: surveysLoading,
    error: surveysError,
  } = useSurveys({ autoSelect: false })

  const analyzeFeeedback = async () => {
    if (!selectedSurvey) return

    try {
      setLoading(true)

      const [sentimentData, summaryData] = await Promise.all([
        getSurveySentiment(selectedSurvey, { range: timeRange }),
        getSurveySummary(selectedSurvey, { range: timeRange })
      ])

      setAnalysis({
        sentiment: sentimentData,
        summary: summaryData,
        topComplaints: summaryData.insights?.topComplaints || [],
        topPraises: summaryData.insights?.topPraises || [],
        urgentIssues: summaryData.insights?.urgentIssues || [],
        keywords: sentimentData.topKeywords || [],
        themes: sentimentData.topThemes || []
      })
    } catch (error) {
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (complaint) => {
    if (complaint.severity === 'high' || complaint.count > 10) return 'bg-[var(--danger-color)]'
    if (complaint.severity === 'medium' || complaint.count > 5) return 'bg-[var(--warning-color)]'
    return 'bg-[var(--info-color)]'
  }

  const getSeverityLabel = (complaint) => {
    return complaint.severity || (complaint.count > 10 ? 'high' : complaint.count > 5 ? 'medium' : 'low')
  }

  return (
    <div className="w-full p-4">
      <div className="mb-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center gap-2">
              <MdAnalytics className="text-[var(--primary-color)]" size={24} />
              <h5 className="font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Feedback Analysis</h5>
            </div>
            <button
              onClick={analyzeFeeedback}
              disabled={loading || !selectedSurvey}
              className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 inline-flex items-center gap-1"
            >
              <MdRefresh />
              Analyze
            </button>
          </div>
          <div className="p-6">
            {surveysError && (
              <div className="p-3 mb-4 bg-[var(--warning-light)] border border-[var(--warning-color)] rounded-md text-[var(--warning-color)] text-sm">
                Failed to load surveys. Please refresh.
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Select Survey</label>
                <select
                  value={selectedSurvey}
                  onChange={(e) => setSelectedSurvey(e.target.value)}
                  disabled={surveysLoading}
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                >
                  <option value="">Choose survey...</option>
                  {surveys.map(survey => (
                    <option key={survey._id} value={survey._id}>
                      {survey.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Time Range</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">Analyzing feedback...</p>
        </div>
      )}

      {analysis && (
        <>
          {/* Sentiment KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] p-6 text-center">
              <MdSentimentSatisfied size={48} className="text-[var(--success-color)] mb-2 mx-auto" />
              <h4 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analysis.summary?.sentiment?.positive || analysis.sentiment?.breakdown?.positive || 0}</h4>
              <small className="text-[var(--text-secondary)]">Positive Responses</small>
            </div>
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] p-6 text-center">
              <MdSentimentDissatisfied size={48} className="text-[var(--danger-color)] mb-2 mx-auto" />
              <h4 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analysis.summary?.sentiment?.negative || analysis.sentiment?.breakdown?.negative || 0}</h4>
              <small className="text-[var(--text-secondary)]">Negative Responses</small>
            </div>
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] p-6 text-center">
              <MdTrendingUp size={48} className="text-[var(--warning-color)] mb-2 mx-auto" />
              <h4 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analysis.summary?.sentiment?.neutral || analysis.sentiment?.breakdown?.neutral || 0}</h4>
              <small className="text-[var(--text-secondary)]">Neutral Responses</small>
            </div>
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] p-6 text-center">
              <h4 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analysis.sentiment?.totalResponses || analysis.summary?.responses?.total || 0}</h4>
              <small className="text-[var(--text-secondary)]">Total Analyzed</small>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Complaints */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <h6 className="font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Top Complaints</h6>
              </div>
              <div className="p-4">
                {analysis.topComplaints.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <tr>
                          <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Issue</th>
                          <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Frequency</th>
                          <th className="p-3 text-left text-[var(--light-text)] dark:text-[var(--dark-text)] font-semibold">Severity</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
                        {analysis.topComplaints.map((complaint, index) => (
                          <tr key={index} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] transition-colors">
                            <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{complaint.theme || complaint.issue || complaint.text || 'Unknown'}</td>
                            <td className="p-3 text-[var(--light-text)] dark:text-[var(--dark-text)]">{complaint.count || complaint.frequency || 0}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 ${getSeverityColor(complaint)} text-white rounded-full text-xs font-medium`}>
                                {getSeverityLabel(complaint)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)] text-center py-4">No complaints identified</p>
                )}
              </div>
            </div>

            {/* Urgent Issues */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <h6 className="font-semibold m-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">Urgent Issues</h6>
              </div>
              <div className="p-4">
                {analysis.urgentIssues.length > 0 ? (
                  analysis.urgentIssues.map((issue, index) => (
                    <div key={index} className="mb-3 flex items-start gap-2 last:mb-0">
                      <MdWarning className="text-[var(--danger-color)] mt-1 flex-shrink-0" />
                      <div>
                        <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{issue.theme || issue.title || issue.text || 'Issue'}</strong>
                        {issue.count && <span className="ml-2 px-2 py-1 bg-[var(--danger-color)] text-white rounded-full text-xs font-medium">{issue.count}</span>}
                        {issue.description && <p className="text-[var(--text-secondary)] text-sm mb-0 mt-1">{issue.description}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[var(--text-secondary)] text-center py-4">No urgent issues detected</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default FeedbackAnalysis