// src\pages\Surveys\SurveyResponses.jsx
"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Tab, Tabs,
  Form, Modal, Alert, Spinner, Table, InputGroup,
  OverlayTrigger, Tooltip, ProgressBar,
  Pagination, Toast, ToastContainer
} from 'react-bootstrap';
import {
  MdFilterList, MdDownload, MdVisibility, MdDelete,
  MdAnalytics, MdSentimentSatisfied, MdSentimentDissatisfied,
  MdSentimentNeutral, MdFlag, MdCheckCircle, MdWarning,
  MdSchedule, MdPerson, MdLocationOn, MdDevices,
  MdSearch, MdRefresh, MdAssignment, MdTrendingUp,
  MdNotifications, MdClose, MdCheck, MdArrowBack,
  MdQuestionAnswer, MdAccessTime, MdPublic, MdLock
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
import { getSurveyById, getSurveyResponses, exportSurveyReport } from '../../api/services/surveyService';
import { getSurveyAnalytics } from '../../api/services/analyticsService';
import { listActions } from '../../api/services/actionService';

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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('responses');

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResponses, setTotalResponses] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [anonymousFilter, setAnonymousFilter] = useState('all');

  // Analytics Data
  const [analytics, setAnalytics] = useState({
    totalResponses: 0,
    averageRating: 0,
    averageScore: 0,
    completionRate: 0,
    npsScore: 0,
    sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
    responsesByDate: [],
    ratingDistribution: []
  });

  // Actions
  const [actionItems, setActionItems] = useState([]);

  // Modals
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setError('');
      
      // Fetch survey details
      const surveyData = await getSurveyById(id);
      setSurvey(surveyData);

      // Build date filter params
      let startDate, endDate;
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
          break;
        case 'quarter':
          startDate = new Date(now.setMonth(now.getMonth() - 3)).toISOString();
          break;
        default:
          break;
      }

      // Fetch responses with filters
      const responsesData = await getSurveyResponses(id, {
        page: currentPage,
        limit: itemsPerPage,
        rating: ratingFilter !== 'all' ? ratingFilter : undefined,
        startDate,
        endDate,
        anonymous: anonymousFilter !== 'all' ? anonymousFilter : undefined,
        search: searchTerm || undefined
      });

      setResponses(responsesData.responses || []);
      setTotalResponses(responsesData.total || 0);
      setTotalPages(responsesData.totalPages || 1);
      setCurrentPage(responsesData.page || 1);

      // Fetch analytics
      try {
        const analyticsData = await getSurveyAnalytics(id);
        setAnalytics({
          totalResponses: analyticsData.overview?.totalResponses || responsesData.total || 0,
          averageRating: analyticsData.overview?.avgRating || 0,
          averageScore: analyticsData.overview?.avgScore || 0,
          completionRate: analyticsData.overview?.completionRate || 0,
          npsScore: analyticsData.nps?.score || 0,
          sentimentBreakdown: analyticsData.sentiment?.breakdown || { positive: 0, negative: 0, neutral: 0 },
          responsesByDate: analyticsData.trends?.responsesByDate || [],
          ratingDistribution: analyticsData.ratingDistribution || []
        });
      } catch (analyticsErr) {
        console.warn('Analytics fetch failed:', analyticsErr);
      }

      // Fetch actions for this survey
      try {
        const actionsData = await listActions({ surveyId: id, limit: 10 });
        setActionItems(actionsData.actions || []);
      } catch (actionsErr) {
        console.warn('Actions fetch failed:', actionsErr);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load survey responses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, currentPage, itemsPerPage, ratingFilter, dateFilter, anonymousFilter, searchTerm]);

  // Initial load and refresh on filter change
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    showSuccessToast('Data refreshed successfully!');
  };

  // Export Functions
  const handleExport = async (format) => {
    try {
      setExporting(true);
      const blob = await exportSurveyReport(id, format);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${survey?.title || 'survey'}_responses.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast(`${format.toUpperCase()} report downloaded successfully!`);
      setShowExportModal(false);
    } catch (err) {
      showErrorToast(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExporting(false);
    }
  };

  // Utility Functions
  const getRatingStars = (rating, maxRating = 5) => {
    if (!rating && rating !== 0) return <span className="text-muted">N/A</span>;
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        i <= rating ? 
        <FaStar key={i} className="text-warning" /> : 
        <FaRegStar key={i} className="text-muted" />
      );
    }
    return stars;
  };

  const getScoreBadge = (score) => {
    if (!score && score !== 0) return <Badge bg="secondary">N/A</Badge>;
    let variant = 'success';
    if (score < 40) variant = 'danger';
    else if (score < 70) variant = 'warning';
    return <Badge bg={variant}>{score}/100</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'danger',
      medium: 'warning',
      low: 'success'
    };
    return <Badge bg={variants[priority] || 'secondary'}>{priority?.toUpperCase() || 'N/A'}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      submitted: 'success',
      partial: 'warning',
      pending: 'info'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Get question text by ID from survey
  const getQuestionText = (questionId) => {
    if (!survey?.questions) return `Question ${questionId}`;
    const question = survey.questions.find(q => q._id === questionId || q.id === questionId);
    return question?.text || question?.title || `Question`;
  };

  // Chart Data
  const responsesTrendData = {
    labels: analytics.responsesByDate?.map(item => item.date || item._id) || [],
    datasets: [
      {
        label: 'Daily Responses',
        data: analytics.responsesByDate?.map(item => item.count) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true
      }
    ]
  };

  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          analytics.sentimentBreakdown.positive || 0,
          analytics.sentimentBreakdown.negative || 0,
          analytics.sentimentBreakdown.neutral || 0
        ],
        backgroundColor: ['#28a745', '#dc3545', '#ffc107']
      }
    ]
  };

  const ratingData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Responses by Rating',
        data: analytics.ratingDistribution?.map(item => item.count) || [0, 0, 0, 0, 0],
        backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#28a745']
      }
    ]
  };

  // Loading State
  if (loading && !responses.length) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading survey responses...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
          <MdWarning className="me-2" />
          {error}
          <Button variant="outline-danger" size="sm" className="ms-3" onClick={handleRefresh}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <Button
                    variant="link"
                    className="p-0 mb-2 text-decoration-none"
                    onClick={() => navigate(`/app/surveys/${id}`)}
                  >
                    <MdArrowBack className="me-1" />
                    Back to Survey Details
                  </Button>
                  <h1 className="h3 mb-1 fw-bold">
                    <MdQuestionAnswer className="me-2 text-primary" />
                    Survey Responses
                  </h1>
                  <p className="text-muted mb-2">{survey?.title || 'Loading...'}</p>
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    <Badge bg="primary" className="d-flex align-items-center">
                      <FaUsers className="me-1" />
                      {totalResponses} Responses
                    </Badge>
                    {analytics.averageRating > 0 && (
                      <Badge bg="success" className="d-flex align-items-center">
                        <FaStar className="me-1" />
                        {analytics.averageRating.toFixed(1)} Avg Rating
                      </Badge>
                    )}
                    {analytics.npsScore !== 0 && (
                      <Badge bg={analytics.npsScore >= 0 ? 'info' : 'warning'} className="d-flex align-items-center">
                        <MdTrendingUp className="me-1" />
                        NPS: {analytics.npsScore}
                      </Badge>
                    )}
                    {analytics.completionRate > 0 && (
                      <Badge bg="secondary" className="d-flex align-items-center">
                        <MdCheckCircle className="me-1" />
                        {analytics.completionRate}% Completion
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowFilterModal(true)}
                  >
                    <MdFilterList className="me-1" />
                    Filters
                  </Button>
                  <Button
                    variant="outline-success"
                    onClick={() => setShowExportModal(true)}
                  >
                    <MdDownload className="me-1" />
                    Export
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <Spinner animation="border" size="sm" className="me-1" />
                    ) : (
                      <MdRefresh className="me-1" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                className="px-3 pt-3"
              >
                {/* Responses Tab */}
                <Tab 
                  eventKey="responses" 
                  title={<span><MdVisibility className="me-1" />Responses ({totalResponses})</span>}
                >
                  <div className="p-4">
                    {/* Search and Quick Filters */}
                    <Row className="mb-4">
                      <Col lg={5}>
                        <InputGroup>
                          <InputGroup.Text><MdSearch /></InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Search by review text..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </InputGroup>
                      </Col>
                      <Col lg={7}>
                        <div className="d-flex gap-2 flex-wrap">
                          <Form.Select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                          </Form.Select>
                          <Form.Select
                            value={anonymousFilter}
                            onChange={(e) => setAnonymousFilter(e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            <option value="all">All Respondents</option>
                            <option value="true">Anonymous Only</option>
                            <option value="false">Identified Only</option>
                          </Form.Select>
                          <Form.Select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="quarter">Last 90 Days</option>
                          </Form.Select>
                        </div>
                      </Col>
                    </Row>

                    {/* Responses Table */}
                    {responses.length > 0 ? (
                      <>
                        <div className="table-responsive">
                          <Table hover className="align-middle">
                            <thead className="table-light">
                              <tr>
                                <th>ID</th>
                                <th>Submitted</th>
                                <th>Respondent</th>
                                <th>Rating</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {responses.map((response) => (
                                <tr key={response._id || response.id}>
                                  <td>
                                    <code className="text-primary">
                                      #{(response._id || response.id)?.slice(-6)}
                                    </code>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <MdAccessTime className="text-muted me-1" />
                                      <div>
                                        <div className="small">
                                          {new Date(response.submittedAt || response.createdAt).toLocaleDateString()}
                                        </div>
                                        <small className="text-muted">
                                          {new Date(response.submittedAt || response.createdAt).toLocaleTimeString()}
                                        </small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    {response.isAnonymous ? (
                                      <span className="d-flex align-items-center text-muted">
                                        <MdPublic className="me-1" />
                                        Anonymous
                                      </span>
                                    ) : (
                                      <span className="d-flex align-items-center">
                                        <MdPerson className="me-1 text-primary" />
                                        {response.user?.name || response.user?.email || response.respondent || 'User'}
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      {getRatingStars(response.rating)}
                                      {response.rating && (
                                        <span className="ms-2 small text-muted">({response.rating})</span>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    {getScoreBadge(response.score)}
                                  </td>
                                  <td>
                                    {getStatusBadge(response.status || 'submitted')}
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
                                      {response.score && response.score < 50 && (
                                        <OverlayTrigger overlay={<Tooltip>Low score - needs attention</Tooltip>}>
                                          <Button variant="outline-warning" size="sm">
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
                        <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
                          <div className="d-flex align-items-center gap-3">
                            <small className="text-muted">
                              Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                              {Math.min(currentPage * itemsPerPage, totalResponses)} of {totalResponses}
                            </small>
                            <Form.Select
                              size="sm"
                              value={itemsPerPage}
                              onChange={(e) => {
                                setItemsPerPage(parseInt(e.target.value));
                                setCurrentPage(1);
                              }}
                              style={{ width: 'auto' }}
                            >
                              <option value="10">10 / page</option>
                              <option value="20">20 / page</option>
                              <option value="50">50 / page</option>
                              <option value="100">100 / page</option>
                            </Form.Select>
                          </div>
                          
                          <Pagination className="mb-0">
                            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                            <Pagination.Prev onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} />
                            
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
                            
                            <Pagination.Next onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} />
                            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                          </Pagination>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-5">
                        <MdQuestionAnswer size={64} className="text-muted mb-3" />
                        <h5>No Responses Found</h5>
                        <p className="text-muted">
                          {searchTerm || ratingFilter !== 'all' || dateFilter !== 'all' 
                            ? 'Try adjusting your filters to see more results.'
                            : 'No responses have been submitted for this survey yet.'}
                        </p>
                        {(searchTerm || ratingFilter !== 'all' || dateFilter !== 'all') && (
                          <Button 
                            variant="outline-primary"
                            onClick={() => {
                              setSearchTerm('');
                              setRatingFilter('all');
                              setDateFilter('all');
                              setAnonymousFilter('all');
                            }}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Tab>

                {/* Analytics Tab */}
                <Tab 
                  eventKey="analytics" 
                  title={<span><MdAnalytics className="me-1" />Analytics</span>}
                >
                  <div className="p-4">
                    <Row>
                      {/* Summary Cards */}
                      <Col lg={3} md={6} className="mb-4">
                        <Card className="h-100 border-0 bg-primary bg-opacity-10">
                          <Card.Body className="text-center">
                            <FaUsers size={32} className="text-primary mb-2" />
                            <h3 className="mb-1">{analytics.totalResponses}</h3>
                            <p className="text-muted mb-0 small">Total Responses</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={3} md={6} className="mb-4">
                        <Card className="h-100 border-0 bg-success bg-opacity-10">
                          <Card.Body className="text-center">
                            <FaStar size={32} className="text-success mb-2" />
                            <h3 className="mb-1">{analytics.averageRating?.toFixed(1) || 'N/A'}</h3>
                            <p className="text-muted mb-0 small">Average Rating</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={3} md={6} className="mb-4">
                        <Card className="h-100 border-0 bg-info bg-opacity-10">
                          <Card.Body className="text-center">
                            <MdTrendingUp size={32} className="text-info mb-2" />
                            <h3 className="mb-1">{analytics.averageScore?.toFixed(0) || 'N/A'}</h3>
                            <p className="text-muted mb-0 small">Average Score</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={3} md={6} className="mb-4">
                        <Card className="h-100 border-0 bg-warning bg-opacity-10">
                          <Card.Body className="text-center">
                            <FaChartLine size={32} className="text-warning mb-2" />
                            <h3 className="mb-1">{analytics.npsScore || 'N/A'}</h3>
                            <p className="text-muted mb-0 small">NPS Score</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      {/* Response Trend Chart */}
                      <Col lg={8} className="mb-4">
                        <Card className="h-100">
                          <Card.Header className="bg-transparent">
                            <h6 className="mb-0">Response Trend</h6>
                          </Card.Header>
                          <Card.Body>
                            {analytics.responsesByDate?.length > 0 ? (
                              <Line 
                                data={responsesTrendData} 
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: true,
                                  plugins: { legend: { display: false } },
                                  scales: { y: { beginAtZero: true } }
                                }} 
                              />
                            ) : (
                              <div className="text-center py-5 text-muted">
                                <MdAnalytics size={48} className="mb-2" />
                                <p>No trend data available</p>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      {/* Rating Distribution */}
                      <Col lg={4} className="mb-4">
                        <Card className="h-100">
                          <Card.Header className="bg-transparent">
                            <h6 className="mb-0">Rating Distribution</h6>
                          </Card.Header>
                          <Card.Body>
                            <Bar 
                              data={ratingData} 
                              options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true } }
                              }} 
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Action Items Tab */}
                <Tab 
                  eventKey="actions" 
                  title={<span><MdAssignment className="me-1" />Actions ({actionItems.length})</span>}
                >
                  <div className="p-4">
                    {actionItems.length > 0 ? (
                      <Row>
                        {actionItems.map(action => (
                          <Col lg={6} key={action._id || action.id} className="mb-3">
                            <Card className={`border-start border-4 ${
                              action.priority === 'high' ? 'border-danger' : 
                              action.priority === 'medium' ? 'border-warning' : 'border-success'
                            }`}>
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    {getPriorityBadge(action.priority)}
                                    <Badge bg="secondary" className="ms-2">{action.status}</Badge>
                                  </div>
                                  <small className="text-muted">
                                    {formatDate(action.createdAt)}
                                  </small>
                                </div>
                                <h6 className="mb-2">{action.title}</h6>
                                <p className="text-muted small mb-2">{action.description}</p>
                                {action.assignedTo && (
                                  <Badge bg="info">
                                    Assigned: {action.assignedTo?.name || action.assignedTo}
                                  </Badge>
                                )}
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <div className="text-center py-5">
                        <MdAssignment size={64} className="text-muted mb-3" />
                        <h5>No Action Items</h5>
                        <p className="text-muted">No actions have been generated for this survey yet.</p>
                        <Button 
                          variant="outline-primary"
                          onClick={() => navigate(`/app/surveys/${id}/actions`)}
                        >
                          View All Actions
                        </Button>
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
            Response Details <code className="ms-2">#{(selectedResponse?._id || selectedResponse?.id)?.slice(-6)}</code>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedResponse && (
            <div>
              {/* Response Meta */}
              <Row className="mb-4">
                <Col md={6}>
                  <div className="mb-3">
                    <strong className="text-muted d-block small mb-1">Submitted</strong>
                    <span>{formatDate(selectedResponse.submittedAt || selectedResponse.createdAt)}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong className="text-muted d-block small mb-1">Respondent</strong>
                    <span>
                      {selectedResponse.isAnonymous 
                        ? 'Anonymous' 
                        : selectedResponse.user?.name || selectedResponse.user?.email || 'Unknown'}
                    </span>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <strong className="text-muted d-block small mb-1">Rating</strong>
                    <div>{getRatingStars(selectedResponse.rating)} {selectedResponse.rating && `(${selectedResponse.rating}/5)`}</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <strong className="text-muted d-block small mb-1">Score</strong>
                    {getScoreBadge(selectedResponse.score)}
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <strong className="text-muted d-block small mb-1">Status</strong>
                    {getStatusBadge(selectedResponse.status || 'submitted')}
                  </div>
                </Col>
              </Row>

              {/* Review Text */}
              {selectedResponse.review && (
                <div className="mb-4">
                  <strong className="text-muted d-block small mb-1">Review</strong>
                  <Card className="bg-light border-0">
                    <Card.Body>
                      <p className="mb-0">{selectedResponse.review}</p>
                    </Card.Body>
                  </Card>
                </div>
              )}

              <hr />

              {/* Answers */}
              <h6 className="mb-3">Answers</h6>
              {selectedResponse.answers?.length > 0 ? (
                selectedResponse.answers.map((answer, index) => (
                  <Card key={index} className="mb-2 border-0 bg-light">
                    <Card.Body className="py-3">
                      <strong className="d-block mb-2">
                        Q{index + 1}: {getQuestionText(answer.questionId)}
                      </strong>
                      <div className="ps-3">
                        {typeof answer.answer === 'object' ? (
                          <pre className="mb-0 small">{JSON.stringify(answer.answer, null, 2)}</pre>
                        ) : (
                          <p className="mb-0">{answer.answer || 'No answer provided'}</p>
                        )}
                        {answer.media?.length > 0 && (
                          <div className="mt-2">
                            <small className="text-muted">Attachments: {answer.media.length} file(s)</small>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <p className="text-muted">No individual answers recorded.</p>
              )}

              {/* IP Address (if available) */}
              {selectedResponse.ip && (
                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted">
                    <MdLocationOn className="me-1" />
                    IP: {selectedResponse.ip}
                  </small>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResponseModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Filter Modal */}
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Advanced Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date Range</Form.Label>
              <Form.Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Respondent Type</Form.Label>
              <Form.Select value={anonymousFilter} onChange={(e) => setAnonymousFilter(e.target.value)}>
                <option value="all">All Respondents</option>
                <option value="true">Anonymous Only</option>
                <option value="false">Identified Only</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              setDateFilter('all');
              setRatingFilter('all');
              setAnonymousFilter('all');
            }}
          >
            Reset
          </Button>
          <Button variant="primary" onClick={() => setShowFilterModal(false)}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Export Responses</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-3">
            <Button 
              variant="outline-danger" 
              onClick={() => handleExport('pdf')}
              disabled={exporting}
            >
              {exporting ? <Spinner size="sm" className="me-2" /> : <MdDownload className="me-2" />}
              Export as PDF Report
            </Button>
            <Button 
              variant="outline-success" 
              onClick={() => handleExport('csv')}
              disabled={exporting}
            >
              {exporting ? <Spinner size="sm" className="me-2" /> : <MdDownload className="me-2" />}
              Export as CSV Data
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Body className="text-white">
            {toastVariant === 'success' && <MdCheckCircle className="me-2" />}
            {toastVariant === 'danger' && <MdWarning className="me-2" />}
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default SurveyResponses;
