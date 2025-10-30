// src\pages\Insights\AIInsights.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Tab, Tabs,
  Form, Modal, Alert, Spinner, ProgressBar, Table,
  ListGroup, InputGroup, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import {
  MdInsights, MdAutoAwesome, MdTrendingUp, MdTrendingDown,
  MdSentimentSatisfied, MdSentimentDissatisfied, MdSentimentNeutral,
  MdLightbulb, MdFlag, MdWarning, MdCheckCircle, MdAnalytics,
  MdRefresh, MdDownload, MdShare, MdSettings, MdFilterList,
  MdAssignment, MdSchedule, MdNotifications, MdPsychology,
  MdCategory, MdLocationOn, MdPeople, MdTimeline, MdCompare
} from 'react-icons/md';
import {
  FaRobot, FaBrain, FaChartLine, FaExclamationTriangle,
  FaLightbulb, FaUsers, FaStar, FaClock, FaMapMarkerAlt,
  FaArrowUp, FaArrowDown, FaEquals
} from 'react-icons/fa';
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import axiosInstance from '../../api/axiosInstance';


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const AIInsights = () => {
  const navigate = useNavigate();
  
  // State Management
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sentiment');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [generatingInsights, setGeneratingInsights] = useState(false);
  
  // Fetch Insights
  useEffect(() => {
    fetchInsights();
  }, [selectedTimeframe]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/insights/ai?timeframe=${selectedTimeframe}`);
      setInsights(response.data || mockInsights);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setInsights(mockInsights); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    try {
      setGeneratingInsights(true);
      await axiosInstance.post('/insights/generate');
      await fetchInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGeneratingInsights(false);
    }
  };

  // Mock Data (fallback)
  const mockInsights = {
    sentiment: {
      overview: {
        positive: 62,
        neutral: 28,
        negative: 10
      },
      trends: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        positive: [58, 61, 59, 62],
        neutral: [32, 29, 31, 28],
        negative: [10, 10, 10, 10]
      },
      categories: [
        { category: 'Service Quality', positive: 68, neutral: 22, negative: 10 },
        { category: 'Staff Behavior', positive: 72, neutral: 20, negative: 8 },
        { category: 'Facility Cleanliness', positive: 45, neutral: 35, negative: 20 },
        { category: 'Wait Times', positive: 35, neutral: 40, negative: 25 },
        { category: 'Product Quality', positive: 78, neutral: 18, negative: 4 }
      ]
    },
    predictions: [
      {
        id: 1,
        type: 'warning',
        title: 'Declining Satisfaction Trend',
        description: 'If current facility cleanliness issues continue, overall NPS is predicted to drop by 15% within 4 weeks',
        confidence: 85,
        timeline: '4 weeks',
        impact: 'High',
        recommendedActions: [
          'Increase cleaning staff schedule',
          'Implement quality checkpoints',
          'Staff training on cleanliness standards'
        ]
      },
      {
        id: 2,
        type: 'opportunity',
        title: 'Service Excellence Potential',
        description: 'Staff behavior scores are trending upward. Focusing on this area could increase overall satisfaction by 12%',
        confidence: 78,
        timeline: '2-3 weeks',
        impact: 'Medium',
        recommendedActions: [
          'Recognize top performing staff',
          'Share best practices across teams',
          'Implement peer mentoring program'
        ]
      },
      {
        id: 3,
        type: 'alert',
        title: 'Wait Time Critical Threshold',
        description: 'Wait time complaints have reached a critical threshold. Immediate action required to prevent customer churn',
        confidence: 92,
        timeline: 'Immediate',
        impact: 'Critical',
        recommendedActions: [
          'Add more service counters during peak hours',
          'Implement digital queue management',
          'Staff scheduling optimization'
        ]
      }
    ],
    categoryAnalysis: {
      topIssues: [
        { issue: 'Long waiting times', mentions: 234, trend: 'increasing', severity: 'high' },
        { issue: 'Facility cleanliness', mentions: 187, trend: 'stable', severity: 'medium' },
        { issue: 'Limited parking', mentions: 145, trend: 'decreasing', severity: 'low' },
        { issue: 'Staff responsiveness', mentions: 123, trend: 'stable', severity: 'medium' },
        { issue: 'System downtime', mentions: 98, trend: 'decreasing', severity: 'low' }
      ],
      topPraises: [
        { praise: 'Professional staff behavior', mentions: 456, trend: 'increasing' },
        { praise: 'Quick problem resolution', mentions: 389, trend: 'increasing' },
        { praise: 'Quality of services', mentions: 334, trend: 'stable' },
        { praise: 'Clean facilities', mentions: 287, trend: 'stable' },
        { praise: 'Easy processes', mentions: 234, trend: 'increasing' }
      ]
    },
    actionableInsights: [
      {
        id: 1,
        title: 'Optimize Peak Hour Staffing',
        description: 'AI analysis shows 70% of wait time complaints occur between 10-12 PM and 2-4 PM',
        priority: 'High',
        estimatedImpact: '+18% satisfaction',
        implementationEffort: 'Medium',
        department: 'Operations'
      },
      {
        id: 2,
        title: 'Enhance Staff Recognition Program',
        description: 'Positive staff mentions correlate with 23% higher overall ratings',
        priority: 'Medium',
        estimatedImpact: '+12% satisfaction',
        implementationEffort: 'Low',
        department: 'HR'
      },
      {
        id: 3,
        title: 'Implement Proactive Maintenance',
        description: 'Facility issues spike every 3 weeks - predictive maintenance could reduce by 60%',
        priority: 'High',
        estimatedImpact: '+15% satisfaction',
        implementationEffort: 'High',
        department: 'Facilities'
      }
    ],
    aiRecommendations: {
      immediate: [
        'Deploy additional staff during 10-12 PM peak hours',
        'Set up digital queue display boards',
        'Create facility cleanliness checklist'
      ],
      shortTerm: [
        'Implement staff recognition rewards program',
        'Upgrade booking system for better efficiency',
        'Add customer feedback kiosks at exit points'
      ],
      longTerm: [
        'AI-powered predictive maintenance system',
        'Customer journey optimization program',
        'Advanced staff scheduling algorithms'
      ]
    }
  };

  // Chart configurations
  const sentimentOverviewChart = {
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{
        data: [
          insights?.sentiment.overview.positive || 0,
          insights?.sentiment.overview.neutral || 0,
          insights?.sentiment.overview.negative || 0
        ],
        backgroundColor: [
          'rgba(var(--bs-success-rgb), 0.8)',
          'rgba(var(--bs-warning-rgb), 0.8)', 
          'rgba(var(--bs-danger-rgb), 0.8)'
        ],
        borderColor: [
          'rgb(var(--bs-success-rgb))',
          'rgb(var(--bs-warning-rgb))',
          'rgb(var(--bs-danger-rgb))'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  };

  const sentimentTrendsChart = {
    data: {
      labels: insights?.sentiment.trends.labels || [],
      datasets: [
        {
          label: 'Positive',
          data: insights?.sentiment.trends.positive || [],
          borderColor: 'rgb(var(--bs-success-rgb))',
          backgroundColor: 'rgba(var(--bs-success-rgb), 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Neutral',
          data: insights?.sentiment.trends.neutral || [],
          borderColor: 'rgb(var(--bs-warning-rgb))',
          backgroundColor: 'rgba(var(--bs-warning-rgb), 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Negative',
          data: insights?.sentiment.trends.negative || [],
          borderColor: 'rgb(var(--bs-danger-rgb))',
          backgroundColor: 'rgba(var(--bs-danger-rgb), 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  };

  // Helper functions
  const getPredictionIcon = (type) => {
    switch (type) {
      case 'warning': return <MdWarning className="text-warning" />;
      case 'opportunity': return <MdLightbulb className="text-success" />;
      case 'alert': return <MdFlag className="text-danger" />;
      default: return <MdInsights />;
    }
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      High: 'danger',
      Medium: 'warning',
      Low: 'info'
    };
    return <Badge bg={variants[priority]}>{priority}</Badge>;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <FaArrowUp className="text-danger" />;
      case 'decreasing': return <FaArrowDown className="text-success" />;
      case 'stable': return <FaEquals className="text-muted" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Analyzing feedback with AI...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 ai-insights">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Card className="insights-header shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center">
                  <div className="ai-icon-wrapper me-3">
                    <FaRobot className="text-primary" size={32} />
                  </div>
                  <div>
                    <h1 className="h3 mb-1 fw-bold">AI Insights</h1>
                    <p className="text-muted mb-0">
                      Intelligent analysis and predictions from customer feedback
                    </p>
                  </div>
                </div>
                
                <div className="d-flex gap-2">
                  <Form.Select
                    size="sm"
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </Form.Select>
                  
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={fetchInsights}
                  >
                    <MdRefresh className="me-1" />
                    Refresh
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={generateNewInsights}
                    disabled={generatingInsights}
                  >
                    {generatingInsights ? (
                      <Spinner animation="border" size="sm" className="me-1" />
                    ) : (
                      <MdAutoAwesome className="me-1" />
                    )}
                    {generatingInsights ? 'Analyzing...' : 'Generate Insights'}
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* AI Predictions */}
      <Row className="mb-4">
        <Col>
          <Card className="predictions-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0">
                <MdPsychology className="me-2 text-primary" />
                AI Predictions & Alerts
              </Card.Title>
              <Badge bg="primary" className="rounded-pill">
                <FaBrain className="me-1" />
                AI Powered
              </Badge>
            </Card.Header>
            <Card.Body>
              <Row>
                {insights?.predictions.map(prediction => (
                  <Col lg={4} key={prediction.id} className="mb-3">
                    <Card className={`prediction-card h-100 border-start border-4 ${
                      prediction.type === 'alert' ? 'border-danger' : 
                      prediction.type === 'warning' ? 'border-warning' : 'border-success'
                    }`}>
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-start mb-2">
                          {getPredictionIcon(prediction.type)}
                          <div className="ms-2 flex-grow-1">
                            <h6 className="mb-1">{prediction.title}</h6>
                            <p className="small text-muted mb-2">{prediction.description}</p>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <div className="d-flex justify-content-between small mb-1">
                            <span>Confidence:</span>
                            <span className="fw-bold">{prediction.confidence}%</span>
                          </div>
                          <ProgressBar 
                            now={prediction.confidence} 
                            variant={prediction.confidence > 80 ? 'success' : prediction.confidence > 60 ? 'warning' : 'danger'}
                            size="sm"
                          />
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <Badge bg={prediction.impact === 'Critical' ? 'danger' : prediction.impact === 'High' ? 'warning' : 'info'} className="me-1">
                              {prediction.impact}
                            </Badge>
                            <small className="text-muted">{prediction.timeline}</small>
                          </div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate('/actions', { 
                              state: { 
                                createAction: true, 
                                prediction: prediction 
                              } 
                            })}
                          >
                            <MdAssignment className="me-1" />
                            Create Action
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Insights Tabs */}
      <Row>
        <Col>
          <Card>
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                className="insights-tabs"
              >
                {/* Sentiment Analysis Tab */}
                <Tab eventKey="sentiment" title={
                  <span><MdSentimentSatisfied className="me-2" />Sentiment Analysis</span>
                }>
                  <div className="p-4">
                    <Row>
                      <Col lg={6} className="mb-4">
                        <Card className="h-100">
                          <Card.Header>
                            <Card.Title className="mb-0">Overall Sentiment</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <Doughnut {...sentimentOverviewChart} />
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={6} className="mb-4">
                        <Card className="h-100">
                          <Card.Header>
                            <Card.Title className="mb-0">Sentiment Trends</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <Line {...sentimentTrendsChart} />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col>
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Sentiment by Category</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <Table responsive>
                              <thead>
                                <tr>
                                  <th>Category</th>
                                  <th>Positive</th>
                                  <th>Neutral</th>
                                  <th>Negative</th>
                                  <th>Overall Score</th>
                                </tr>
                              </thead>
                              <tbody>
                                {insights?.sentiment.categories.map((cat, index) => {
                                  const score = (cat.positive * 1 + cat.neutral * 0.5 + cat.negative * 0) / 100;
                                  return (
                                    <tr key={index}>
                                      <td className="fw-semibold">{cat.category}</td>
                                      <td>
                                        <span className="text-success">{cat.positive}%</span>
                                      </td>
                                      <td>
                                        <span className="text-warning">{cat.neutral}%</span>
                                      </td>
                                      <td>
                                        <span className="text-danger">{cat.negative}%</span>
                                      </td>
                                      <td>
                                        <Badge bg={score > 0.7 ? 'success' : score > 0.5 ? 'warning' : 'danger'}>
                                          {(score * 5).toFixed(1)}/5
                                        </Badge>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Category Analysis Tab */}
                <Tab eventKey="categories" title={
                  <span><MdCategory className="me-2" />Category Analysis</span>
                }>
                  <div className="p-4">
                    <Row>
                      <Col lg={6} className="mb-4">
                        <Card>
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <Card.Title className="mb-0 text-danger">
                              <MdFlag className="me-2" />
                              Top Issues
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <ListGroup variant="flush">
                              {insights?.categoryAnalysis.topIssues.map((issue, index) => (
                                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center px-0">
                                  <div>
                                    <div className="fw-semibold">{issue.issue}</div>
                                    <small className="text-muted">{issue.mentions} mentions</small>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <Badge bg={issue.severity === 'high' ? 'danger' : issue.severity === 'medium' ? 'warning' : 'info'} className="me-2">
                                      {issue.severity}
                                    </Badge>
                                    {getTrendIcon(issue.trend)}
                                  </div>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={6} className="mb-4">
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0 text-success">
                              <MdCheckCircle className="me-2" />
                              Top Praises
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <ListGroup variant="flush">
                              {insights?.categoryAnalysis.topPraises.map((praise, index) => (
                                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center px-0">
                                  <div>
                                    <div className="fw-semibold">{praise.praise}</div>
                                    <small className="text-muted">{praise.mentions} mentions</small>
                                  </div>
                                  <div>
                                    {getTrendIcon(praise.trend)}
                                  </div>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Actionable Insights Tab */}
                <Tab eventKey="actionable" title={
                  <span><MdLightbulb className="me-2" />Actionable Insights</span>
                }>
                  <div className="p-4">
                    <Row>
                      {insights?.actionableInsights.map(insight => (
                        <Col lg={4} key={insight.id} className="mb-4">
                          <Card className="insight-card h-100">
                            <Card.Body>
                              <div className="d-flex align-items-start mb-2">
                                <FaLightbulb className="text-warning me-2 mt-1" />
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">{insight.title}</h6>
                                  <p className="small text-muted mb-2">{insight.description}</p>
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <div className="d-flex justify-content-between small mb-1">
                                  <span>Priority:</span>
                                  {getPriorityBadge(insight.priority)}
                                </div>
                                <div className="d-flex justify-content-between small mb-1">
                                  <span>Impact:</span>
                                  <span className="text-success fw-bold">{insight.estimatedImpact}</span>
                                </div>
                                <div className="d-flex justify-content-between small mb-1">
                                  <span>Department:</span>
                                  <Badge bg="light" text="dark">{insight.department}</Badge>
                                </div>
                              </div>
                              
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="w-100"
                                onClick={() => navigate('/actions', { 
                                  state: { 
                                    createAction: true, 
                                    insight: insight 
                                  } 
                                })}
                              >
                                <MdAssignment className="me-1" />
                                Create Action Item
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Tab>

                {/* AI Recommendations Tab */}
                <Tab eventKey="recommendations" title={
                  <span><FaBrain className="me-2" />AI Recommendations</span>
                }>
                  <div className="p-4">
                    <Row>
                      <Col lg={4} className="mb-4">
                        <Card className="h-100 border-danger">
                          <Card.Header className="bg-danger bg-opacity-10">
                            <Card.Title className="mb-0 text-danger">
                              <MdSchedule className="me-2" />
                              Immediate Actions
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <ListGroup variant="flush">
                              {insights?.aiRecommendations.immediate.map((rec, index) => (
                                <ListGroup.Item key={index} className="px-0 py-2 border-0">
                                  <div className="d-flex align-items-start">
                                    <MdFlag className="text-danger me-2 mt-1" size={14} />
                                    <span className="small">{rec}</span>
                                  </div>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={4} className="mb-4">
                        <Card className="h-100 border-warning">
                          <Card.Header className="bg-warning bg-opacity-10">
                            <Card.Title className="mb-0 text-warning">
                              <MdTimeline className="me-2" />
                              Short Term (1-4 weeks)
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <ListGroup variant="flush">
                              {insights?.aiRecommendations.shortTerm.map((rec, index) => (
                                <ListGroup.Item key={index} className="px-0 py-2 border-0">
                                  <div className="d-flex align-items-start">
                                    <MdWarning className="text-warning me-2 mt-1" size={14} />
                                    <span className="small">{rec}</span>
                                  </div>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={4} className="mb-4">
                        <Card className="h-100 border-primary">
                          <Card.Header className="bg-primary bg-opacity-10">
                            <Card.Title className="mb-0 text-primary">
                              <MdTrendingUp className="me-2" />
                              Long Term (1-6 months)
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <ListGroup variant="flush">
                              {insights?.aiRecommendations.longTerm.map((rec, index) => (
                                <ListGroup.Item key={index} className="px-0 py-2 border-0">
                                  <div className="d-flex align-items-start">
                                    <MdLightbulb className="text-primary me-2 mt-1" size={14} />
                                    <span className="small">{rec}</span>
                                  </div>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AIInsights;