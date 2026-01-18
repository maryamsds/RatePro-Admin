// src\pages\Surveys\SurveyAnalytics.jsx

"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Tab, Tabs,
  Form, Modal, Alert, Spinner, Table, InputGroup,
  OverlayTrigger, Tooltip, Dropdown, ProgressBar,
  ButtonGroup, Toast, ToastContainer
} from 'react-bootstrap';
import {
  MdAnalytics, MdTrendingUp, MdTrendingDown, MdInsights,
  MdBarChart, MdPieChart, MdTimeline, MdCompare,
  MdFilterList, MdDownload, MdRefresh, MdVisibility,
  MdFlag, MdSentimentSatisfied, MdSentimentDissatisfied,
  MdSentimentNeutral, MdDateRange, MdDevices, MdLocationOn,
  MdPeople, MdThumbUp, MdThumbDown, MdWarning,
  MdCheckCircle, MdCancel, MdSchedule, MdShare
} from 'react-icons/md';
import {
  FaStar, FaRegStar, FaUsers, FaChartLine, FaEye,
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMobile,
  FaDesktop, FaTabletAlt, FaChartBar, FaChartPie,
  FaExclamationTriangle, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import {
  Line, Bar, Doughnut, Pie, Radar, PolarArea
} from 'react-chartjs-2';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// API Services
import { getSurveyById, exportSurveyReport } from '../../api/services/surveyService';
import {
  getSurveyAnalytics,
  getSurveySentiment,
  getSentimentHeatmap,
  getSurveySummary,
  getSurveyResponses,
  exportResponsesCSV,
  exportAnalyticsPDF,
  downloadFile,
  getSurveyDemographics
} from '../../api/services/analyticsService';


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

const SurveyAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Management
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last30days');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());

  // Analytics Data
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalResponses: 0,
      averageRating: 0,
      completionRate: 0,
      npsScore: 0,
      responseRate: 0,
      satisfactionScore: 0,
      benchmarkComparison: 0
    },
    trends: {
      responsesByDate: [],
      ratingTrends: [],
      completionTrends: [],
      npsHistory: []
    },
    demographics: {
      byDevice: [],
      byLocation: [],
      byTimeOfDay: [],
      byDayOfWeek: []
    },
    sentiment: {
      breakdown: { positive: 0, negative: 0, neutral: 0 },
      topKeywords: [],
      emotionalTrends: [],
      satisfactionDrivers: []
    },
    questions: {
      performance: [],
      dropoffPoints: [],
      timeSpent: [],
      skipRates: []
    },
    feedback: {
      topComplaints: [],
      topPraises: [],
      urgentIssues: [],
      actionableInsights: []
    }
  });

  // UI States
  const [chartType, setChartType] = useState('line');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('responses');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Fetch Data
  // const fetchData = useCallback(async (showRefreshSpinner = false) => {
  //   try {
  //     if (showRefreshSpinner) setRefreshing(true);
  //     else setLoading(true);
  //     setError('');

  //     // Convert dateRange to API format
  //     const rangeMap = {
  //       'last7days': '7d',
  //       'last30days': '30d',
  //       'last90days': '90d',
  //       'custom': 'custom'
  //     };

  //     // Fetch survey and analytics in parallel
  //     const [surveyData, analytics] = await Promise.all([
  //       getSurveyById(id).catch(err => {
  //         console.warn('Survey fetch error:', err.message);
  //         return null;
  //       }),
  //       getSurveyAnalytics(id, {
  //         dateRange: rangeMap[dateRange] || '30d',
  //         startDate: dateRange === 'custom' ? startDate.toISOString() : undefined,
  //         endDate: dateRange === 'custom' ? endDate.toISOString() : undefined,
  //       }).catch(err => {
  //         console.warn('Analytics fetch error:', err.message);
  //         return null;
  //       }),
  //     ]);

  //     if (surveyData) {
  //       setSurvey(surveyData);
  //     }

  //     if (analytics) {
  //       setAnalyticsData(analytics);
  //     }

  //   } catch (err) {
  //     console.error('Error fetching data:', err);
  //     setError('Failed to load analytics data. Please try again.');
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // }, [id, dateRange, startDate, endDate]);

  const fetchData = useCallback(async (showRefreshSpinner = false) => {
    console.groupCollapsed('[SurveyAnalytics] fetchData');

    try {
      console.log('Params:', {
        surveyId: id,
        dateRange,
        startDate,
        endDate,
        showRefreshSpinner,
      });

      if (showRefreshSpinner) {
        setRefreshing(true);
        console.log('Refreshing spinner enabled');
      } else {
        setLoading(true);
        console.log('Loading spinner enabled');
      }

      setError('');

      const rangeMap = {
        last7days: '7d',
        last30days: '30d',
        last90days: '90d',
        custom: 'custom',
      };

      const analyticsParams = {
        dateRange: rangeMap[dateRange] || '30d',
        startDate: dateRange === 'custom' ? startDate?.toISOString() : undefined,
        endDate: dateRange === 'custom' ? endDate?.toISOString() : undefined,
      };

      console.log('Analytics API Params:', analyticsParams);

      const [surveyData, analytics, demographics] = await Promise.all([
        getSurveyById(id).catch(err => {
          console.warn('[SurveyAnalytics] Survey fetch failed:', {
            message: err.message,
            status: err?.response?.status,
          });
          return null;
        }),
        getSurveyAnalytics(id, analyticsParams).catch(err => {
          console.warn('[SurveyAnalytics] Analytics fetch failed:', {
            message: err.message,
            status: err?.response?.status,
          });
          return null;
        }),
        getSurveyDemographics(id, { days: 30 }).catch(err => {
          console.warn('[SurveyAnalytics] Demographics fetch failed:', {
            message: err.message,
            status: err?.response?.status,
          });
          return null;
        }),
      ]);

      console.log('Survey Response:', surveyData);
      console.log('Analytics Response:', analytics);
      console.log('Demographics Response:', demographics);

      if (surveyData) {
        setSurvey(surveyData);
        console.log('Survey state updated');
      }

      if (analytics) {
        // Merge demographics data into analytics if available
        const mergedAnalytics = {
          ...analytics,
          demographics: demographics ? {
            byDevice: demographics.byDevice || [],
            byLocation: demographics.byLocation || [],
            byTimeOfDay: demographics.byHour || [],
            byDayOfWeek: demographics.byDayOfWeek || []
          } : analytics.demographics
        };
        setAnalyticsData(mergedAnalytics);
        console.log('Analytics state updated with demographics');
      }

    } catch (err) {
      console.error('[SurveyAnalytics] Fatal fetch error:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('Loading states reset');
      console.groupEnd();
    }
  }, [id, dateRange, startDate, endDate]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle refresh
  const handleRefresh = () => {
    fetchData(true);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Export Functions
  const handleExportPDF = async () => {
    try {
      const rangeMap = {
        last7days: '7d',
        last30days: '30d',
        last90days: '90d',
        custom: 'custom'
      };

      const blob = await exportAnalyticsPDF(id, {
        range: rangeMap[dateRange] || '30d'
      });

      downloadFile(blob, `${survey?.title || 'survey'}_analytics.pdf`);

      showSuccessToast('Analytics report downloaded successfully!');
      setShowExportModal(false);
    } catch (err) {
      console.error('Export PDF error:', err);
      showErrorToast('Failed to export analytics report');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await exportResponsesCSV(id, {
        startDate: dateRange === 'custom' ? startDate?.toISOString() : undefined,
        endDate: dateRange === 'custom' ? endDate?.toISOString() : undefined,
      });

      downloadFile(blob, `${survey?.title || 'survey'}_responses.csv`);

      showSuccessToast('Responses exported successfully!');
      setShowExportModal(false);
    } catch (err) {
      console.error('Export CSV error:', err);
      showErrorToast('Failed to export responses');
    }
  };

  // Utility Functions
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

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <MdSentimentSatisfied className="text-success" />;
      case 'negative': return <MdSentimentDissatisfied className="text-danger" />;
      default: return <MdSentimentNeutral className="text-warning" />;
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <FaArrowUp className="text-success" />;
    if (trend < 0) return <FaArrowDown className="text-danger" />;
    return <span className="text-muted">—</span>;
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  // Chart Data
  const responsesTrendData = {
    labels: analyticsData.trends.responsesByDate?.map(item =>
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Daily Responses',
        data: analyticsData.trends.responsesByDate?.map(item => item.count) || [],
        borderColor: 'rgb(var(--bs-teal-rgb))',
        backgroundColor: 'rgba(var(--bs-teal-rgb), 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart Data - Rating Trends (fix field name)
  const ratingTrendData = {
    labels: analyticsData.trends.ratingTrends?.map(item =>
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Average Rating',
        data: analyticsData.trends.ratingTrends?.map(item => item.rating || item.avgRating || 0) || [],
        borderColor: 'rgb(var(--bs-warning-rgb))',
        backgroundColor: 'rgba(var(--bs-warning-rgb), 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // NPS History (fix field name from npsScore to score)
  const npsData = {
    labels: analyticsData.trends.npsHistory?.map(item =>
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'NPS Score',
        data: analyticsData.trends.npsHistory?.map(item => item.score || item.npsScore || 0) || [],
        borderColor: 'rgb(var(--bs-primary-rgb))',
        backgroundColor: 'rgba(var(--bs-primary-rgb), 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          analyticsData.sentiment.breakdown.positive,
          analyticsData.sentiment.breakdown.negative,
          analyticsData.sentiment.breakdown.neutral
        ],
        backgroundColor: [
          '#28a745',
          '#dc3545',
          '#ffc107'
        ],
        borderWidth: 2,
        borderColor: 'var(--bs-white)'
      }
    ]
  };

  const deviceData = {
    labels: analyticsData.demographics.byDevice?.map(item => item.device) || [],
    datasets: [
      {
        label: 'Responses by Device',
        data: analyticsData.demographics.byDevice?.map(item => item.count) || [],
        backgroundColor: [
          '#007bff',
          '#28a745',
          '#ffc107',
          '#dc3545'
        ]
      }
    ]
  };

  const questionPerformanceData = {
    labels: analyticsData.questions.performance?.map(q => `Q${q.questionNumber}`) || [],
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: analyticsData.questions.performance?.map(q => q.completionRate) || [],
        backgroundColor: 'rgba(var(--bs-primary-rgb), 0.8)',
        borderColor: 'rgb(var(--bs-primary-rgb))',
        borderWidth: 1
      },
      {
        label: 'Average Rating',
        data: analyticsData.questions.performance?.map(q => q.averageRating * 20) || [], // Scale to 100
        backgroundColor: 'rgba(var(--bs-warning-rgb), 0.8)',
        borderColor: 'rgb(var(--bs-warning-rgb))',
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading analytics data...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger" className="text-center">
          <MdFlag className="me-2" size={24} />
          {error}
          <div className="mt-3">
            <Button variant="outline-danger" onClick={() => navigate(`/app/surveys`)}>
              Back to Survey
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <Card className="analytics-header shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <Button
                    variant="link"
                    className="p-0 mb-2 text-primary"
                    onClick={() => navigate(`/app/surveys`)}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Survey
                  </Button>
                  <h1 className="h3 mb-1 fw-bold">
                    <MdAnalytics className="me-2 text-primary" />
                    Survey Analytics
                  </h1>
                  <p className="text-muted mb-0">{survey?.title}</p>
                  <div className="d-flex align-items-center mt-2 gap-3">
                    <Badge bg="primary" className="d-flex align-items-center">
                      <FaUsers className="me-1" />
                      {analyticsData.overview.totalResponses} Total Responses
                    </Badge>
                    <Badge bg="success" className="d-flex align-items-center">
                      <FaStar className="me-1" />
                      {analyticsData.overview.averageRating.toFixed(1)} Avg Rating
                    </Badge>
                    <Badge bg="info" className="d-flex align-items-center">
                      <MdTrendingUp className="me-1" />
                      {analyticsData.overview.npsScore} NPS Score
                    </Badge>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-primary" size="sm">
                      <MdDateRange className="me-2" />
                      {dateRange === 'custom' ? 'Custom Range' :
                        dateRange === 'today' ? 'Today' :
                          dateRange === 'yesterday' ? 'Yesterday' :
                            dateRange === 'last7days' ? 'Last 7 Days' :
                              dateRange === 'last30days' ? 'Last 30 Days' :
                                dateRange === 'last3months' ? 'Last 3 Months' : 'All Time'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleDateRangeChange('today')}>Today</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDateRangeChange('yesterday')}>Yesterday</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDateRangeChange('last7days')}>Last 7 Days</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDateRangeChange('last30days')}>Last 30 Days</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDateRangeChange('last3months')}>Last 3 Months</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDateRangeChange('alltime')}>All Time</Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => setShowFilterModal(true)}>Custom Range</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => setShowExportModal(true)}
                  >
                    <MdDownload className="me-2" />
                    Export
                  </Button>

                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <MdRefresh className="me-2" />
                    )}
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Key Metrics Cards */}
      <Row className="mb-4">
        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="metrics-card h-100">
            <Card.Body className="text-center p-3">
              <div className="metrics-icon bg-primary bg-opacity-10 text-primary rounded-circle mx-auto mb-2">
                <FaUsers size={24} />
              </div>
              <h4 className="mb-1">{analyticsData.overview.totalResponses}</h4>
              <small className="text-muted">Total Responses</small>
              {analyticsData.trends?.responseTrend !== undefined && (
                <div className="mt-1">
                  {getTrendIcon(analyticsData.trends.responseTrend)}
                  <small className={`ms-1 ${analyticsData.trends.responseTrend >= 0 ? 'text-success' : 'text-danger'}`}>
                    {analyticsData.trends.responseTrend >= 0 ? '+' : ''}{analyticsData.trends.responseTrend?.toFixed(1) || 0}%
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="metrics-card h-100">
            <Card.Body className="text-center p-3">
              <div className="metrics-icon bg-success bg-opacity-10 text-success rounded-circle mx-auto mb-2">
                <FaStar size={24} />
              </div>
              <h4 className="mb-1">{analyticsData.overview.averageRating?.toFixed(1) || 0}</h4>
              <small className="text-muted">Average Rating</small>
              {analyticsData.trends?.ratingTrend !== undefined && (
                <div className="mt-1">
                  {getTrendIcon(analyticsData.trends.ratingTrend)}
                  <small className={`ms-1 ${analyticsData.trends.ratingTrend >= 0 ? 'text-success' : 'text-danger'}`}>
                    {analyticsData.trends.ratingTrend >= 0 ? '+' : ''}{analyticsData.trends.ratingTrend?.toFixed(1) || 0}%
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="metrics-card h-100">
            <Card.Body className="text-center p-3">
              <div className="metrics-icon bg-info bg-opacity-10 text-info rounded-circle mx-auto mb-2">
                <MdCheckCircle size={24} />
              </div>
              <h4 className="mb-1">{analyticsData.overview.completionRate || 0}%</h4>
              <small className="text-muted">Completion Rate</small>
              {analyticsData.trends?.completionTrend !== undefined && (
                <div className="mt-1">
                  {getTrendIcon(analyticsData.trends.completionTrend)}
                  <small className={`ms-1 ${analyticsData.trends.completionTrend >= 0 ? 'text-success' : 'text-danger'}`}>
                    {analyticsData.trends.completionTrend >= 0 ? '+' : ''}{analyticsData.trends.completionTrend?.toFixed(1) || 0}%
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="metrics-card h-100">
            <Card.Body className="text-center p-3">
              <div className="metrics-icon bg-warning bg-opacity-10 text-warning rounded-circle mx-auto mb-2">
                <FaChartLine size={24} />
              </div>
              <h4 className="mb-1">{analyticsData.overview.npsScore || 0}</h4>
              <small className="text-muted">NPS Score</small>
              {analyticsData.nps?.trend !== undefined && (
                <div className="mt-1">
                  {getTrendIcon(analyticsData.nps.trend)}
                  <small className={`ms-1 ${analyticsData.nps.trend >= 0 ? 'text-success' : 'text-danger'}`}>
                    {analyticsData.nps.trend >= 0 ? '+' : ''}{analyticsData.nps.trend?.toFixed(1) || 0}%
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="metrics-card h-100">
            <Card.Body className="text-center p-3">
              <div className="metrics-icon bg-purple bg-opacity-10 text-purple rounded-circle mx-auto mb-2">
                <MdSentimentSatisfied size={24} />
              </div>
              <h4 className="mb-1">{analyticsData.overview.satisfactionScore || 0}%</h4>
              <small className="text-muted">Satisfaction</small>
              {analyticsData.trends?.satisfactionTrend !== undefined && (
                <div className="mt-1">
                  {getTrendIcon(analyticsData.trends.satisfactionTrend)}
                  <small className={`ms-1 ${analyticsData.trends.satisfactionTrend >= 0 ? 'text-success' : 'text-danger'}`}>
                    {analyticsData.trends.satisfactionTrend >= 0 ? '+' : ''}{analyticsData.trends.satisfactionTrend?.toFixed(1) || 0}%
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="metrics-card h-100">
            <Card.Body className="text-center p-3">
              <div className="metrics-icon bg-teal bg-opacity-10 text-teal rounded-circle mx-auto mb-2">
                <MdCompare size={24} />
              </div>
              <h4 className="mb-1">{analyticsData.overview.benchmarkComparison || 0}%</h4>
              <small className="text-muted">vs Industry</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Analytics Content */}
      <Row>
        <Col>
          <Card className="analytics-content-card">
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                className="analytics-tabs"
              >
                {/* Overview Tab */}
                <Tab eventKey="overview" title={
                  <span><MdInsights className="me-2" />Overview</span>
                }>
                  <div className="p-4">
                    <Row>
                      {/* Response Trends */}
                      <Col lg={8} className="mb-4">
                        <Card>
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <Card.Title className="mb-0">Response Trends</Card.Title>
                            <ButtonGroup size="sm">
                              <Button
                                variant={selectedMetric === 'responses' ? 'primary' : 'outline-primary'}
                                onClick={() => setSelectedMetric('responses')}
                              >
                                Responses
                              </Button>
                              <Button
                                variant={selectedMetric === 'ratings' ? 'primary' : 'outline-primary'}
                                onClick={() => setSelectedMetric('ratings')}
                              >
                                Ratings
                              </Button>
                              <Button
                                variant={selectedMetric === 'nps' ? 'primary' : 'outline-primary'}
                                onClick={() => setSelectedMetric('nps')}
                              >
                                NPS
                              </Button>
                            </ButtonGroup>
                          </Card.Header>
                          <Card.Body>
                            {selectedMetric === 'responses' && (
                              <Line data={responsesTrendData} options={{
                                responsive: true,
                                plugins: {
                                  legend: { display: false },
                                  title: { display: false }
                                },
                                scales: {
                                  y: { beginAtZero: true }
                                }
                              }} />
                            )}
                            {selectedMetric === 'ratings' && (
                              <Line data={ratingTrendData} options={{
                                responsive: true,
                                plugins: {
                                  legend: { display: false },
                                  title: { display: false }
                                },
                                scales: {
                                  y: { beginAtZero: true, max: 5 }
                                }
                              }} />
                            )}
                            {selectedMetric === 'nps' && (
                              <Line data={npsData} options={{
                                responsive: true,
                                plugins: {
                                  legend: { display: false },
                                  title: { display: false }
                                },
                                scales: {
                                  y: { beginAtZero: false, min: -100, max: 100 }
                                }
                              }} />
                            )}
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
                                legend: { position: 'bottom' }
                              }
                            }} />

                            <div className="mt-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="d-flex align-items-center">
                                  <div className="sentiment-dot bg-success me-2"></div>
                                  Positive
                                </span>
                                <strong>{analyticsData.sentiment.breakdown.positive}%</strong>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="d-flex align-items-center">
                                  <div className="sentiment-dot bg-danger me-2"></div>
                                  Negative
                                </span>
                                <strong>{analyticsData.sentiment.breakdown.negative}%</strong>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="d-flex align-items-center">
                                  <div className="sentiment-dot bg-warning me-2"></div>
                                  Neutral
                                </span>
                                <strong>{analyticsData.sentiment.breakdown.neutral}%</strong>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      {/* Device Breakdown */}
                      <Col lg={6} className="mb-4">
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Device Usage</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <Bar data={deviceData} options={{
                              responsive: true,
                              plugins: {
                                legend: { display: false }
                              }
                            }} />
                          </Card.Body>
                        </Card>
                      </Col>

                      {/* Question Performance */}
                      <Col lg={6} className="mb-4">
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Question Performance</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <Bar data={questionPerformanceData} options={{
                              responsive: true,
                              plugins: {
                                legend: { position: 'top' }
                              },
                              scales: {
                                y: { beginAtZero: true, max: 100 }
                              }
                            }} />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Demographics Tab */}
                <Tab eventKey="demographics" title={
                  <span><MdPeople className="me-2" />Demographics</span>
                }>
                  <div className="p-4">
                    <Row>
                      <Col lg={6} className="mb-4">
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">
                              <MdLocationOn className="me-2" />
                              Responses by Location
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <div className="location-list">
                              {analyticsData.demographics.byLocation?.map((location, index) => (
                                <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                                  <div className="d-flex align-items-center">
                                    <FaMapMarkerAlt className="text-primary me-2" />
                                    <span>{location.city || 'Unknown'}</span>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <div className="progress-sm me-3" style={{ width: '100px' }}>
                                      <ProgressBar now={location.percentage} variant="primary" />
                                    </div>
                                    <Badge bg="primary">{location.count}</Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={6} className="mb-4">
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">
                              <MdSchedule className="me-2" />
                              Response Time Patterns
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <div className="time-patterns">
                              <h6 className="mb-3">Peak Hours</h6>
                              {analyticsData.demographics.byTimeOfDay?.map((timeSlot, index) => (
                                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                  <span>{timeSlot.hour}:00</span>
                                  <div className="d-flex align-items-center">
                                    <div className="progress-sm me-2" style={{ width: '80px' }}>
                                      <ProgressBar now={timeSlot.percentage} variant="info" />
                                    </div>
                                    <small>{timeSlot.count}</small>
                                  </div>
                                </div>
                              ))}

                              <hr />

                              <h6 className="mb-3">Peak Days</h6>
                              {analyticsData.demographics.byDayOfWeek?.map((day, index) => (
                                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                  <span>{day.dayName}</span>
                                  <div className="d-flex align-items-center">
                                    <div className="progress-sm me-2" style={{ width: '80px' }}>
                                      <ProgressBar now={day.percentage} variant="success" />
                                    </div>
                                    <small>{day.count}</small>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Feedback Analysis Tab */}
                <Tab eventKey="feedback" title={
                  <span><MdFlag className="me-2" />Feedback Analysis</span>
                }>
                  <div className="p-4">
                    <Row>
                      <Col lg={6} className="mb-4">
                        <Card className="h-100">
                          <Card.Header className="bg-danger bg-opacity-10">
                            <Card.Title className="mb-0 text-danger">
                              <MdThumbDown className="me-2" />
                              Top Complaints ({analyticsData.feedback.topComplaints?.length || 0})
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            {analyticsData.feedback.topComplaints?.map((complaint, index) => (
                              <div key={index} className="complaint-item mb-3 p-3 border rounded">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="mb-0">{complaint.category}</h6>
                                  <Badge bg="danger">{complaint.count} mentions</Badge>
                                </div>
                                <p className="text-muted small mb-2">{complaint.description}</p>
                                <div className="d-flex align-items-center">
                                  <div className="progress-sm flex-grow-1 me-2">
                                    <ProgressBar now={complaint.severity} variant="danger" />
                                  </div>
                                  <small className="text-muted">Severity: {complaint.severity}%</small>
                                </div>
                              </div>
                            ))}

                            {(!analyticsData.feedback.topComplaints || analyticsData.feedback.topComplaints.length === 0) && (
                              <div className="text-center py-4">
                                <MdCheckCircle size={48} className="text-success mb-3" />
                                <p className="text-muted">No major complaints identified!</p>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={6} className="mb-4">
                        <Card className="h-100">
                          <Card.Header className="bg-success bg-opacity-10">
                            <Card.Title className="mb-0 text-success">
                              <MdThumbUp className="me-2" />
                              Top Praises ({analyticsData.feedback.topPraises?.length || 0})
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            {analyticsData.feedback.topPraises?.map((praise, index) => (
                              <div key={index} className="praise-item mb-3 p-3 border rounded">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="mb-0">{praise.category}</h6>
                                  <Badge bg="success">{praise.count} mentions</Badge>
                                </div>
                                <p className="text-muted small mb-2">{praise.description}</p>
                                <div className="d-flex align-items-center">
                                  <div className="progress-sm flex-grow-1 me-2">
                                    <ProgressBar now={praise.impact} variant="success" />
                                  </div>
                                  <small className="text-muted">Impact: {praise.impact}%</small>
                                </div>
                              </div>
                            ))}

                            {(!analyticsData.feedback.topPraises || analyticsData.feedback.topPraises.length === 0) && (
                              <div className="text-center py-4">
                                <MdSentimentNeutral size={48} className="text-muted mb-3" />
                                <p className="text-muted">No specific praises identified yet.</p>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        <Card>
                          <Card.Header className="bg-warning bg-opacity-10">
                            <Card.Title className="mb-0 text-warning">
                              <MdWarning className="me-2" />
                              Urgent Issues & Actionable Insights
                            </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              <Col lg={6}>
                                <h6 className="text-danger mb-3">
                                  <FaExclamationTriangle className="me-2" />
                                  Urgent Issues
                                </h6>
                                {analyticsData.feedback.urgentIssues?.map((issue, index) => (
                                  <Alert key={index} variant="danger" className="mb-2">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <strong>{issue.title}</strong>
                                        <p className="mb-0 small">{issue.description}</p>
                                      </div>
                                      <Badge bg="danger">{issue.priority}</Badge>
                                    </div>
                                  </Alert>
                                ))}
                              </Col>

                              <Col lg={6}>
                                <h6 className="text-info mb-3">
                                  <MdInsights className="me-2" />
                                  Actionable Insights
                                </h6>
                                {analyticsData.feedback.actionableInsights?.map((insight, index) => (
                                  <Alert key={index} variant="info" className="mb-2">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <strong>{insight.title}</strong>
                                        <p className="mb-0 small">{insight.recommendation}</p>
                                      </div>
                                      <Badge bg="info">{insight.impact}</Badge>
                                    </div>
                                  </Alert>
                                ))}
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Question Analysis Tab */}
                <Tab eventKey="questions" title={
                  <span><MdBarChart className="me-2" />Question Analysis</span>
                }>
                  <div className="p-4">
                    <Row className="mb-4">
                      <Col>
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Question Performance Overview</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <div className="table-responsive">
                              <Table hover>
                                <thead>
                                  <tr>
                                    <th>Question</th>
                                    <th>Completion Rate</th>
                                    <th>Avg. Rating</th>
                                    <th>Time Spent</th>
                                    <th>Skip Rate</th>
                                    <th>Performance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {analyticsData.questions.performance?.map((question, index) => (
                                    <tr key={index}>
                                      <td>
                                        <div>
                                          <strong>Q{question.questionNumber}</strong>
                                          <div className="small text-muted">{question.title}</div>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          <div className="progress-sm me-2" style={{ width: '60px' }}>
                                            <ProgressBar
                                              now={question.completionRate}
                                              variant={getPerformanceColor(question.completionRate)}
                                            />
                                          </div>
                                          <span>{question.completionRate}%</span>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          {getRatingStars(Math.round(question.averageRating))}
                                          <span className="ms-2">({question.averageRating.toFixed(1)})</span>
                                        </div>
                                      </td>
                                      <td>
                                        <span className="badge bg-light text-dark">
                                          {question.averageTimeSpent}s
                                        </span>
                                      </td>
                                      <td>
                                        <span className={`badge ${question.skipRate > 20 ? 'bg-danger' : question.skipRate > 10 ? 'bg-warning' : 'bg-success'}`}>
                                          {question.skipRate}%
                                        </span>
                                      </td>
                                      <td>
                                        <Badge bg={getPerformanceColor(question.performanceScore)}>
                                          {question.performanceScore}%
                                        </Badge>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      <Col lg={6} className="mb-4">
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Drop-off Points</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            {analyticsData.questions.dropoffPoints?.map((point, index) => (
                              <div key={index} className="dropoff-item mb-3 p-3 border rounded">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <strong>Question {point.questionNumber}</strong>
                                  <Badge bg="warning">{point.dropoffRate}% dropout</Badge>
                                </div>
                                <p className="text-muted small mb-2">{point.questionTitle}</p>
                                <div className="d-flex align-items-center justify-content-between">
                                  <small className="text-muted">
                                    {point.usersReached} users reached • {point.usersCompleted} completed
                                  </small>
                                  <small className="text-danger">
                                    -{point.usersDropped} users
                                  </small>
                                </div>
                              </div>
                            ))}
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={6} className="mb-4">
                        <Card>
                          <Card.Header>
                            <Card.Title className="mb-0">Time Analysis</Card.Title>
                          </Card.Header>
                          <Card.Body>
                            {analyticsData.questions.timeSpent?.map((time, index) => (
                              <div key={index} className="time-item mb-3 p-3 border rounded">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <strong>Question {time.questionNumber}</strong>
                                  <Badge bg="info">{time.averageTime}s avg</Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center text-muted small">
                                  <span>Min: {time.minTime}s</span>
                                  <span>Max: {time.maxTime}s</span>
                                  <span>Median: {time.medianTime}s</span>
                                </div>
                                <div className="mt-2">
                                  <div className="progress-sm">
                                    <ProgressBar
                                      now={(time.averageTime / time.maxTime) * 100}
                                      variant="info"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
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

      {/* Custom Date Range Modal */}
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Custom Date Range</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            setDateRange('custom');
            setShowFilterModal(false);
            handleRefresh();
          }}>
            Apply Range
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Export Analytics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-3">
            <Button variant="outline-danger" onClick={handleExportPDF}>
              <i className="fas fa-file-pdf me-2"></i>
              Export as PDF Report
            </Button>
            <Button variant="outline-success" onClick={handleExportExcel}>
              <i className="fas fa-file-excel me-2"></i>
              Export as Excel Spreadsheet
            </Button>
            <Button variant="outline-primary" onClick={() => {
              // Share functionality
              if (navigator.share) {
                navigator.share({
                  title: `${survey.title} - Analytics Report`,
                  text: `Check out the analytics for ${survey.title}`,
                  url: window.location.href
                });
              }
            }}>
              <MdShare className="me-2" />
              Share Analytics Link
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

export default SurveyAnalytics;
