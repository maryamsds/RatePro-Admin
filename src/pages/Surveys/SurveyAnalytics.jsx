// src\pages\Surveys\SurveyAnalytics.jsx

"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Badge color map for Tailwind with dark mode
const badgeColors = {
  primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  info: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400',
  secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
};
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
          <FaStar key={i} className="text-yellow-500" /> :
          <FaRegStar key={i} className="text-gray-400 dark:text-gray-600" />
      );
    }
    return stars;
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <MdSentimentSatisfied className="text-green-600 dark:text-green-400" />;
      case 'negative': return <MdSentimentDissatisfied className="text-red-600 dark:text-red-400" />;
      default: return <MdSentimentNeutral className="text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <FaArrowUp className="text-green-600 dark:text-green-400" />;
    if (trend < 0) return <FaArrowDown className="text-red-600 dark:text-red-400" />;
    return <span className="text-[var(--text-secondary)]">—</span>;
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
      <div className="w-full py-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto"></div>
          <p className="mt-3 text-[var(--text-secondary)]">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-4">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <MdFlag className="mr-2 inline" size={24} />
          {error}
          <div className="mt-3">
            <button className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" onClick={() => navigate(`/app/surveys`)}>
              Back to Survey
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-4">
      {/* Header Section */}
      <div className="mb-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <button
                  className="p-0 mb-2 text-[var(--primary-color)] hover:underline bg-transparent border-none cursor-pointer text-sm"
                  onClick={() => navigate(`/app/surveys`)}
                >
                  ← Back to Survey
                </button>
                <h1 className="text-xl font-bold mb-1 flex items-center text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  <MdAnalytics className="mr-2 text-[var(--primary-color)]" />
                  Survey Analytics
                </h1>
                <p className="text-[var(--text-secondary)] mb-0">{survey?.title}</p>
                <div className="flex items-center mt-2 gap-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                    <FaUsers className="mr-1" />
                    {analyticsData.overview.totalResponses} Total Responses
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                    <FaStar className="mr-1" />
                    {analyticsData.overview.averageRating.toFixed(1)} Avg Rating
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400">
                    <MdTrendingUp className="mr-1" />
                    {analyticsData.overview.npsScore} NPS Score
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 cursor-pointer"
                  value={dateRange}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setShowFilterModal(true);
                    } else {
                      handleDateRangeChange(e.target.value);
                    }
                  }}
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last3months">Last 3 Months</option>
                  <option value="alltime">All Time</option>
                  <option value="custom">Custom Range</option>
                </select>

                <button
                  className="inline-flex items-center px-3 py-2 text-sm rounded-md font-medium transition-colors border border-green-500 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  onClick={() => setShowExportModal(true)}
                >
                  <MdDownload className="mr-2" />
                  Export
                </button>

                <button
                  className="inline-flex items-center px-3 py-2 text-sm rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--text-secondary)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] disabled:opacity-50"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : (
                    <MdRefresh className="mr-2" />
                  )}
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
        {/* Total Responses */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mx-auto mb-2">
              <FaUsers size={24} />
            </div>
            <h4 className="mb-1 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.overview.totalResponses}</h4>
            <small className="text-sm text-[var(--text-secondary)]">Total Responses</small>
            {analyticsData.trends?.responseTrend !== undefined && (
              <div className="mt-1 flex items-center justify-center">
                {getTrendIcon(analyticsData.trends.responseTrend)}
                <small className={`ml-1 ${analyticsData.trends.responseTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analyticsData.trends.responseTrend >= 0 ? '+' : ''}{analyticsData.trends.responseTrend?.toFixed(1) || 0}%
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mx-auto mb-2">
              <FaStar size={24} />
            </div>
            <h4 className="mb-1 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.overview.averageRating?.toFixed(1) || 0}</h4>
            <small className="text-sm text-[var(--text-secondary)]">Average Rating</small>
            {analyticsData.trends?.ratingTrend !== undefined && (
              <div className="mt-1 flex items-center justify-center">
                {getTrendIcon(analyticsData.trends.ratingTrend)}
                <small className={`ml-1 ${analyticsData.trends.ratingTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analyticsData.trends.ratingTrend >= 0 ? '+' : ''}{analyticsData.trends.ratingTrend?.toFixed(1) || 0}%
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full mx-auto mb-2">
              <MdCheckCircle size={24} />
            </div>
            <h4 className="mb-1 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.overview.completionRate || 0}%</h4>
            <small className="text-sm text-[var(--text-secondary)]">Completion Rate</small>
            {analyticsData.trends?.completionTrend !== undefined && (
              <div className="mt-1 flex items-center justify-center">
                {getTrendIcon(analyticsData.trends.completionTrend)}
                <small className={`ml-1 ${analyticsData.trends.completionTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analyticsData.trends.completionTrend >= 0 ? '+' : ''}{analyticsData.trends.completionTrend?.toFixed(1) || 0}%
                </small>
              </div>
            )}
          </div>
        </div>

        {/* NPS Score */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full mx-auto mb-2">
              <FaChartLine size={24} />
            </div>
            <h4 className="mb-1 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.overview.npsScore || 0}</h4>
            <small className="text-sm text-[var(--text-secondary)]">NPS Score</small>
            {analyticsData.nps?.trend !== undefined && (
              <div className="mt-1 flex items-center justify-center">
                {getTrendIcon(analyticsData.nps.trend)}
                <small className={`ml-1 ${analyticsData.nps.trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analyticsData.nps.trend >= 0 ? '+' : ''}{analyticsData.nps.trend?.toFixed(1) || 0}%
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Satisfaction */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full mx-auto mb-2">
              <MdSentimentSatisfied size={24} />
            </div>
            <h4 className="mb-1 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.overview.satisfactionScore || 0}%</h4>
            <small className="text-sm text-[var(--text-secondary)]">Satisfaction</small>
            {analyticsData.trends?.satisfactionTrend !== undefined && (
              <div className="mt-1 flex items-center justify-center">
                {getTrendIcon(analyticsData.trends.satisfactionTrend)}
                <small className={`ml-1 ${analyticsData.trends.satisfactionTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analyticsData.trends.satisfactionTrend >= 0 ? '+' : ''}{analyticsData.trends.satisfactionTrend?.toFixed(1) || 0}%
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Benchmark */}
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full mx-auto mb-2">
              <MdCompare size={24} />
            </div>
            <h4 className="mb-1 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.overview.benchmarkComparison || 0}%</h4>
            <small className="text-sm text-[var(--text-secondary)]">vs Industry</small>
          </div>
        </div>
      </div>

      {/* Main Analytics Content */}
      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
        <div>
          {/* Custom Tab Navigation */}
          <div className="flex gap-2 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] px-4 pt-3">
            {[
              { key: 'overview', icon: <MdInsights className="mr-1" />, label: 'Overview' },
              { key: 'demographics', icon: <MdPeople className="mr-1" />, label: 'Demographics' },
              { key: 'feedback', icon: <MdFlag className="mr-1" />, label: 'Feedback Analysis' },
              { key: 'questions', icon: <MdBarChart className="mr-1" />, label: 'Question Analysis' }
            ].map(tab => (
              <button
                key={tab.key}
                className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--primary-color)]'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (

            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* Response Trends */}
                <div className="lg:col-span-2">
                  <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="flex justify-between items-center p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <h6 className="mb-0 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Response Trends</h6>
                      <div className="flex">
                        {['responses', 'ratings', 'nps'].map(metric => (
                          <button
                            key={metric}
                            className={`px-3 py-1 text-xs font-medium border transition-colors ${
                              selectedMetric === metric
                                ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]'
                                : 'bg-transparent text-[var(--primary-color)] border-[var(--primary-color)] hover:bg-[var(--primary-color)]/10'
                            } ${metric === 'responses' ? 'rounded-l-md' : metric === 'nps' ? 'rounded-r-md' : ''}`}
                            onClick={() => setSelectedMetric(metric)}
                          >
                            {metric === 'responses' ? 'Responses' : metric === 'ratings' ? 'Ratings' : 'NPS'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-4">
                      {selectedMetric === 'responses' && (
                        <Line data={responsesTrendData} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                      )}
                      {selectedMetric === 'ratings' && (
                        <Line data={ratingTrendData} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: false } }, scales: { y: { beginAtZero: true, max: 5 } } }} />
                      )}
                      {selectedMetric === 'nps' && (
                        <Line data={npsData} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: false } }, scales: { y: { beginAtZero: false, min: -100, max: 100 } } }} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Sentiment Breakdown */}
                <div>
                  <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <h6 className="mb-0 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Sentiment Analysis</h6>
                    </div>
                    <div className="p-4">
                      <Doughnut data={sentimentData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="flex items-center text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>Positive</span>
                          <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.sentiment.breakdown.positive}%</strong>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="flex items-center text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>Negative</span>
                          <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.sentiment.breakdown.negative}%</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>Neutral</span>
                          <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.sentiment.breakdown.neutral}%</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Device Breakdown */}
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <h6 className="mb-0 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Device Usage</h6>
                  </div>
                  <div className="p-4">
                    <Bar data={deviceData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                  </div>
                </div>

                {/* Question Performance */}
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <h6 className="mb-0 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Question Performance</h6>
                  </div>
                  <div className="p-4">
                    <Bar data={questionPerformanceData} options={{ responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demographics Tab */}
          {activeTab === 'demographics' && (
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Location */}
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <h6 className="mb-0 text-lg font-semibold flex items-center text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      <MdLocationOn className="mr-2" />Responses by Location
                    </h6>
                  </div>
                  <div className="p-4">
                    {analyticsData.demographics.byLocation?.map((location, index) => (
                      <div key={index} className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="text-[var(--primary-color)] mr-2" />
                          <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{location.city || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                            <div className="h-full bg-[var(--primary-color)] rounded-full" style={{ width: `${location.percentage}%` }}></div>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">{location.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Patterns */}
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <h6 className="mb-0 text-lg font-semibold flex items-center text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      <MdSchedule className="mr-2" />Response Time Patterns
                    </h6>
                  </div>
                  <div className="p-4">
                    <h6 className="mb-3 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Peak Hours</h6>
                    {analyticsData.demographics.byTimeOfDay?.map((timeSlot, index) => (
                      <div key={index} className="flex justify-between items-center mb-2">
                        <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{timeSlot.hour}:00</span>
                        <div className="flex items-center">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${timeSlot.percentage}%` }}></div>
                          </div>
                          <small className="text-[var(--text-secondary)]">{timeSlot.count}</small>
                        </div>
                      </div>
                    ))}

                    <hr className="my-3 border-[var(--light-border)] dark:border-[var(--dark-border)]" />

                    <h6 className="mb-3 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Peak Days</h6>
                    {analyticsData.demographics.byDayOfWeek?.map((day, index) => (
                      <div key={index} className="flex justify-between items-center mb-2">
                        <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{day.dayName}</span>
                        <div className="flex items-center">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${day.percentage}%` }}></div>
                          </div>
                          <small className="text-[var(--text-secondary)]">{day.count}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Analysis Tab */}
          {activeTab === 'feedback' && (
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Top Complaints */}
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] h-full">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] bg-red-50 dark:bg-red-900/20 rounded-t-md">
                    <h6 className="mb-0 text-lg font-semibold text-red-600 dark:text-red-400 flex items-center">
                      <MdThumbDown className="mr-2" />
                      Top Complaints ({analyticsData.feedback.topComplaints?.length || 0})
                    </h6>
                  </div>
                  <div className="p-4">
                    {analyticsData.feedback.topComplaints?.map((complaint, index) => (
                      <div key={index} className="mb-3 p-3 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="mb-0 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{complaint.category}</h6>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">{complaint.count} mentions</span>
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm mb-2">{complaint.description}</p>
                        <div className="flex items-center">
                          <div className="flex-grow h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${complaint.severity}%` }}></div>
                          </div>
                          <small className="text-[var(--text-secondary)]">Severity: {complaint.severity}%</small>
                        </div>
                      </div>
                    ))}
                    {(!analyticsData.feedback.topComplaints || analyticsData.feedback.topComplaints.length === 0) && (
                      <div className="text-center py-4">
                        <MdCheckCircle size={48} className="text-green-500 mb-3 mx-auto" />
                        <p className="text-[var(--text-secondary)]">No major complaints identified!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Praises */}
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)] h-full">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] bg-green-50 dark:bg-green-900/20 rounded-t-md">
                    <h6 className="mb-0 text-lg font-semibold text-green-600 dark:text-green-400 flex items-center">
                      <MdThumbUp className="mr-2" />
                      Top Praises ({analyticsData.feedback.topPraises?.length || 0})
                    </h6>
                  </div>
                  <div className="p-4">
                    {analyticsData.feedback.topPraises?.map((praise, index) => (
                      <div key={index} className="mb-3 p-3 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="mb-0 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{praise.category}</h6>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">{praise.count} mentions</span>
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm mb-2">{praise.description}</p>
                        <div className="flex items-center">
                          <div className="flex-grow h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${praise.impact}%` }}></div>
                          </div>
                          <small className="text-[var(--text-secondary)]">Impact: {praise.impact}%</small>
                        </div>
                      </div>
                    ))}
                    {(!analyticsData.feedback.topPraises || analyticsData.feedback.topPraises.length === 0) && (
                      <div className="text-center py-4">
                        <MdSentimentNeutral size={48} className="text-[var(--text-secondary)] mb-3 mx-auto" />
                        <p className="text-[var(--text-secondary)]">No specific praises identified yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Urgent Issues & Insights */}
              <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] bg-yellow-50 dark:bg-yellow-900/20 rounded-t-md">
                  <h6 className="mb-0 text-lg font-semibold text-yellow-700 dark:text-yellow-400 flex items-center">
                    <MdWarning className="mr-2" />
                    Urgent Issues & Actionable Insights
                  </h6>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-red-600 dark:text-red-400 mb-3 text-sm font-medium flex items-center">
                        <FaExclamationTriangle className="mr-2" />Urgent Issues
                      </h6>
                      {analyticsData.feedback.urgentIssues?.map((issue, index) => (
                        <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{issue.title}</strong>
                              <p className="mb-0 text-sm text-[var(--text-secondary)]">{issue.description}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">{issue.priority}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h6 className="text-cyan-600 dark:text-cyan-400 mb-3 text-sm font-medium flex items-center">
                        <MdInsights className="mr-2" />Actionable Insights
                      </h6>
                      {analyticsData.feedback.actionableInsights?.map((insight, index) => (
                        <div key={index} className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3 mb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{insight.title}</strong>
                              <p className="mb-0 text-sm text-[var(--text-secondary)]">{insight.recommendation}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400">{insight.impact}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Question Analysis Tab */}
          {activeTab === 'questions' && (
            <div className="p-4">
              <div className="mb-4">
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <h6 className="mb-0 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Question Performance Overview</h6>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Question</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Completion Rate</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Avg. Rating</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Time Spent</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Skip Rate</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.questions.performance?.map((question, index) => (
                          <tr key={index} className="border-b border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] transition-colors">
                            <td className="px-4 py-3">
                              <div>
                                <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Q{question.questionNumber}</strong>
                                <div className="text-sm text-[var(--text-secondary)]">{question.title}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                                  <div className={`h-full rounded-full ${question.completionRate >= 80 ? 'bg-green-500' : question.completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${question.completionRate}%` }}></div>
                                </div>
                                <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{question.completionRate}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {getRatingStars(Math.round(question.averageRating))}
                                <span className="ml-2 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">({question.averageRating.toFixed(1)})</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{question.averageTimeSpent}s</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${question.skipRate > 20 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : question.skipRate > 10 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'}`}>
                                {question.skipRate}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${question.performanceScore >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : question.performanceScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}`}>
                                {question.performanceScore}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Drop-off Points */}
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <h6 className="mb-0 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Drop-off Points</h6>
                  </div>
                  <div className="p-4">
                    {analyticsData.questions.dropoffPoints?.map((point, index) => (
                      <div key={index} className="mb-3 p-3 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <strong className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Question {point.questionNumber}</strong>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">{point.dropoffRate}% dropout</span>
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm mb-2">{point.questionTitle}</p>
                        <div className="flex items-center justify-between text-sm">
                          <small className="text-[var(--text-secondary)]">{point.usersReached} users reached • {point.usersCompleted} completed</small>
                          <small className="text-red-600 dark:text-red-400">-{point.usersDropped} users</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Analysis */}
                <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    <h6 className="mb-0 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Time Analysis</h6>
                  </div>
                  <div className="p-4">
                    {analyticsData.questions.timeSpent?.map((time, index) => (
                      <div key={index} className="mb-3 p-3 border border-[var(--light-border)] dark:border-[var(--dark-border)] rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <strong className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">Question {time.questionNumber}</strong>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400">{time.averageTime}s avg</span>
                        </div>
                        <div className="flex justify-between items-center text-[var(--text-secondary)] text-sm">
                          <span>Min: {time.minTime}s</span>
                          <span>Max: {time.maxTime}s</span>
                          <span>Median: {time.medianTime}s</span>
                        </div>
                        <div className="mt-2">
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(time.averageTime / time.maxTime) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowFilterModal(false)}></div>
          <div className="relative bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-2xl w-full max-w-md mx-4 z-10 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Custom Date Range</h5>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl" onClick={() => setShowFilterModal(false)}>&times;</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    className="w-full px-3 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <button
                className="px-4 py-2 text-sm rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]"
                onClick={() => setShowFilterModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded-md font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"
                onClick={() => {
                  setDateRange('custom');
                  setShowFilterModal(false);
                  handleRefresh();
                }}
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowExportModal(false)}></div>
          <div className="relative bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-2xl w-full max-w-md mx-4 z-10 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <h5 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Export Analytics</h5>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl" onClick={() => setShowExportModal(false)}>&times;</button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <button
                className="w-full px-4 py-3 rounded-md font-medium transition-colors border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
                onClick={handleExportPDF}
              >
                📄 Export as PDF Report
              </button>
              <button
                className="w-full px-4 py-3 rounded-md font-medium transition-colors border border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-left"
                onClick={handleExportExcel}
              >
                📊 Export as Excel Spreadsheet
              </button>
              <button
                className="w-full px-4 py-3 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: `${survey.title} - Analytics Report`, text: `Check out the analytics for ${survey.title}`, url: window.location.href });
                  }
                }}
              >
                <MdShare className="inline mr-2" />Share Analytics Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${toastVariant === 'success' ? 'bg-green-600' : toastVariant === 'danger' ? 'bg-red-600' : 'bg-blue-600'}`}>
            <span>{toastMessage}</span>
            <button className="text-white/80 hover:text-white ml-2" onClick={() => setShowToast(false)}>&times;</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyAnalytics;


