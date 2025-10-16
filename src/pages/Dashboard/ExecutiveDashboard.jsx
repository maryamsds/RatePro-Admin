// src\pages\Dashboard\ExecutiveDashboard.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Table,
  ProgressBar, Alert, Spinner, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import {
  MdDashboard, MdTrendingUp, MdTrendingDown, MdFlag,
  MdNotifications, MdWarning, MdCheckCircle, MdInsights,
  MdLocationOn, MdPeople, MdStar, MdThumbUp, MdThumbDown,
  MdRefresh, MdFullscreen, MdSettings, MdAnalytics,
  MdAssignment, MdSchedule, MdBusiness, MdSentimentSatisfied,
  MdSentimentDissatisfied, MdSentimentNeutral, MdCompare
} from 'react-icons/md';
import {
  FaArrowUp, FaArrowDown, FaClock, FaUsers, FaChartLine,
  FaExclamationTriangle, FaStar, FaMapMarkerAlt, FaBuilding
} from 'react-icons/fa';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
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

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  
  // State Management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);

  // Fetch Dashboard Data
  useEffect(() => {
    fetchDashboardData();
    fetchAlerts();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/dashboard/executive?timeframe=${selectedTimeframe}`);
      setDashboardData(response.data || mockDashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(mockDashboardData); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/alerts');
      setAlerts(response.data.alerts || mockAlerts);
      setRealTimeAlerts(response.data.realTimeAlerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts(mockAlerts);
    }
  };

  // Mock Data (fallback)
  const mockDashboardData = {
    kpis: {
      totalSurveys: 45,
      totalResponses: 12847,
      avgSatisfaction: 4.2,
      npsScore: 67,
      responseRate: 78,
      completionRate: 92
    },
    trends: {
      satisfaction: {
        data: [4.1, 4.3, 4.0, 4.4, 4.2, 4.5, 4.2],
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
        change: +0.1
      },
      nps: {
        data: [62, 65, 59, 71, 67, 72, 67],
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
        change: +5
      },
      responses: {
        data: [1204, 1456, 1123, 1789, 1647, 1892, 1547],
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
        change: +12.5
      }
    },
    locations: [
      { name: 'Riyadh HQ', satisfaction: 4.5, responses: 3450, nps: 72, status: 'excellent' },
      { name: 'Jeddah Branch', satisfaction: 4.2, responses: 2890, nps: 65, status: 'good' },
      { name: 'Dammam Office', satisfaction: 3.8, responses: 1567, nps: 58, status: 'needs-attention' },
      { name: 'Mecca Center', satisfaction: 4.3, responses: 2145, nps: 68, status: 'good' },
      { name: 'Medina Hub', satisfaction: 4.1, responses: 1890, nps: 63, status: 'good' }
    ],
    topComplaints: [
      { issue: 'Long waiting times', count: 234, trend: 'up', severity: 'high' },
      { issue: 'Staff responsiveness', count: 187, trend: 'down', severity: 'medium' },
      { issue: 'Facility cleanliness', count: 145, trend: 'up', severity: 'high' },
      { issue: 'System downtime', count: 98, trend: 'stable', severity: 'medium' },
      { issue: 'Product quality', count: 76, trend: 'down', severity: 'low' }
    ],
    topPraises: [
      { praise: 'Excellent customer service', count: 456, trend: 'up' },
      { praise: 'Quick problem resolution', count: 389, trend: 'up' },
      { praise: 'Professional staff', count: 312, trend: 'stable' },
      { praise: 'Clean facilities', count: 287, trend: 'up' },
      { praise: 'Easy to use systems', count: 234, trend: 'stable' }
    ]
  };

  const mockAlerts = [
    {
      id: 1,
      type: 'critical',
      title: 'NPS Score Dropped Below Threshold',
      description: 'Dammam Office NPS score dropped to 58 (-12 from last week)',
      location: 'Dammam Office',
      timestamp: new Date().toISOString(),
      actionRequired: true
    },
    {
      id: 2,
      type: 'warning',
      title: 'Increasing Complaints Trend',
      description: 'Facility cleanliness complaints increased by 45% this week',
      location: 'Multiple Locations',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actionRequired: true
    },
    {
      id: 3,
      type: 'info',
      title: 'High Response Rate Achievement',
      description: 'Riyadh HQ achieved 95% response rate this month',
      location: 'Riyadh HQ',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actionRequired: false
    }
  ];

  // Chart configurations
  const satisfactionTrendChart = {
    data: {
      labels: dashboardData?.trends.satisfaction.labels || [],
      datasets: [
        {
          label: 'Satisfaction Score',
          data: dashboardData?.trends.satisfaction.data || [],
          borderColor: 'rgb(var(--bs-teal-rgb))',
          backgroundColor: 'rgba(var(--bs-teal-rgb), 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 3.5,
          max: 5
        }
      }
    }
  };

  const npsChart = {
    data: {
      labels: dashboardData?.trends.nps.labels || [],
      datasets: [
        {
          label: 'NPS Score',
          data: dashboardData?.trends.nps.data || [],
          backgroundColor: 'rgba(var(--bs-primary-rgb), 0.8)',
          borderColor: 'rgb(var(--bs-primary-rgb))',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  };

  const locationPerformanceChart = {
    data: {
      labels: dashboardData?.locations.map(loc => loc.name) || [],
      datasets: [
        {
          label: 'Satisfaction',
          data: dashboardData?.locations.map(loc => loc.satisfaction) || [],
          backgroundColor: 'rgba(var(--bs-danger-rgb), 0.8)'
        },
        {
          label: 'NPS',
          data: dashboardData?.locations.map(loc => loc.nps / 20) || [], // Scale NPS to match satisfaction
          backgroundColor: 'rgba(var(--bs-primary-rgb), 0.8)'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  };

  // Helper functions
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <MdFlag className="text-danger" />;
      case 'warning': return <MdWarning className="text-warning" />;
      case 'info': return <MdCheckCircle className="text-info" />;
      default: return <MdNotifications />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      excellent: 'success',
      good: 'primary',
      'needs-attention': 'warning',
      critical: 'danger'
    };
    return <Badge bg={variants[status]}>{status.replace('-', ' ').toUpperCase()}</Badge>;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <FaArrowUp className="text-danger" />;
      case 'down': return <FaArrowDown className="text-success" />;
      default: return <span className="text-muted">—</span>;
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading executive dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 executive-dashboard">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <MdDashboard size={32} className="text-primary me-3" />
              <div>
                <h2 className="mb-1 fw-bold">Executive Dashboard</h2>
                <p className="text-muted mb-0">Real-time insights and performance metrics</p>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => fetchDashboardData()}
              >
                <MdRefresh className="me-1" />
                Refresh
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate('/dashboard/analytics')}
              >
                <MdAnalytics className="me-1" />
                Detailed Analytics
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Real-time Alerts */}
      {alerts.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="alert-card border-start border-4 border-warning">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <MdNotifications className="text-warning me-2" size={24} />
                    <strong>Active Alerts ({alerts.length})</strong>
                  </div>
                  <Button variant="link" size="sm" onClick={() => navigate('/alerts')}>
                    View All
                  </Button>
                </div>
                
                <div className="mt-2">
                  {alerts.slice(0, 3).map(alert => (
                    <Alert key={alert.id} variant="light" className="mb-2 py-2 border-0">
                      <div className="d-flex align-items-start">
                        {getAlertIcon(alert.type)}
                        <div className="ms-2 flex-grow-1">
                          <strong className="small">{alert.title}</strong>
                          <p className="mb-0 small text-muted">{alert.description}</p>
                        </div>
                        <Badge bg="light" text="dark" className="small">
                          {alert.location}
                        </Badge>
                      </div>
                    </Alert>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col xl={2} lg={4} md={6} className="mb-3">
          <Card className="kpi-card h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-3">
              <div className="kpi-icon bg-primary bg-opacity-10 text-primary rounded-circle p-3 mx-auto mb-2">
                <MdAnalytics size={24} />
              </div>
              <h4 className="mb-0 fw-bold">{dashboardData?.kpis.totalSurveys}</h4>
              <small className="text-muted">Active Surveys</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={2} lg={4} md={6} className="mb-3">
          <Card className="kpi-card h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-3">
              <div className="kpi-icon bg-info bg-opacity-10 text-info rounded-circle p-3 mx-auto mb-2">
                <FaUsers size={24} />
              </div>
              <h4 className="mb-0 fw-bold">{dashboardData?.kpis.totalResponses.toLocaleString()}</h4>
              <small className="text-muted">Total Responses</small>
              <div className="mt-1">
                <span className="text-success small">
                  <FaArrowUp className="me-1" />
                  +{dashboardData?.trends.responses.change}%
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={2} lg={4} md={6} className="mb-3">
          <Card className="kpi-card h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-3">
              <div className="kpi-icon bg-success bg-opacity-10 text-success rounded-circle p-3 mx-auto mb-2">
                <FaStar size={24} />
              </div>
              <h4 className="mb-0 fw-bold">{dashboardData?.kpis.avgSatisfaction}</h4>
              <small className="text-muted">Avg Satisfaction</small>
              <div className="mt-1">
                <span className="text-success small">
                  <FaArrowUp className="me-1" />
                  +{dashboardData?.trends.satisfaction.change}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={2} lg={4} md={6} className="mb-3">
          <Card className="kpi-card h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-3">
              <div className="kpi-icon bg-warning bg-opacity-10 text-warning rounded-circle p-3 mx-auto mb-2">
                <MdTrendingUp size={24} />
              </div>
              <h4 className="mb-0 fw-bold">{dashboardData?.kpis.npsScore}</h4>
              <small className="text-muted">NPS Score</small>
              <div className="mt-1">
                <span className="text-success small">
                  <FaArrowUp className="me-1" />
                  +{dashboardData?.trends.nps.change}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={2} lg={4} md={6} className="mb-3">
          <Card className="kpi-card h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-3">
              <div className="kpi-icon bg-secondary bg-opacity-10 text-secondary rounded-circle p-3 mx-auto mb-2">
                <MdCheckCircle size={24} />
              </div>
              <h4 className="mb-0 fw-bold">{dashboardData?.kpis.responseRate}%</h4>
              <small className="text-muted">Response Rate</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={2} lg={4} md={6} className="mb-3">
          <Card className="kpi-card h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-3">
              <div className="kpi-icon bg-info bg-opacity-10 text-info rounded-circle p-3 mx-auto mb-2">
                <MdAssignment size={24} />
              </div>
              <h4 className="mb-0 fw-bold">{dashboardData?.kpis.completionRate}%</h4>
              <small className="text-muted">Completion Rate</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="chart-card h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0">Satisfaction Trend</Card.Title>
              <small className="text-muted">Last 7 weeks</small>
            </Card.Header>
            <Card.Body>
              <Line {...satisfactionTrendChart} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="chart-card h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0">NPS Performance</Card.Title>
              <small className="text-muted">Weekly comparison</small>
            </Card.Header>
            <Card.Body>
              <Bar {...npsChart} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Location Performance */}
      <Row className="mb-4">
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">Location Performance</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Satisfaction</th>
                    <th>Responses</th>
                    <th>NPS Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.locations.map((location, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaMapMarkerAlt className="text-muted me-2" />
                          {location.name}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-2">{location.satisfaction}</span>
                          <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < location.satisfaction ? 'text-warning' : 'text-muted'}
                                size={12}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td>{location.responses.toLocaleString()}</td>
                      <td>
                        <span className={`fw-bold ${location.nps >= 70 ? 'text-success' : location.nps >= 50 ? 'text-warning' : 'text-danger'}`}>
                          {location.nps}
                        </span>
                      </td>
                      <td>{getStatusBadge(location.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <Card.Title className="mb-0">Location Comparison</Card.Title>
            </Card.Header>
            <Card.Body>
              <Bar {...locationPerformanceChart} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Issues & Praises */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0 text-danger">
                <MdThumbDown className="me-2" />
                Top Complaints
              </Card.Title>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => navigate('/actions')}
              >
                <MdAssignment className="me-1" />
                Create Actions
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData?.topComplaints.map((complaint, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="fw-semibold">{complaint.issue}</div>
                    <small className="text-muted">{complaint.count} mentions</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <Badge 
                      bg={complaint.severity === 'high' ? 'danger' : complaint.severity === 'medium' ? 'warning' : 'info'}
                      className="me-2"
                    >
                      {complaint.severity}
                    </Badge>
                    {getTrendIcon(complaint.trend)}
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <Card.Title className="mb-0 text-success">
                <MdThumbUp className="me-2" />
                Top Praises
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {dashboardData?.topPraises.map((praise, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="fw-semibold">{praise.praise}</div>
                    <small className="text-muted">{praise.count} mentions</small>
                  </div>
                  <div>
                    {getTrendIcon(praise.trend)}
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ExecutiveDashboard;