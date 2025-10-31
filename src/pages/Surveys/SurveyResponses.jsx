// src\pages\Surveys\SurveyResponses.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Tab, Tabs,
  Form, Modal, Alert, Spinner, Table, InputGroup,
  OverlayTrigger, Tooltip, Dropdown, ProgressBar,
  Pagination, Toast, ToastContainer
} from 'react-bootstrap';
import {
  MdFilterList, MdDownload, MdVisibility, MdDelete,
  MdAnalytics, MdSentimentSatisfied, MdSentimentDissatisfied,
  MdSentimentNeutral, MdFlag, MdCheckCircle, MdWarning,
  MdSchedule, MdPerson, MdLocationOn, MdDevices,
  MdSearch, MdRefresh, MdAssignment, MdTrendingUp,
  MdNotifications, MdClose, MdCheck
} from 'react-icons/md';
import {
  FaStar, FaRegStar, FaUsers, FaChartLine, FaEye,
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMobile,
  FaDesktop, FaTabletAlt, FaExclamationTriangle
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
  ArcElement
} from 'chart.js';
import axiosInstance from '../../api/axiosInstance';
import Swal from 'sweetalert2';

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
  ArcElement
);

const SurveyResponses = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Management
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('responses');

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResponses, setTotalResponses] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');

  // Analytics Data
  const [analytics, setAnalytics] = useState({
    totalResponses: 0,
    averageRating: 0,
    completionRate: 0,
    npsScore: 0,
    sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
    responsesByDate: [],
    responsesByDevice: [],
    topComplaints: [],
    topPraises: []
  });

  // Modals
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Actions & Alerts
  const [actionItems, setActionItems] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Fetch Data
  useEffect(() => {
    fetchSurveyData();
    fetchResponses();
    // fetchAnalytics();
    // fetchActionItems();
    // fetchAlerts();
  }, [id, currentPage, searchTerm, sentimentFilter, ratingFilter, dateFilter, deviceFilter]);

  const fetchSurveyData = async () => {
    try {
      const response = await axiosInstance.get(`/surveys/${id}`);
      setSurvey(response.data.survey);
    } catch (err) {
      console.error('Error fetching survey:', err);
      setError('Failed to load survey data');
    }
  };

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sentiment: sentimentFilter !== 'all' ? sentimentFilter : undefined,
        rating: ratingFilter !== 'all' ? ratingFilter : undefined,
        date: dateFilter !== 'all' ? dateFilter : undefined,
        device: deviceFilter !== 'all' ? deviceFilter : undefined
      };

      const response = await axiosInstance.get(`/surveys/${id}/responses`, { params });
      setResponses(response.data.responses);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalResponses(response.data.totalResponses);
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError('Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  // const fetchAnalytics = async () => {
  //   try {
  //     const response = await axiosInstance.get(`/surveys/${id}/analytics`);
  //     setAnalytics(response.data);
  //   } catch (err) {
  //     console.error('Error fetching analytics:', err);
  //   }
  // };

  // const fetchActionItems = async () => {
  //   try {
  //     const response = await axiosInstance.get(`/surveys/${id}/actions`);
  //     setActionItems(response.data.actions);
  //   } catch (err) {
  //     console.error('Error fetching action items:', err);
  //   }
  // };

  // const fetchAlerts = async () => {
  //   try {
  //     const response = await axiosInstance.get(`/surveys/${id}/alerts`);
  //     setAlerts(response.data.alerts);
  //   } catch (err) {
  //     console.error('Error fetching alerts:', err);
  //   }
  // };

  // Export Functions
  const handleExportPDF = async () => {
    try {
      const response = await axiosInstance.get(`/surveys/${id}/export/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${survey.title}_responses.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('PDF report downloaded successfully!');
    } catch (err) {
      showErrorToast('Failed to export PDF report');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get(`/surveys/${id}/export/csv`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${survey.title}_responses.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('CSV file downloaded successfully!');
    } catch (err) {
      showErrorToast('Failed to export CSV file');
    }
  };

  // Action Handlers
  const handleMarkActionComplete = async (actionId) => {
    try {
      await axiosInstance.patch(`/actions/${actionId}/complete`);
      setActionItems(prev => prev.map(action => 
        action._id === actionId ? { ...action, status: 'completed' } : action
      ));
      showSuccessToast('Action marked as complete!');
    } catch (err) {
      showErrorToast('Failed to update action status');
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await axiosInstance.patch(`/alerts/${alertId}/dismiss`);
      setAlerts(prev => prev.filter(alert => alert._id !== alertId));
      showSuccessToast('Alert dismissed');
    } catch (err) {
      showErrorToast('Failed to dismiss alert');
    }
  };

  // Utility Functions
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <MdSentimentSatisfied className="text-success" />;
      case 'negative': return <MdSentimentDissatisfied className="text-danger" />;
      default: return <MdSentimentNeutral className="text-warning" />;
    }
  };

  const getSentimentBadge = (sentiment) => {
    const variants = {
      positive: 'success',
      negative: 'danger',
      neutral: 'warning'
    };
    return (
      <Badge bg={variants[sentiment]} className="d-flex align-items-center">
        {getSentimentIcon(sentiment)}
        <span className="ms-1">{sentiment}</span>
      </Badge>
    );
  };

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'mobile': return <FaMobile />;
      case 'tablet': return <FaTabletAlt />;
      case 'desktop': return <FaDesktop />;
      default: return <MdDevices />;
    }
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const maxRating = 5;
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        i <= rating ? 
        <FaStar key={i} className="text-warning" /> : 
        <FaRegStar key={i} className="text-muted" />
      );
    }
    return stars;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'danger',
      medium: 'warning',
      low: 'success'
    };
    return <Badge bg={variants[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setToastVariant('success');
    setShowToast(true);
  };

  const showErrorToast = (message) => {
    setToastMessage(message);
    setToastVariant('danger');
    setShowToast(true);
  };

  // Chart Data
  const responsesTrendData = {
    labels: analytics.responsesByDate?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Daily Responses',
        data: analytics.responsesByDate?.map(item => item.count) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          analytics.sentimentBreakdown.positive,
          analytics.sentimentBreakdown.negative,
          analytics.sentimentBreakdown.neutral
        ],
        backgroundColor: [
          '#28a745',
          '#dc3545',
          '#ffc107'
        ]
      }
    ]
  };

  const deviceData = {
    labels: analytics.responsesByDevice?.map(item => item.device) || [],
    datasets: [
      {
        label: 'Responses by Device',
        data: analytics.responsesByDevice?.map(item => item.count) || [],
        backgroundColor: [
          '#007bff',
          '#28a745',
          '#ffc107',
          '#dc3545'
        ]
      }
    ]
  };

  if (loading && !responses.length) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading survey responses...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <Card className="survey-responses-header shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <Button
                    variant="link"
                    className="p-0 mb-2 text-primary"
                    onClick={() => navigate(`/app/surveys/`)}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Survey Details
                  </Button>
                  <h1 className="h3 mb-1 fw-bold">
                    <MdAnalytics className="me-2 text-primary" />
                    Survey Responses
                  </h1>
                  <p className="text-muted mb-0">{survey?.title}</p>
                  <div className="d-flex align-items-center mt-2 gap-3">
                    <Badge bg="primary" className="d-flex align-items-center">
                      <FaUsers className="me-1" />
                      {totalResponses} Total Responses
                    </Badge>
                    <Badge bg="success" className="d-flex align-items-center">
                      <FaStar className="me-1" />
                      {analytics.averageRating.toFixed(1)} Avg Rating
                    </Badge>
                    <Badge bg="info" className="d-flex align-items-center">
                      <MdTrendingUp className="me-1" />
                      {analytics.completionRate}% Completion
                    </Badge>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowFilterModal(true)}
                  >
                    <MdFilterList className="me-2" />
                    Filters
                  </Button>
                  <Button
                    variant="outline-success"
                    onClick={() => setShowExportModal(true)}
                  >
                    <MdDownload className="me-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={fetchResponses}
                  >
                    <MdRefresh className="me-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="border-warning">
              <Card.Header className="bg-warning bg-opacity-10 d-flex align-items-center">
                <MdNotifications className="text-warning me-2" />
                <strong>Active Alerts ({alerts.length})</strong>
              </Card.Header>
              <Card.Body className="p-3">
                {alerts.map(alert => (
                  <Alert key={alert._id} variant={alert.severity} className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong>{alert.title}</strong>
                      <p className="mb-0 small">{alert.message}</p>
                    </div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleDismissAlert(alert._id)}
                    >
                      <MdClose />
                    </Button>
                  </Alert>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Content */}
      <Row>
        <Col>
          <Card className="responses-content-card">
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                className="responses-tabs"
              >
                {/* Responses Tab */}
                <Tab eventKey="responses" title={
                  <span><MdVisibility className="me-2" />Responses ({totalResponses})</span>
                }>
                  <div className="p-4">
                    {/* Search and Quick Filters */}
                    <Row className="mb-4">
                      <Col lg={6}>
                        <InputGroup>
                          <InputGroup.Text>
                            <MdSearch />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Search responses by content, user, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </InputGroup>
                      </Col>
                      <Col lg={6}>
                        <div className="d-flex gap-2">
                          <Form.Select
                            value={sentimentFilter}
                            onChange={(e) => setSentimentFilter(e.target.value)}
                            className="flex-grow-1"
                          >
                            <option value="all">All Sentiments</option>
                            <option value="positive">Positive</option>
                            <option value="negative">Negative</option>
                            <option value="neutral">Neutral</option>
                          </Form.Select>
                          <Form.Select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            className="flex-grow-1"
                          >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                          </Form.Select>
                        </div>
                      </Col>
                    </Row>

                    {/* Responses Table */}
                    <div className="table-responsive">
                      <Table hover className="responses-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Submitted</th>
                            <th>Rating</th>
                            <th>Sentiment</th>
                            <th>Device</th>
                            <th>Location</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {responses.map((response) => (
                            <tr key={response._id}>
                              <td>
                                <code>#{response._id.slice(-6)}</code>
                              </td>
                              <td>
                                <div>
                                  <div>{new Date(response.submittedAt).toLocaleDateString()}</div>
                                  <small className="text-muted">
                                    {new Date(response.submittedAt).toLocaleTimeString()}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {getRatingStars(response.averageRating)}
                                  <span className="ms-2 small">({response.averageRating})</span>
                                </div>
                              </td>
                              <td>
                                {getSentimentBadge(response.sentiment)}
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {getDeviceIcon(response.device)}
                                  <span className="ms-2 small">{response.device}</span>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <FaMapMarkerAlt className="text-muted me-1" />
                                  <span className="small">{response.location || 'Unknown'}</span>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <OverlayTrigger overlay={<Tooltip>View Details</Tooltip>}>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedResponse(response);
                                        setShowResponseModal(true);
                                      }}
                                    >
                                      <MdVisibility />
                                    </Button>
                                  </OverlayTrigger>
                                  {response.sentiment === 'negative' && (
                                    <OverlayTrigger overlay={<Tooltip>Flag for Action</Tooltip>}>
                                      <Button
                                        variant="outline-warning"
                                        size="sm"
                                        onClick={() => {
                                          // Create action item for negative feedback
                                        }}
                                      >
                                        <MdFlag />
                                      </Button>
                                    </OverlayTrigger>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <div className="d-flex align-items-center">
                        <small className="text-muted me-3">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                          {Math.min(currentPage * itemsPerPage, totalResponses)} of {totalResponses} responses
                        </small>
                        <Form.Select
                          size="sm"
                          value={itemsPerPage}
                          onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                          style={{ width: 'auto' }}
                        >
                          <option value="10">10 per page</option>
                          <option value="20">20 per page</option>
                          <option value="50">50 per page</option>
                          <option value="100">100 per page</option>
                        </Form.Select>
                      </div>
                      
                      <Pagination>
                        <Pagination.First
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        />
                        <Pagination.Prev
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                        
                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                          const page = Math.max(1, currentPage - 2) + index;
                          if (page <= totalPages) {
                            return (
                              <Pagination.Item
                                key={page}
                                active={page === currentPage}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Pagination.Item>
                            );
                          }
                          return null;
                        })}
                        
                        <Pagination.Next
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                        <Pagination.Last
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  </div>
                </Tab>

                {/* Analytics Tab */}
                <Tab eventKey="analytics" title={
                  <span><MdAnalytics className="me-2" />Analytics</span>
                }>
                  <div className="p-4">
                    <Row>
                      {/* Summary Cards */}
                      <Col lg={3} md={6} className="mb-4">
                        <Card className="stats-card h-100">
                          <Card.Body className="text-center">
                            <div className="stats-icon bg-primary bg-opacity-10 text-primary rounded-circle mx-auto mb-3">
                              <FaUsers size={32} />
                            </div>
                            <h3 className="mb-1">{analytics.totalResponses}</h3>
                            <p className="text-muted mb-0">Total Responses</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={3} md={6} className="mb-4">
                        <Card className="stats-card h-100">
                          <Card.Body className="text-center">
                            <div className="stats-icon bg-success bg-opacity-10 text-success rounded-circle mx-auto mb-3">
                              <FaStar size={32} />
                            </div>
                            <h3 className="mb-1">{analytics.averageRating.toFixed(1)}</h3>
                            <p className="text-muted mb-0">Average Rating</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={3} md={6} className="mb-4">
                        <Card className="stats-card h-100">
                          <Card.Body className="text-center">
                            <div className="stats-icon bg-info bg-opacity-10 text-info rounded-circle mx-auto mb-3">
                              <MdTrendingUp size={32} />
                            </div>
                            <h3 className="mb-1">{analytics.completionRate}%</h3>
                            <p className="text-muted mb-0">Completion Rate</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={3} md={6} className="mb-4">
                        <Card className="stats-card h-100">
                          <Card.Body className="text-center">
                            <div className="stats-icon bg-warning bg-opacity-10 text-warning rounded-circle mx-auto mb-3">
                              <FaChartLine size={32} />
                            </div>
                            <h3 className="mb-1">{analytics.npsScore}</h3>
                            <p className="text-muted mb-0">NPS Score</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      {/* Response Trend Chart */}
                      <Col lg={8} className="mb-4">
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Response Trend</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <Line data={responsesTrendData} options={{
                              responsive: true,
                              plugins: {
                                title: {
                                  display: true,
                                  text: 'Daily Response Count'
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true
                                }
                              }
                            }} />
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      {/* Sentiment Breakdown */}
                      <Col lg={4} className="mb-4">
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Sentiment Analysis</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <Doughnut data={sentimentData} options={{
                              responsive: true,
                              plugins: {
                                legend: {
                                  position: 'bottom'
                                }
                              }
                            }} />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      {/* Device Breakdown */}
                      <Col lg={6} className="mb-4">
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Responses by Device</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <Bar data={deviceData} options={{
                              responsive: true,
                              plugins: {
                                legend: {
                                  display: false
                                }
                              }
                            }} />
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      {/* Top Issues & Praises */}
                      <Col lg={6} className="mb-4">
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Top Issues & Praises</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <Tabs defaultActiveKey="complaints">
                              <Tab eventKey="complaints" title="Top Complaints">
                                <div className="mt-3">
                                  {analytics.topComplaints?.map((complaint, index) => (
                                    <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                      <span>{complaint.issue}</span>
                                      <Badge bg="danger">{complaint.count}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </Tab>
                              <Tab eventKey="praises" title="Top Praises">
                                <div className="mt-3">
                                  {analytics.topPraises?.map((praise, index) => (
                                    <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                      <span>{praise.praise}</span>
                                      <Badge bg="success">{praise.count}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </Tab>
                            </Tabs>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Action Items Tab */}
                <Tab eventKey="actions" title={
                  <span><MdAssignment className="me-2" />Action Items ({actionItems.length})</span>
                }>
                  <div className="p-4">
                    <Row className="mb-4">
                      <Col>
                        <Alert variant="info">
                          <MdAssignment className="me-2" />
                          <strong>AI-Generated Action Items</strong>
                          <p className="mb-0 mt-2">
                            Based on negative feedback and survey responses, these action items have been automatically generated and prioritized.
                          </p>
                        </Alert>
                      </Col>
                    </Row>

                    <Row>
                      {actionItems.map(action => (
                        <Col lg={6} key={action._id} className="mb-3">
                          <Card className={`action-card ${action.priority === 'high' ? 'border-danger' : action.priority === 'medium' ? 'border-warning' : 'border-success'}`}>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                {getPriorityBadge(action.priority)}
                                <span className="ms-2 fw-bold">{action.title}</span>
                              </div>
                              <div className="d-flex gap-1">
                                {action.status !== 'completed' && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => handleMarkActionComplete(action._id)}
                                  >
                                    <MdCheck />
                                  </Button>
                                )}
                              </div>
                            </Card.Header>
                            <Card.Body>
                              <p className="mb-2">{action.description}</p>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  <FaClock className="me-1" />
                                  Created: {new Date(action.createdAt).toLocaleDateString()}
                                </small>
                                {action.assignedTo && (
                                  <Badge bg="secondary">
                                    Assigned to: {action.assignedTo.name}
                                  </Badge>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>

                    {actionItems.length === 0 && (
                      <div className="text-center py-5">
                        <MdAssignment size={64} className="text-muted mb-3" />
                        <h5>No Action Items</h5>
                        <p className="text-muted">No action items have been generated yet.</p>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Response Detail Modal */}
      <Modal show={showResponseModal} onHide={() => setShowResponseModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Response Details #{selectedResponse?._id.slice(-6)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedResponse && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong className='strong'>Submitted:</strong> {new Date(selectedResponse.submittedAt).toLocaleString()}
                </Col>
                <Col md={6}>
                  <strong className='strong'>Device:</strong> {getDeviceIcon(selectedResponse.device)} {selectedResponse.device}
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong className='strong'>Rating:</strong> {getRatingStars(selectedResponse.averageRating)} ({selectedResponse.averageRating})
                </Col>
                <Col md={6}>
                  <strong className='strong'>Sentiment:</strong> {getSentimentBadge(selectedResponse.sentiment)}
                </Col>
              </Row>

              <hr />

              <h6 className='strong'>Responses:</h6>
              {selectedResponse.answers?.map((answer, index) => (
                <Card key={index} className="mb-2">
                  <Card.Body className="p-3">
                    <strong>Q{index + 1}: {answer.question}</strong>
                    <div className="mt-2">
                      {answer.type === 'rating' ? (
                        <div>{getRatingStars(answer.value)} ({answer.value})</div>
                      ) : (
                        <p className="mb-0">{answer.value}</p>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Filter Modal */}
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Advanced Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date Range</Form.Label>
                  <Form.Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Device Type</Form.Label>
                  <Form.Select value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value)}>
                    <option value="all">All Devices</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                    <option value="desktop">Desktop</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            setShowFilterModal(false);
            fetchResponses();
          }}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Export Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-3">
            <Button variant="outline-danger" onClick={handleExportPDF}>
              <i className="fas fa-file-pdf me-2"></i>
              Export as PDF Report
            </Button>
            <Button variant="outline-success" onClick={handleExportCSV}>
              <i className="fas fa-file-csv me-2"></i>
              Export as CSV Data
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default SurveyResponses;
