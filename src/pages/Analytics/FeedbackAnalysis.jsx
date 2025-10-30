// src/pages/Analytics/FeedbackAnalysis.jsx
"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Form, Button, Table, Badge, Spinner } from "react-bootstrap"
import { MdAnalytics, MdRefresh, MdSentimentSatisfied, MdSentimentDissatisfied, MdTrendingUp } from "react-icons/md"
import axiosInstance from "../../api/axiosInstance"

const FeedbackAnalysis = () => {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [selectedSurvey, setSelectedSurvey] = useState('')
  const [surveys, setSurveys] = useState([])
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      const response = await axiosInstance.get('/api/surveys')
      if (response.data.success) {
        setSurveys(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching surveys:', error)
    }
  }

  const analyzeFeeedback = async () => {
    if (!selectedSurvey) return
    
    try {
      setLoading(true)
      const response = await axiosInstance.post('/api/feedback/analyze', {
        surveyId: selectedSurvey,
        timeRange
      })
      
      if (response.data.success) {
        setAnalysis(response.data.data)
      }
    } catch (error) {
      console.error('Error analyzing feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateActions = async () => {
    if (!analysis) return
    
    try {
      setLoading(true)
      const response = await axiosInstance.post('/api/feedback/actions/generate', {
        surveyId: selectedSurvey,
        analysis: analysis
      })
      
      if (response.data.success) {
        // Actions generated successfully
        alert('Actions generated successfully! Check the Action Management page.')
      }
    } catch (error) {
      console.error('Error generating actions:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <MdAnalytics className="me-2 text-primary" size={24} />
                <h5 className="mb-0">Feedback Analysis</h5>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={analyzeFeeedback}
                disabled={loading || !selectedSurvey}
              >
                <MdRefresh className="me-1" />
                Analyze
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Select Survey</Form.Label>
                    <Form.Select
                      value={selectedSurvey}
                      onChange={(e) => setSelectedSurvey(e.target.value)}
                    >
                      <option value="">Choose survey...</option>
                      {surveys.map(survey => (
                        <option key={survey._id} value={survey._id}>
                          {survey.title}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Time Range</Form.Label>
                    <Form.Select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="1y">Last year</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading && (
        <Row>
          <Col className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Analyzing feedback...</p>
          </Col>
        </Row>
      )}

      {analysis && (
        <>
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <MdSentimentSatisfied size={48} className="text-success mb-2" />
                  <h4>{analysis.sentiment?.positive || 0}</h4>
                  <small className="text-muted">Positive Responses</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <MdSentimentDissatisfied size={48} className="text-danger mb-2" />
                  <h4>{analysis.sentiment?.negative || 0}</h4>
                  <small className="text-muted">Negative Responses</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <MdTrendingUp size={48} className="text-warning mb-2" />
                  <h4>{analysis.sentiment?.neutral || 0}</h4>
                  <small className="text-muted">Neutral Responses</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h4>{analysis.totalResponses || 0}</h4>
                  <small className="text-muted">Total Analyzed</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Top Issues</h6>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Issue</th>
                        <th>Frequency</th>
                        <th>Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.topIssues?.map((issue, index) => (
                        <tr key={index}>
                          <td>{issue.issue}</td>
                          <td>{issue.count}</td>
                          <td>
                            <Badge variant={
                              issue.severity === 'high' ? 'danger' : 
                              issue.severity === 'medium' ? 'warning' : 'info'
                            }>
                              {issue.severity}
                            </Badge>
                          </td>
                        </tr>
                      )) || []}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">AI Insights</h6>
                  <Button 
                    size="sm" 
                    variant="success"
                    onClick={generateActions}
                    disabled={loading}
                  >
                    Generate Actions
                  </Button>
                </Card.Header>
                <Card.Body>
                  {analysis.insights?.map((insight, index) => (
                    <div key={index} className="mb-2">
                      <Badge variant="primary" className="me-2">
                        {insight.type}
                      </Badge>
                      {insight.text}
                    </div>
                  )) || <p className="text-muted">No insights available</p>}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}

export default FeedbackAnalysis