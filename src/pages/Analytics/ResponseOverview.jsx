// src/pages/Analytics/ResponseOverview.jsx
"use client"

import { useState } from "react"
import { MdTableChart, MdFilterList, MdDownload, MdVisibility, MdSort, MdRefresh, MdSettings, MdFileDownload } from 'react-icons/md'
import Pagination from "../../components/Pagination/Pagination.jsx"

const ResponseOverview = ({ darkMode }) => {
  const [sortBy, setSortBy] = useState("date")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  const responses = [
    { id: 1, survey: "Customer Satisfaction Q4", respondent: "john@example.com", date: "2024-01-15", status: "Completed", score: 8.5 },
    { id: 2, survey: "Product Feedback Survey", respondent: "jane@example.com", date: "2024-01-14", status: "Partial", score: 7.2 },
    { id: 3, survey: "Employee Engagement", respondent: "bob@company.com", date: "2024-01-13", status: "Completed", score: 9.1 },
    { id: 4, survey: "Market Research Study", respondent: "alice@test.com", date: "2024-01-12", status: "Completed", score: 6.8 },
    { id: 5, survey: "User Experience Survey", respondent: "charlie@demo.com", date: "2024-01-11", status: "Abandoned", score: null },
  ]

  // Status badges now handled with CSS classes directly in JSX

  const totalItems = responses.length
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentResponses = responses.slice(indexOfFirstItem, indexOfLastItem)

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
                  <MdSort />
                  Sort By
                </label>
                <select 
                  className="control-select" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Date</option>
                  <option value="survey">Survey</option>
                  <option value="status">Status</option>
                  <option value="score">Score</option>
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
              <div className="control-group">
                <label className="control-label">
                  <MdDownload />
                  Export
                </label>
                <button className="export-button">
                  <MdFileDownload />
                  Export Data
                </button>
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
          <h2>All Responses</h2>
        </div>
        <div className="section-content">
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Survey</th>
                  <th>Respondent</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentResponses.map((response) => (
                  <tr key={response.id}>
                    <td className="survey-name">{response.survey}</td>
                    <td className="respondent-email">{response.respondent}</td>
                    <td className="response-date">{new Date(response.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${response.status.toLowerCase()}`}>
                        {response.status}
                      </span>
                    </td>
                    <td className="response-score">
                      {response.score ? (
                        <span className="score-value">{response.score.toFixed(1)}</span>
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
              total={totalItems}
              limit={itemsPerPage}
              onChange={(page) => setCurrentPage(page)}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResponseOverview
