
// src\pages\Analytics\CustomReports.jsx
"use client"

import { useEffect, useState } from "react"
import { MdReport, MdSettings, MdLibraryBooks, MdPlayArrow, MdSave, MdDownload, MdDelete, MdRefresh, MdBarChart, MdPeople, MdTrendingUp, MdCompare } from 'react-icons/md'
import Pagination from "../../components/Pagination/Pagination.jsx"

const CustomReports = ({ darkMode }) => {
  const [reportType, setReportType] = useState("summary")
  const [dateRange, setDateRange] = useState("30d")
  const [selectedSurveys, setSelectedSurveys] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 1, total: 0 })

  const surveys = [
    { id: 1, name: "Customer Satisfaction Q4" },
    { id: 2, name: "Product Feedback Survey" },
    { id: 3, name: "Employee Engagement" },
    { id: 4, name: "Market Research Study" },
  ]

  const savedReports = [
    { id: 1, name: "Monthly Summary Report", type: "Summary", lastRun: "2024-01-15", status: "Ready" },
    {
      id: 2,
      name: "Customer Satisfaction Trends",
      type: "Trend Analysis",
      lastRun: "2024-01-14",
      status: "Processing",
    },
    { id: 3, name: "Product Feedback Analysis", type: "Detailed", lastRun: "2024-01-13", status: "Ready" },
  ]

  const handleSurveySelection = (surveyId) => {
    setSelectedSurveys((prev) => (prev.includes(surveyId) ? prev.filter((id) => id !== surveyId) : [...prev, surveyId]))
  }

  const getStatusBadge = (status) => {
    // This function is no longer needed as we use CSS classes directly in JSX
    // Keeping it for backwards compatibility but it's not used
    return status
  }

  const currentReports = savedReports.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  useEffect(() => {
    setPagination((prev) => ({ ...prev, total: savedReports.length }))
  }, [])

  return (
    <div className="custom-reports-container">
      <div className="page-header-section">
        <div className="section-icon">
          <MdReport />
        </div>
        <div className="section-content">
          <h1>Custom Reports</h1>
          <p>Create and manage custom survey reports</p>
        </div>
        <div className="section-actions">
          <button className="action-button secondary">
            <MdRefresh />
            Refresh
          </button>
          <button className="action-button primary">
            <MdSettings />
            Settings
          </button>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-content">
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">
                <MdSettings />
              </div>
              <h2>Create New Report</h2>
            </div>
            <div className="section-content">
              <div className="form-container">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Report Type</label>
                    <select 
                      className="form-select" 
                      value={reportType} 
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option value="summary">Summary Report</option>
                      <option value="detailed">Detailed Analysis</option>
                      <option value="comparison">Comparison Report</option>
                      <option value="trend">Trend Analysis</option>
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
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Surveys</label>
                  <div className="survey-selector">
                    {surveys.map((survey) => (
                      <label key={survey.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedSurveys.includes(survey.id)}
                          onChange={() => handleSurveySelection(survey.id)}
                        />
                        <span className="checkmark"></span>
                        {survey.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Report Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter report name" 
                  />
                </div>

                <div className="form-actions">
                  <button className="action-button primary">
                    <MdPlayArrow />
                    Generate Report
                  </button>
                  <button className="action-button secondary">
                    <MdSave />
                    Save Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">
                <MdLibraryBooks />
              </div>
              <h2>Report Templates</h2>
            </div>
            <div className="section-content">
              <div className="template-grid">
                <button className="template-button">
                  <MdBarChart />
                  Customer Satisfaction
                </button>
                <button className="template-button">
                  <MdPeople />
                  Employee Engagement
                </button>
                <button className="template-button">
                  <MdTrendingUp />
                  Performance Trends
                </button>
                <button className="template-button">
                  <MdCompare />
                  Comparison Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <div className="section-icon">
            <MdLibraryBooks />
          </div>
          <h2>Saved Reports</h2>
        </div>
        <div className="section-content">
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Last Run</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentReports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.name}</td>
                    <td>{report.type}</td>
                    <td>{new Date(report.lastRun).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${report.status.toLowerCase()}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-button small primary">
                          <MdPlayArrow />
                        </button>
                        <button className="action-button small secondary">
                          <MdDownload />
                        </button>
                        <button className="action-button small danger">
                          <MdDelete />
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
              current={pagination.page}
              total={savedReports.length}
              limit={pagination.limit}
              onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomReports
