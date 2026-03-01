// src\pages\Surveys\SurveyAnalytics.jsx

"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdAnalytics, MdTrendingUp, MdTrendingDown,
  MdDownload, MdRefresh,
  MdSentimentSatisfied, MdSentimentDissatisfied,
  MdSentimentNeutral, MdLocationOn,
  MdPeople, MdSchedule, MdShare
} from 'react-icons/md';
import {
  FaUsers, FaChartLine,
  FaMapMarkerAlt
} from 'react-icons/fa';
import {
  Line, Bar, Doughnut
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
import { getSurveyById } from '../../api/services/surveyService';
import {
  getSurveyAnalytics,
  getSurveyDemographics,
  exportResponsesCSV,
  exportAnalyticsPDF,
  downloadFile
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

  // Analytics Data — only fields backend actually provides
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalResponses: 0,
      npsScore: null,
    },
    nps: {
      score: null,
      promoters: 0,
      passives: 0,
      detractors: 0,
      total: 0,
    },
    trends: {
      responsesByDate: [],
    },
    sentiment: {
      breakdown: { positive: 0, negative: 0, neutral: 0 },
      percentages: { positive: 0, negative: 0, neutral: 0 },
      total: 0,
    },
    demographics: {
      byDevice: [],
      byLocation: [],
      byTimeOfDay: [],
      byDayOfWeek: [],
    },
  });

  // Demographics lazy loading
  const [demographicsLoaded, setDemographicsLoaded] = useState(false);
  const [demographicsLoading, setDemographicsLoading] = useState(false);

  // UI States
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Fetch core data: survey + analytics (NOT demographics)
  const fetchData = useCallback(async (showRefreshSpinner = false) => {
    try {
      if (showRefreshSpinner) setRefreshing(true);
      else setLoading(true);
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

      const [surveyData, analytics] = await Promise.all([
        getSurveyById(id).catch(err => {
          console.warn('[SurveyAnalytics] Survey fetch failed:', err.message);
          return null;
        }),
        getSurveyAnalytics(id, analyticsParams).catch(err => {
          console.warn('[SurveyAnalytics] Analytics fetch failed:', err.message);
          return null;
        }),
      ]);

      if (surveyData) {
        setSurvey(surveyData);
      }

      if (analytics) {
        setAnalyticsData(analytics);
      }

    } catch (err) {
      console.error('[SurveyAnalytics] Fatal fetch error:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, dateRange, startDate, endDate]);

  // Lazy-load demographics only when tab is opened
  const fetchDemographics = useCallback(async () => {
    if (demographicsLoaded || demographicsLoading) return;
    try {
      setDemographicsLoading(true);
      const data = await getSurveyDemographics(id, { days: 30 });
      if (data) {
        setAnalyticsData(prev => ({
          ...prev,
          demographics: {
            byDevice: data.byDevice || [],
            byLocation: data.byCountry || data.byLocation || [],
            byTimeOfDay: data.byHour || [],
            byDayOfWeek: data.byDayOfWeek || [],
          }
        }));
      }
      setDemographicsLoaded(true);
    } catch (err) {
      console.warn('[SurveyAnalytics] Demographics fetch failed:', err.message);
    } finally {
      setDemographicsLoading(false);
    }
  }, [id, demographicsLoaded, demographicsLoading]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Trigger demographics fetch when tab switches
  useEffect(() => {
    if (activeTab === 'demographics') {
      fetchDemographics();
    }
  }, [activeTab, fetchDemographics]);

  // Handle refresh
  const handleRefresh = () => {
    setDemographicsLoaded(false); // force re-fetch on next tab switch
    fetchData(true);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setDemographicsLoaded(false);
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

  // ─── Chart Data ─────────────────────────────────────────────

  // Response Trendline — backend: trendline[{ date, count }]
  const responsesTrendData = {
    labels: analyticsData.trends.responsesByDate?.map(item =>
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Daily Responses',
        data: analyticsData.trends.responsesByDate?.map(item => item.count) || [],
        borderColor: '#14b8a6',
        backgroundColor: 'rgba(20, 184, 166, 0.15)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // NPS Breakdown Bar — backend: nps.promoters, nps.passives, nps.detractors
  const npsBreakdownData = {
    labels: ['Promoters', 'Passives', 'Detractors'],
    datasets: [
      {
        data: [
          analyticsData.nps.promoters,
          analyticsData.nps.passives,
          analyticsData.nps.detractors
        ],
        backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
        borderWidth: 0,
        borderRadius: 6,
      }
    ]
  };

  // Sentiment Doughnut — aggregated from heatmap
  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          analyticsData.sentiment.breakdown.positive,
          analyticsData.sentiment.breakdown.negative,
          analyticsData.sentiment.breakdown.neutral
        ],
        backgroundColor: ['#22c55e', '#ef4444', '#eab308'],
        borderWidth: 2,
        borderColor: 'transparent'
      }
    ]
  };

  // Device breakdown bar chart
  const deviceData = {
    labels: analyticsData.demographics.byDevice?.map(item => item.device || item._id) || [],
    datasets: [
      {
        label: 'Responses by Device',
        data: analyticsData.demographics.byDevice?.map(item => item.count) || [],
        backgroundColor: ['#3b82f6', '#22c55e', '#eab308', '#ef4444'],
        borderRadius: 6,
      }
    ]
  };

  // ─── Empty state helper ─────────────────────────────────────
  const EmptyState = ({ icon: Icon, title, message }) => (
    <div className="text-center py-12 px-4">
      <Icon size={48} className="text-[var(--text-secondary)] mb-3 mx-auto opacity-40" />
      <h6 className="text-lg font-semibold mb-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">{title}</h6>
      <p className="text-[var(--text-secondary)] text-sm">{message}</p>
    </div>
  );

  // ─── Loading / Error states ─────────────────────────────────

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
          <MdAnalytics className="mr-2 inline" size={24} />
          {error}
          <div className="mt-3">
            <button className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" onClick={() => navigate(`/app/surveys`)}>
              Back to Surveys
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasData = analyticsData.overview.totalResponses > 0;

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
                  ← Back to Surveys
                </button>
                <h1 className="text-xl font-bold mb-1 flex items-center text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  <MdAnalytics className="mr-2 text-[var(--primary-color)]" />
                  Survey Analytics
                </h1>
                <p className="text-[var(--text-secondary)] mb-0">{survey?.title}</p>
                {hasData && (
                  <div className="flex items-center mt-2 gap-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                      <FaUsers className="mr-1" />
                      {analyticsData.overview.totalResponses} Responses
                    </span>
                    {analyticsData.nps.score != null && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                        <FaChartLine className="mr-1" />
                        NPS: {analyticsData.nps.score}
                      </span>
                    )}
                  </div>
                )}
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
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 3 Months</option>
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

      {/* No data state */}
      {!hasData && (
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <EmptyState
            icon={MdAnalytics}
            title="No Responses Yet"
            message="Analytics will appear once this survey receives responses. Share the survey to start collecting data."
          />
        </div>
      )}

      {/* Main content — only shown when data exists */}
      {hasData && (
        <>
          {/* Key Metrics Cards — 4 cards, all backed by real data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Total Responses */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="text-center">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mx-auto mb-2">
                  <FaUsers size={24} />
                </div>
                <h4 className="mb-1 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.overview.totalResponses}</h4>
                <small className="text-sm text-[var(--text-secondary)]">Total Responses</small>
              </div>
            </div>

            {/* NPS Score */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="text-center">
                <div className="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full mx-auto mb-2">
                  <FaChartLine size={24} />
                </div>
                <h4 className="mb-1 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.nps.score ?? '—'}</h4>
                <small className="text-sm text-[var(--text-secondary)]">NPS Score</small>
              </div>
            </div>

            {/* Sentiment Summary */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="text-center">
                <div className="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mx-auto mb-2">
                  <MdSentimentSatisfied size={24} />
                </div>
                <h4 className="mb-1 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.sentiment.percentages.positive}%</h4>
                <small className="text-sm text-[var(--text-secondary)]">Positive Sentiment</small>
              </div>
            </div>

            {/* Response Trend (count from trendline) */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-4 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="text-center">
                <div className="w-12 h-12 flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full mx-auto mb-2">
                  <MdTrendingUp size={24} />
                </div>
                <h4 className="mb-1 text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.trends.responsesByDate?.length || 0}</h4>
                <small className="text-sm text-[var(--text-secondary)]">Active Days</small>
              </div>
            </div>
          </div>

          {/* Main Analytics Content */}
          <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div>
              {/* Tab Navigation — only 2 real tabs */}
              <div className="flex gap-2 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] px-4 pt-3">
                {[
                  { key: 'overview', icon: <MdAnalytics className="mr-1" />, label: 'Overview' },
                  { key: 'demographics', icon: <MdPeople className="mr-1" />, label: 'Demographics' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                        ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--primary-color)]'
                      }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              {/* ─── Overview Tab ─────────────────────────────────── */}
              {activeTab === 'overview' && (
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    {/* Response Trendline */}
                    <div className="lg:col-span-2">
                      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                          <h6 className="mb-0 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Response Trend</h6>
                        </div>
                        <div className="p-4">
                          {analyticsData.trends.responsesByDate?.length > 0 ? (
                            <Line data={responsesTrendData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                          ) : (
                            <EmptyState icon={MdTrendingUp} title="No trend data" message="Trend data will appear as responses come in over multiple days." />
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
                          {analyticsData.sentiment.total > 0 ? (
                            <>
                              <Doughnut data={sentimentData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                              <div className="mt-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="flex items-center text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>Positive</span>
                                  <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.sentiment.percentages.positive}%</strong>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="flex items-center text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>Negative</span>
                                  <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.sentiment.percentages.negative}%</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="flex items-center text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>Neutral</span>
                                  <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{analyticsData.sentiment.percentages.neutral}%</strong>
                                </div>
                              </div>
                            </>
                          ) : (
                            <EmptyState icon={MdSentimentNeutral} title="No sentiment data" message="Sentiment analysis will be available once text responses are analyzed." />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NPS Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* NPS Bar Chart */}
                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <h6 className="mb-0 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">NPS Breakdown</h6>
                      </div>
                      <div className="p-4">
                        {analyticsData.nps.total > 0 ? (
                          <Bar data={npsBreakdownData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                        ) : (
                          <EmptyState icon={FaChartLine} title="No NPS data" message="NPS breakdown will appear once rating responses are collected." />
                        )}
                      </div>
                    </div>

                    {/* NPS Detail Cards */}
                    <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <h6 className="mb-0 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">NPS Details</h6>
                      </div>
                      <div className="p-4">
                        <div className="text-center mb-4">
                          <div className="text-4xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                            {analyticsData.nps.score ?? '—'}
                          </div>
                          <div className="text-sm text-[var(--text-secondary)]">Net Promoter Score</div>
                          <div className="text-xs text-[var(--text-secondary)] mt-1">Based on {analyticsData.nps.total} responses</div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center">
                              <MdSentimentSatisfied className="text-green-600 dark:text-green-400 mr-2" size={20} />
                              <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Promoters (9-10)</span>
                            </div>
                            <span className="font-bold text-green-600 dark:text-green-400">{analyticsData.nps.promoters}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="flex items-center">
                              <MdSentimentNeutral className="text-yellow-600 dark:text-yellow-400 mr-2" size={20} />
                              <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Passives (7-8)</span>
                            </div>
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">{analyticsData.nps.passives}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center">
                              <MdSentimentDissatisfied className="text-red-600 dark:text-red-400 mr-2" size={20} />
                              <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Detractors (0-6)</span>
                            </div>
                            <span className="font-bold text-red-600 dark:text-red-400">{analyticsData.nps.detractors}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Demographics Tab (lazy loaded) ──────────────── */}
              {activeTab === 'demographics' && (
                <div className="p-4">
                  {demographicsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)] mx-auto"></div>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">Loading demographics...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Device Breakdown */}
                      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                          <h6 className="mb-0 text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Device Usage</h6>
                        </div>
                        <div className="p-4">
                          {analyticsData.demographics.byDevice?.length > 0 ? (
                            <Bar data={deviceData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                          ) : (
                            <EmptyState icon={MdPeople} title="No device data" message="Device data not available for this survey." />
                          )}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <div className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                          <h6 className="mb-0 text-lg font-semibold flex items-center text-[var(--light-text)] dark:text-[var(--dark-text)]">
                            <MdLocationOn className="mr-2" />Responses by Location
                          </h6>
                        </div>
                        <div className="p-4">
                          {analyticsData.demographics.byLocation?.length > 0 ? (
                            analyticsData.demographics.byLocation.map((location, index) => (
                              <div key={index} className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                  <FaMapMarkerAlt className="text-[var(--primary-color)] mr-2" />
                                  <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">{location.country || location.city || location._id || 'Unknown'}</span>
                                </div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">{location.count}</span>
                              </div>
                            ))
                          ) : (
                            <EmptyState icon={MdLocationOn} title="No location data" message="Location data not available for this survey." />
                          )}
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
                          {analyticsData.demographics.byTimeOfDay?.length > 0 ? (
                            <>
                              <h6 className="mb-3 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Peak Hours</h6>
                              {analyticsData.demographics.byTimeOfDay.map((timeSlot, index) => (
                                <div key={index} className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{timeSlot.hour ?? timeSlot._id}:00</span>
                                  <div className="flex items-center">
                                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${timeSlot.percentage || 0}%` }}></div>
                                    </div>
                                    <small className="text-[var(--text-secondary)]">{timeSlot.count}</small>
                                  </div>
                                </div>
                              ))}
                            </>
                          ) : (
                            <EmptyState icon={MdSchedule} title="No time data" message="Time pattern data not available." />
                          )}

                          {analyticsData.demographics.byDayOfWeek?.length > 0 && (
                            <>
                              <hr className="my-3 border-[var(--light-border)] dark:border-[var(--dark-border)]" />
                              <h6 className="mb-3 text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Peak Days</h6>
                              {analyticsData.demographics.byDayOfWeek.map((day, index) => (
                                <div key={index} className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">{day.dayName || day._id}</span>
                                  <div className="flex items-center">
                                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${day.percentage || 0}%` }}></div>
                                    </div>
                                    <small className="text-[var(--text-secondary)]">{day.count}</small>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

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
                📊 Export as CSV Spreadsheet
              </button>
              <button
                className="w-full px-4 py-3 rounded-md font-medium transition-colors border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: `${survey?.title} - Analytics Report`, text: `Check out the analytics for ${survey?.title}`, url: window.location.href });
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
