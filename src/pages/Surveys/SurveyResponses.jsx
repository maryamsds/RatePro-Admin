// src\pages\Surveys\SurveyResponses.jsx
"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

      console.log('Responses Data:', responsesData);

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
    if (!rating && rating !== 0) return <span className="text-[var(--text-secondary)]">N/A</span>;
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        i <= rating ?
          <FaStar key={i} className="text-yellow-500" /> :
          <FaRegStar key={i} className="text-[var(--text-secondary)]" />
      );
    }
    return stars;
  };

  const badgeColors = {
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    primary: 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]'
  };

  const getScoreBadge = (score) => {
    if (!score && score !== 0) return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors.secondary}`}>N/A</span>;
    let variant = 'success';
    if (score < 40) variant = 'danger';
    else if (score < 70) variant = 'warning';
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[variant]}`}>{score}/100</span>;
  };

  const getPriorityBadge = (priority) => {
    const variants = { high: 'danger', medium: 'warning', low: 'success' };
    const v = variants[priority] || 'secondary';
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[v]}`}>{priority?.toUpperCase() || 'N/A'}</span>;
  };

  const getStatusBadge = (status) => {
    const variants = { submitted: 'success', partial: 'warning', pending: 'info' };
    const v = variants[status] || 'secondary';
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[v]}`}>{status}</span>;
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
      <div className="w-full py-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)] mx-auto"></div>
          <p className="mt-3 text-[var(--text-secondary)]">Loading survey responses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between p-4 mb-4 bg-[var(--danger-light)] text-[var(--danger-color)] border border-[var(--danger-color)]/30 rounded-md">
          <div className="flex items-center">
            <MdWarning className="mr-2" />
            {error}
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm border border-[var(--danger-color)]/50 text-[var(--danger-color)] rounded-md hover:bg-[var(--danger-color)]/10 transition-colors" onClick={handleRefresh}>Retry</button>
            <button className="text-[var(--danger-color)]/60 hover:text-[var(--danger-color)]" onClick={() => setError('')}>&times;</button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div>
              <button className="flex items-center text-[var(--primary-color)] hover:underline mb-2 p-0 bg-transparent border-0" onClick={() => navigate(`/app/surveys/${id}`)}>
                <MdArrowBack className="mr-1" />
                Back to Survey Details
              </button>
              <h1 className="text-xl font-bold mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                <MdQuestionAnswer className="mr-2 text-[var(--primary-color)] inline" />
                Survey Responses
              </h1>
              <p className="text-[var(--text-secondary)] mb-2">{survey?.title || 'Loading...'}</p>
              <div className="flex items-center flex-wrap gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors.primary}`}>
                  <FaUsers className="mr-1" /> {totalResponses} Responses
                </span>
                {analytics.averageRating > 0 && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors.success}`}>
                    <FaStar className="mr-1" /> {analytics.averageRating.toFixed(1)} Avg Rating
                  </span>
                )}
                {analytics.npsScore !== 0 && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${analytics.npsScore >= 0 ? badgeColors.info : badgeColors.warning}`}>
                    <MdTrendingUp className="mr-1" /> NPS: {analytics.npsScore}
                  </span>
                )}
                {analytics.completionRate > 0 && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors.secondary}`}>
                    <MdCheckCircle className="mr-1" /> {analytics.completionRate}% Completion
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] flex items-center" onClick={() => setShowFilterModal(true)}>
                <MdFilterList className="mr-1" /> Filters
              </button>
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--success-color)] text-white hover:opacity-80 flex items-center" onClick={() => setShowExportModal(true)}>
                <MdDownload className="mr-1" /> Export
              </button>
              <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] flex items-center disabled:opacity-50" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary-color)] mr-1"></div>
                ) : (
                  <MdRefresh className="mr-1" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] px-3 pt-3">
          {[
            { key: 'responses', icon: <MdVisibility className="mr-1" />, label: `Responses (${totalResponses})` },
            { key: 'analytics', icon: <MdAnalytics className="mr-1" />, label: 'Analytics' },
            { key: 'actions', icon: <MdAssignment className="mr-1" />, label: `Actions (${actionItems.length})` }
          ].map(tab => (
            <button key={tab.key} className={`flex items-center px-4 py-3 border-b-2 transition-colors ${activeTab === tab.key ? 'border-[var(--primary-color)] text-[var(--primary-color)] font-medium' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--primary-color)]'}`} onClick={() => setActiveTab(tab.key)}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Responses Tab */}
        {activeTab === 'responses' && (
          <div className="p-4">
            {/* Search and Quick Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md overflow-hidden flex-1 min-w-[250px] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                <span className="px-3 text-[var(--text-secondary)]"><MdSearch /></span>
                <input type="text" placeholder="Search by review text..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-2 py-2 bg-transparent border-0 outline-none text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30">
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
                <select value={anonymousFilter} onChange={(e) => setAnonymousFilter(e.target.value)} className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30">
                  <option value="all">All Respondents</option>
                  <option value="true">Anonymous Only</option>
                  <option value="false">Identified Only</option>
                </select>
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30">
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 90 Days</option>
                </select>
              </div>
            </div>

            {/* Responses Table */}
            {responses.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Submitted</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Respondent</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Rating</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Score</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((response) => (
                        <tr key={response._id || response.id} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] transition-colors">
                          <td className="px-4 py-3 text-sm">
                            <code className="text-[var(--primary-color)]">#{(response._id || response.id)?.slice(-6)}</code>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center">
                              <MdAccessTime className="text-[var(--text-secondary)] mr-1" />
                              <div>
                                <div className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{new Date(response.submittedAt || response.createdAt).toLocaleDateString()}</div>
                                <small className="text-[var(--text-secondary)]">{new Date(response.submittedAt || response.createdAt).toLocaleTimeString()}</small>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {response.isAnonymous ? (
                              <span className="flex items-center text-[var(--text-secondary)]"><MdPublic className="mr-1" /> Anonymous</span>
                            ) : (
                              <span className="flex items-center text-[var(--light-text)] dark:text-[var(--dark-text)]"><MdPerson className="mr-1 text-[var(--primary-color)]" /> {response.user?.name || response.user?.email || response.respondent || 'User'}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center">
                              {getRatingStars(response.rating)}
                              {response.rating && <span className="ml-2 text-sm text-[var(--text-secondary)]">({response.rating})</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{getScoreBadge(response.score)}</td>
                          <td className="px-4 py-3 text-sm">{getStatusBadge(response.status || 'submitted')}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-1">
                              <button title="View Details" className="p-1.5 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-md hover:bg-[var(--primary-color)] hover:text-white transition-colors" onClick={() => { setSelectedResponse(response); setShowResponseModal(true); }}>
                                <MdVisibility />
                              </button>
                              {response.score && response.score < 50 && (
                                <button title="Low score - needs attention" className="p-1.5 border border-yellow-500 text-yellow-600 rounded-md hover:bg-yellow-500 hover:text-white transition-colors">
                                  <MdFlag />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <small className="text-[var(--text-secondary)]">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, totalResponses)} of {totalResponses}
                    </small>
                    <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 text-sm rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30">
                      <option value="10">10 / page</option>
                      <option value="20">20 / page</option>
                      <option value="50">50 / page</option>
                      <option value="100">100 / page</option>
                    </select>
                  </div>
                  <div className="flex gap-1">
                    <button className="px-3 py-1 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] disabled:opacity-50" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>&laquo;</button>
                    <button className="px-3 py-1 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] disabled:opacity-50" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>&lsaquo;</button>
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const page = Math.max(1, currentPage - 2) + index;
                      if (page <= totalPages) {
                        return (
                          <button key={page} className={`px-3 py-1 border rounded-md text-sm ${page === currentPage ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' : 'border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]'}`} onClick={() => setCurrentPage(page)}>
                            {page}
                          </button>
                        );
                      }
                      return null;
                    })}
                    <button className="px-3 py-1 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] disabled:opacity-50" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>&rsaquo;</button>
                    <button className="px-3 py-1 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-md text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] disabled:opacity-50" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>&raquo;</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <MdQuestionAnswer size={64} className="text-[var(--text-secondary)] mb-3 mx-auto" />
                <h5 className="text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium mb-2">No Responses Found</h5>
                <p className="text-[var(--text-secondary)]">
                  {searchTerm || ratingFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'No responses have been submitted for this survey yet.'}
                </p>
                {(searchTerm || ratingFilter !== 'all' || dateFilter !== 'all') && (
                  <button className="mt-3 px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]" onClick={() => { setSearchTerm(''); setRatingFilter('all'); setDateFilter('all'); setAnonymousFilter('all'); }}>
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-2 mx-auto">
                  <FaUsers size={24} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">{analytics.totalResponses}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-0">Total Responses</p>
              </div>
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-2 mx-auto">
                  <FaStar size={24} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">{analytics.averageRating?.toFixed(1) || 'N/A'}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-0">Average Rating</p>
              </div>
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 mb-2 mx-auto">
                  <MdTrendingUp size={24} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">{analytics.averageScore?.toFixed(0) || 'N/A'}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-0">Average Score</p>
              </div>
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)] text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mb-2 mx-auto">
                  <FaChartLine size={24} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">{analytics.npsScore || 'N/A'}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-0">NPS Score</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <h6 className="mb-0 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Response Trend</h6>
                </div>
                <div className="p-4">
                  {analytics.responsesByDate?.length > 0 ? (
                    <Line data={responsesTrendData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                  ) : (
                    <div className="text-center py-12 text-[var(--text-secondary)]">
                      <MdAnalytics size={48} className="mb-2 mx-auto" />
                      <p>No trend data available</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <h6 className="mb-0 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Rating Distribution</h6>
                </div>
                <div className="p-4">
                  <Bar data={ratingData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Items Tab */}
        {activeTab === 'actions' && (
          <div className="p-4">
            {actionItems.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {actionItems.map(action => (
                  <div key={action._id || action.id} className={`border-l-4 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] p-4 ${action.priority === 'high' ? 'border-l-[var(--danger-color)]' : action.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-[var(--success-color)]'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        {getPriorityBadge(action.priority)}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors.secondary}`}>{action.status}</span>
                      </div>
                      <small className="text-[var(--text-secondary)]">{formatDate(action.createdAt)}</small>
                    </div>
                    <h6 className="mb-2 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{action.title}</h6>
                    <p className="text-[var(--text-secondary)] text-sm mb-2">{action.description}</p>
                    {action.assignedTo && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors.info}`}>
                        Assigned: {action.assignedTo?.name || action.assignedTo}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MdAssignment size={64} className="text-[var(--text-secondary)] mb-3 mx-auto" />
                <h5 className="text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium mb-2">No Action Items</h5>
                <p className="text-[var(--text-secondary)] mb-3">No actions have been generated for this survey yet.</p>
                <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]" onClick={() => navigate(`/app/surveys/${id}/actions`)}>
                  View All Actions
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Response Detail Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowResponseModal(false)}>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <h5 className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium">Response Details <code className="ml-2 text-[var(--primary-color)]">#{(selectedResponse?._id || selectedResponse?.id)?.slice(-6)}</code></h5>
                <button className="text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] text-xl" onClick={() => setShowResponseModal(false)}>&times;</button>
              </div>
              <div className="p-4">
                {selectedResponse && (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <strong className="text-[var(--text-secondary)] block text-sm mb-1">Submitted</strong>
                        <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{formatDate(selectedResponse.submittedAt || selectedResponse.createdAt)}</span>
                      </div>
                      <div>
                        <strong className="text-[var(--text-secondary)] block text-sm mb-1">Respondent</strong>
                        <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{selectedResponse.isAnonymous ? 'Anonymous' : selectedResponse.user?.name || selectedResponse.user?.email || 'Unknown'}</span>
                      </div>
                      <div>
                        <strong className="text-[var(--text-secondary)] block text-sm mb-1">Rating</strong>
                        <div>{getRatingStars(selectedResponse.rating)} {selectedResponse.rating && `(${selectedResponse.rating}/5)`}</div>
                      </div>
                      <div>
                        <strong className="text-[var(--text-secondary)] block text-sm mb-1">Score</strong>
                        {getScoreBadge(selectedResponse.score)}
                      </div>
                    </div>

                    {selectedResponse.review && (
                      <div className="mb-4">
                        <strong className="text-[var(--text-secondary)] block text-sm mb-1">Review</strong>
                        <div className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-3">
                          <p className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">{selectedResponse.review}</p>
                        </div>
                      </div>
                    )}

                    <hr className="border-[var(--light-border)] dark:border-[var(--dark-border)]" />

                    <h6 className="mb-3 text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium">Answers</h6>
                    {selectedResponse.answers?.length > 0 ? (
                      selectedResponse.answers.map((answer, index) => (
                        <div key={index} className="mb-2 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-3">
                          <strong className="block mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">Q{index + 1}: {getQuestionText(answer.questionId)}</strong>
                          <div className="pl-3">
                            {typeof answer.answer === 'object' ? (
                              <pre className="mb-0 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{JSON.stringify(answer.answer, null, 2)}</pre>
                            ) : (
                              <p className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)]">{answer.answer || 'No answer provided'}</p>
                            )}
                            {answer.media?.length > 0 && (
                              <div className="mt-2">
                                <small className="text-[var(--text-secondary)]">Attachments: {answer.media.length} file(s)</small>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[var(--text-secondary)]">No individual answers recorded.</p>
                    )}

                    {selectedResponse.ip && (
                      <div className="mt-3 pt-3 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <small className="text-[var(--text-secondary)]">
                          <MdLocationOn className="mr-1 inline" />
                          IP: {selectedResponse.ip}
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end p-4 pt-0">
                <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]" onClick={() => setShowResponseModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowFilterModal(false)}>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto" style={{maxWidth: '28rem'}} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <h5 className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium">Advanced Filters</h5>
                <button className="text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] text-xl" onClick={() => setShowFilterModal(false)}>&times;</button>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Date Range</label>
                  <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30">
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="quarter">Last 90 Days</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Rating</label>
                  <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30">
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block mb-1 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Respondent Type</label>
                  <select value={anonymousFilter} onChange={(e) => setAnonymousFilter(e.target.value)} className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30">
                    <option value="all">All Respondents</option>
                    <option value="true">Anonymous Only</option>
                    <option value="false">Identified Only</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-4 pt-0">
                <button className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]" onClick={() => { setDateFilter('all'); setRatingFilter('all'); setAnonymousFilter('all'); }}>Reset</button>
                <button className="px-4 py-2 rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]" onClick={() => setShowFilterModal(false)}>Apply Filters</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowExportModal(false)}>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto" style={{maxWidth: '28rem'}} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <h5 className="mb-0 text-[var(--light-text)] dark:text-[var(--dark-text)] font-medium">Export Responses</h5>
                <button className="text-[var(--text-secondary)] hover:text-[var(--light-text)] dark:hover:text-[var(--dark-text)] text-xl" onClick={() => setShowExportModal(false)}>&times;</button>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <button className="flex items-center justify-center w-full px-4 py-3 rounded-md font-medium transition-colors bg-[var(--danger-color)] text-white hover:opacity-80 disabled:opacity-50" onClick={() => handleExport('pdf')} disabled={exporting}>
                  {exporting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <MdDownload className="mr-2" />}
                  Export as PDF Report
                </button>
                <button className="flex items-center justify-center w-full px-4 py-3 rounded-md font-medium transition-colors bg-[var(--success-color)] text-white hover:opacity-80 disabled:opacity-50" onClick={() => handleExport('csv')} disabled={exporting}>
                  {exporting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <MdDownload className="mr-2" />}
                  Export as CSV Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[9999] p-4 rounded-md shadow-lg text-white flex items-center gap-2" style={{ backgroundColor: toastVariant === 'success' ? 'var(--success-color)' : 'var(--danger-color)' }}>
          {toastVariant === 'success' && <MdCheckCircle />}
          {toastVariant === 'danger' && <MdWarning />}
          {toastMessage}
          <button className="ml-3 text-white/80 hover:text-white" onClick={() => setShowToast(false)}>&times;</button>
        </div>
      )}
    </div>
  );
};

export default SurveyResponses;
