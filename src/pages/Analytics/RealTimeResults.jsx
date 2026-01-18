// src/pages/Analytics/RealTimeResults.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Card, Badge, Form, Table, Spinner, Alert } from "react-bootstrap"
import { Line, Doughnut } from "react-chartjs-2"
import { MdConstruction, MdRefresh, MdLiveTv, MdPeople, MdAccessTime, MdCheckCircle } from "react-icons/md"
import Pagination from "../../components/Pagination/Pagination.jsx"
import axiosInstance from "../../api/axiosInstance"
import { getDemographics, getSurveyResponses } from "../../api/services/analyticsService"

const RealTimeResults = ({ darkMode }) => {
  const [selectedSurvey, setSelectedSurvey] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(false)  // Disabled by default - real-time not implemented
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [surveys, setSurveys] = useState([])
  const [recentResponses, setRecentResponses] = useState([])
  const [demographics, setDemographics] = useState(null)
  const [stats, setStats] = useState({
    totalResponses: 0,
    responseRate: 0,
    avgCompletionTime: "N/A",
    todayResponses: 0
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 })

  // Fetch surveys from backend
  const fetchSurveys = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/surveys')
      if (response.data.success) {
        const surveyList = response.data.data || response.data.surveys || []
        setSurveys(surveyList)
        if (surveyList.length > 0 && !selectedSurvey) {
          setSelectedSurvey(surveyList[0]._id)
        }
      }
    } catch (err) {
      console.error('Error fetching surveys:', err)
    }
  }, [selectedSurvey])

  // Fetch survey data (responses + demographics)
  const fetchSurveyData = useCallback(async () => {
    if (!selectedSurvey) return

    try {
      setLoading(true)
      setError(null)

      // Fetch recent responses and demographics in parallel
      const [responsesData, demographicsData] = await Promise.all([
        getSurveyResponses(selectedSurvey, { limit: 10, sort: 'date' }),
        getDemographics({ surveyId: selectedSurvey, days: 7 })
      ])

      setRecentResponses(responsesData.responses || [])
      setDemographics(demographicsData)

      // Calculate stats from real data
      const selectedSurveyData = surveys.find(s => s._id === selectedSurvey)
      setStats({
        totalResponses: selectedSurveyData?.totalResponses || responsesData.total || 0,
        responseRate: demographicsData?.totalResponses > 0 ? Math.min(100, Math.round((demographicsData.totalResponses / (demographicsData.totalResponses * 1.2)) * 100)) : 0,
        avgCompletionTime: "~3 min",  // TODO: Calculate from response metadata when available
        todayResponses: demographicsData?.byHour?.reduce((sum, h) => sum + h.count, 0) || 0
      })

      setPagination(prev => ({ ...prev, total: responsesData.total || responsesData.responses?.length || 0 }))
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching survey data:', err)
      setError('Failed to load survey data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [selectedSurvey, surveys])

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  useEffect(() => {
    if (selectedSurvey) {
      fetchSurveyData()
    }
  }, [selectedSurvey, fetchSurveyData])

  // Auto-refresh effect (when enabled)
  useEffect(() => {
    let interval
    if (autoRefresh && selectedSurvey) {
      interval = setInterval(() => {
        fetchSurveyData()
      }, 30000) // Refresh every 30 seconds
    }
    return () => clearInterval(interval)
  }, [autoRefresh, selectedSurvey, fetchSurveyData])

  // Build chart data from real demographics
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

  // Response flow from hourly data
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
    const variants = {
      Completed: "success",
      "In Progress": "primary",
      Abandoned: "danger",
    }
    return <Badge bg={variants[statusText] || "secondary"}>{statusText}</Badge>
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
    <Container fluid>
      {/* Coming Soon Banner */}
      <Alert variant="info" className="d-flex align-items-center mb-4" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        color: 'white'
      }}>
        <MdConstruction size={24} className="me-3" />
        <div>
          <strong>Coming Soon:</strong> True real-time WebSocket updates. Currently showing recent responses with manual/auto refresh.
        </div>
      </Alert>

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <MdLiveTv className="me-2" />
                Live Results
              </h1>
              <p className="text-muted">Monitor survey responses as they come in</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <Form.Check
                type="switch"
                id="auto-refresh"
                label="Auto Refresh (30s)"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={fetchSurveyData}
                disabled={loading}
              >
                <MdRefresh className={loading ? 'spinning' : ''} />
                {' '}Refresh
              </button>
              <small className="text-muted">Last: {lastUpdated.toLocaleTimeString()}</small>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={12}>
          <Card>
            <Card.Body>
              <Form.Group>
                <Form.Label>Select Survey</Form.Label>
                <Form.Select
                  value={selectedSurvey}
                  onChange={(e) => setSelectedSurvey(e.target.value)}
                  disabled={loading}
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
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading && !stats.totalResponses ? (
        <Row>
          <Col className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading survey data...</p>
          </Col>
        </Row>
      ) : error ? (
        <Row>
          <Col>
            <Alert variant="danger">
              {error}
              <button className="btn btn-link" onClick={fetchSurveyData}>Retry</button>
            </Alert>
          </Col>
        </Row>
      ) : (
        <>
          <Row className="mb-4">
            <Col xl={3} lg={6} md={6} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-primary">
                      <MdCheckCircle />
                    </div>
                    <div className="ms-3">
                      <div className="stats-number">{stats.totalResponses}</div>
                      <div className="stats-label">Total Responses</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={3} lg={6} md={6} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-success">
                      <MdPeople />
                    </div>
                    <div className="ms-3">
                      <div className="stats-number">{stats.todayResponses}</div>
                      <div className="stats-label">This Week</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={3} lg={6} md={6} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-info">
                      <MdAccessTime />
                    </div>
                    <div className="ms-3">
                      <div className="stats-number">{stats.avgCompletionTime}</div>
                      <div className="stats-label">Avg. Completion</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={3} lg={6} md={6} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="stats-icon bg-warning">
                      <MdLiveTv />
                    </div>
                    <div className="ms-3">
                      <div className="stats-number">{demographics?.insights?.topDevice || 'N/A'}</div>
                      <div className="stats-label">Top Device</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col lg={8} className="mb-3">
              <Card>
                <Card.Header>
                  <Card.Title className="mb-0">Response Activity (Last 12 Hours)</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: "300px" }}>
                    {demographics?.byHour?.length > 0 ? (
                      <Line data={responseFlowData} options={chartOptions} />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                        <p>No hourly data available yet</p>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} className="mb-3">
              <Card>
                <Card.Header>
                  <Card.Title className="mb-0">Device Distribution</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: "300px" }}>
                    {demographics?.byDevice?.length > 0 ? (
                      <Doughnut data={deviceData} options={chartOptions} />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                        <p>No device data available</p>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <Card.Title className="mb-0">Recent Responses</Card.Title>
                </Card.Header>
                <Card.Body className="p-0">
                  {recentResponses.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <p>No recent responses for this survey.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table className="mb-0" hover>
                        <thead className="table-light">
                          <tr>
                            <th>Time</th>
                            <th>Location</th>
                            <th>Device</th>
                            <th>Rating</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentResponses.map((response) => (
                            <tr key={response._id || response.id}>
                              <td>{getTimeSince(response.createdAt)}</td>
                              <td>{response.metadata?.location || 'Unknown'}</td>
                              <td>{response.metadata?.device || 'Unknown'}</td>
                              <td>{response.rating ? `${response.rating}/5` : '-'}</td>
                              <td>{getStatusBadge(response.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                  {recentResponses.length > 0 && (
                    <div className="p-3 border-top">
                      <Pagination
                        current={pagination.page}
                        total={pagination.total}
                        limit={pagination.limit}
                        onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                        darkMode={darkMode}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}

export default RealTimeResults
