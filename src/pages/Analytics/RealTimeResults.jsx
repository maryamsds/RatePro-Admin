// src\pages\Analytics\RealTimeResults.jsx

"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Badge, Form, Table } from "react-bootstrap"
import { Line, Doughnut } from "react-chartjs-2"
import Pagination from "../../components/Pagination/Pagination.jsx"

const RealTimeResults = ({ darkMode }) => {
  const [selectedSurvey, setSelectedSurvey] = useState("1")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [pagination, setPagination] = useState({ page: 1, limit: 1, total: 0 })


  const surveys = [
    { id: "1", name: "Customer Satisfaction Q4", responses: 156 },
    { id: "2", name: "Product Feedback Survey", responses: 89 },
    { id: "3", name: "Employee Engagement", responses: 234 },
  ]

  const [realTimeData, setRealTimeData] = useState({
    totalResponses: 156,
    responseRate: 78.5,
    avgCompletionTime: "3.2 min",
    currentlyActive: 12,
  })

  const [recentResponses, setRecentResponses] = useState([
    { id: 1, timestamp: "2 min ago", location: "New York, US", device: "Desktop", status: "Completed" },
    { id: 2, timestamp: "5 min ago", location: "London, UK", device: "Mobile", status: "In Progress" },
    { id: 3, timestamp: "8 min ago", location: "Tokyo, JP", device: "Tablet", status: "Completed" },
    { id: 4, timestamp: "12 min ago", location: "Sydney, AU", device: "Desktop", status: "Completed" },
    { id: 5, timestamp: "15 min ago", location: "Berlin, DE", device: "Mobile", status: "Abandoned" },
  ])

  const responseFlowData = {
    labels: Array.from({ length: 20 }, (_, i) => `${20 - i}m`),
    datasets: [
      {
        label: "Responses per minute",
        data: [2, 3, 1, 4, 2, 5, 3, 2, 4, 1, 3, 2, 5, 4, 2, 3, 1, 4, 2, 3],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        fill: true,
      },
    ],
  }

  const deviceData = {
    labels: ["Desktop", "Mobile", "Tablet"],
    datasets: [
      {
        label: "Responses by Device",
        data: [65, 45, 25],
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
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

  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date())
        setRealTimeData((prev) => ({
          ...prev,
          totalResponses: prev.totalResponses + Math.floor(Math.random() * 3),
          currentlyActive: Math.floor(Math.random() * 20) + 5,
        }))
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, total: recentResponses.length }))
  }, [])

  const currentResponses = recentResponses.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )


  const getStatusBadge = (status) => {
    const variants = {
      Completed: "success",
      "In Progress": "primary",
      Abandoned: "danger",
    }
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>
  }

  const getDeviceIcon = (device) => {
    const icons = {
      Desktop: "fas fa-desktop",
      Mobile: "fas fa-mobile-alt",
      Tablet: "fas fa-tablet-alt",
    }
    return <i className={icons[device] || "fas fa-question"}></i>
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">Real-Time Results</h1>
              <p className="text-muted">Monitor survey responses as they happen</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <Form.Check
                type="switch"
                id="auto-refresh"
                label="Auto Refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <small className="text-muted">Last updated: {lastUpdated.toLocaleTimeString()}</small>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={6}>
          <Card>
            <Card.Body>
              <Form.Group>
                <Form.Label>Select Survey</Form.Label>
                <Form.Select value={selectedSurvey} onChange={(e) => setSelectedSurvey(e.target.value)}>
                  {surveys.map((survey) => (
                    <option key={survey.id} value={survey.id}>
                      {survey.name} ({survey.responses} responses)
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xl={3} lg={6} md={6} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-primary">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="ms-3">
                  <div className="stats-number">{realTimeData.totalResponses}</div>
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
                  <i className="fas fa-percentage"></i>
                </div>
                <div className="ms-3">
                  <div className="stats-number">{realTimeData.responseRate}%</div>
                  <div className="stats-label">Response Rate</div>
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
                  <i className="fas fa-clock"></i>
                </div>
                <div className="ms-3">
                  <div className="stats-number">{realTimeData.avgCompletionTime}</div>
                  <div className="stats-label">Avg Completion</div>
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
                  <i className="fas fa-users"></i>
                </div>
                <div className="ms-3">
                  <div className="stats-number">{realTimeData.currentlyActive}</div>
                  <div className="stats-label">Currently Active</div>
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
              <Card.Title className="mb-0">Response Flow</Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "300px" }}>
                <Line data={responseFlowData} options={chartOptions} />
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
                <Doughnut data={deviceData} options={chartOptions} />
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
              <div className="table-responsive">
                <Table className="mb-0" hover>
                  <thead className="table-light">
                    <tr>
                      <th>Time</th>
                      <th>Location</th>
                      <th>Device</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentResponses.map((response) => (
                      <tr key={response.id}>
                        <td>{response.timestamp}</td>
                        <td>{response.location}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            {getDeviceIcon(response.device)}
                            <span className="ms-2">{response.device}</span>
                          </div>
                        </td>
                        <td>{getStatusBadge(response.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div className="p-3 border-top">
                <Pagination
                  current={pagination.page}
                  total={recentResponses.length}
                  limit={pagination.limit}
                  onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                  darkMode={darkMode}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default RealTimeResults
