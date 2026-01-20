// src/pages/Analytics/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  MdAnalytics, MdTrendingUp, MdTrendingDown, MdWarning,
  MdCheckCircle, MdFlag, MdLocationOn, MdPeople, MdTimer,
  MdSentimentSatisfied, MdSentimentDissatisfied, MdSentimentNeutral,
  MdBarChart, MdPieChart, MdShowChart, MdInsights, MdNotifications,
  MdRefresh, MdDownload, MdFilterList, MdDateRange, MdAssessment,
  MdSpeed, MdSecurity, MdThumbUp, MdThumbDown
} from 'react-icons/md';
import {
  FaChartLine, FaExclamationTriangle, FaThumbsUp, FaThumbsDown,
  FaClock, FaUsers, FaMapMarkerAlt, FaStar, FaHeart
} from 'react-icons/fa';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import {
  getTenantSummary,
  getQuickSummary,
  getAllTrends,
  getAlerts,
  getFlaggedResponses
} from '../../api/services/analyticsService';


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsDashboard = () => {
  // Dashboard State
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    executive: {},
    operational: {},
    aiInsights: {},
    trends: {},
    alerts: []
  });
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('satisfaction');

  // Modals
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch multiple analytics endpoints using new API services
      const [tenantSummaryRes, quickSummaryRes, trendsRes, alertsRes, flaggedRes] = await Promise.allSettled([
        getTenantSummary({ range: dateRange }),
        getQuickSummary(),
        getAllTrends({ range: dateRange }),
        getAlerts(),
        getFlaggedResponses({ range: dateRange, limit: 10 })
      ]);

      // Process results - show empty states instead of mock data
      const tenantData = tenantSummaryRes.status === 'fulfilled' ? tenantSummaryRes.value : null;
      const quickData = quickSummaryRes.status === 'fulfilled' ? quickSummaryRes.value : {};
      const trendsData = trendsRes.status === 'fulfilled' ? trendsRes.value : { satisfactionTrend: [], volumeTrend: [] };
      const alertsData = alertsRes.status === 'fulfilled' ? alertsRes.value : [];
      const flaggedData = flaggedRes.status === 'fulfilled' ? flaggedRes.value : { responses: [] };

      // DEBUG: Log raw API responses
      console.log('[AnalyticsDashboard] Raw API Responses:');
      console.log('  tenantSummary:', tenantSummaryRes.status, tenantData);
      console.log('  quickSummary:', quickSummaryRes.status, quickData);
      console.log('  trends:', trendsRes.status, trendsData);
      console.log('  alerts:', alertsRes.status, alertsData);
      console.log('  flagged:', flaggedRes.status, flaggedData);

      // If tenant data failed, show error state
      if (!tenantData) {
        setError('Failed to load dashboard data');
        setLoading(false);
        return;
      }

      // Build executive data from tenant summary - using transformed data structure
      const executiveData = {
        customerSatisfactionIndex: {
          overall: tenantData.overallSatisfaction || tenantData.sentiment?.avgRating || 0,
          trend: tenantData.comparison?.ratingChange || 0,
          locations: [],  // Not available in current API
          services: []    // Not available in current API
        },
        npsScore: {
          current: tenantData.overallNPS || 0,
          trend: tenantData.comparison?.responseChange || 0,
          promoters: 0,   // Need separate NPS breakdown API
          detractors: 0,
          passives: 0
        },
        responseRate: {
          // Calculate response rate: if we have responses, show as percentage of active surveys
          current: tenantData.totalResponses > 0 && tenantData.activeSurveys > 0
            ? Math.round((tenantData.totalResponses / tenantData.activeSurveys) * 10)
            : quickData.completionRateToday || 0,
          trend: quickData.responsesChange || 0,
          total: tenantData.totalResponses || 0,
          completed: tenantData.totalResponses || 0
        },
        ...tenantData
      };

      // Build operational data
      const operationalData = {
        alerts: {
          critical: alertsData.filter(a => a.type === 'critical').length,
          warning: alertsData.filter(a => a.type === 'warning').length,
          info: alertsData.filter(a => a.type === 'info').length
        },
        slaMetrics: {
          averageResponseTime: 'N/A',
          onTimeResolution: 0,
          overdueActions: tenantData.actions?.overdue || 0
        },
        topComplaints: flaggedData.summary?.byReason || [],
        topPraises: [],
        quickStats: quickData
      };

      setDashboardData({
        executive: executiveData,
        operational: operationalData,
        trends: trendsData,
        alerts: alertsData || [],
        aiInsights: null  // AI insights not implemented - removed mock data
      });

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      // Show error state instead of mock data
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mock data generators (for development/fallback)
  const getMockExecutiveData = () => ({
    customerSatisfactionIndex: {
      overall: 4.2,
      trend: 0.3,
      locations: [
        { name: 'Riyadh Office', score: 4.5, responses: 156 },
        { name: 'Jeddah Branch', score: 4.1, responses: 98 },
        { name: 'Dammam Center', score: 3.9, responses: 78 }
      ],
      services: [
        { name: 'Customer Service', score: 4.4, responses: 245 },
        { name: 'Product Quality', score: 4.2, responses: 189 },
        { name: 'Delivery', score: 3.8, responses: 167 }
      ]
    },
    npsScore: {
      current: 42,
      trend: 5,
      promoters: 156,
      detractors: 34,
      passives: 98
    },
    responseRate: {
      current: 68,
      trend: -2,
      total: 1245,
      completed: 847
    }
  });

  const getMockOperationalData = () => ({
    alerts: {
      critical: 3,
      warning: 12,
      info: 8
    },
    slaMetrics: {
      averageResponseTime: '2.4 hours',
      onTimeResolution: 87,
      overdueActions: 15
    },
    topComplaints: [
      { category: 'Service Speed', count: 45, trend: 'up' },
      { category: 'Staff Behavior', count: 32, trend: 'down' },
      { category: 'Product Quality', count: 28, trend: 'stable' },
      { category: 'Pricing', count: 19, trend: 'up' },
      { category: 'Facilities', count: 15, trend: 'down' }
    ],
    topPraises: [
      { category: 'Friendly Staff', count: 89, trend: 'up' },
      { category: 'Quick Service', count: 67, trend: 'stable' },
      { category: 'Clean Environment', count: 54, trend: 'up' },
      { category: 'Good Value', count: 43, trend: 'down' },
      { category: 'Product Quality', count: 38, trend: 'up' }
    ]
  });

  const getMockTrendsData = () => ({
    satisfactionTrend: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [4.1, 4.0, 4.2, 4.3, 4.1, 4.2]
    },
    volumeTrend: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      surveys: [156, 189, 234, 198],
      responses: [142, 167, 201, 178]
    }
  });

  const getMockAlertsData = () => ({
    alerts: [
      {
        id: 1,
        type: 'critical',
        title: 'NPS Drop Detected',
        message: 'Customer satisfaction in Jeddah branch dropped 15% this week',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        action: 'Investigate service quality issues'
      },
      {
        id: 2,
        type: 'warning',
        title: 'Response Rate Low',
        message: 'Survey completion rate fell below 70% threshold',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        action: 'Review survey length and incentives'
      },
      {
        id: 3,
        type: 'info',
        title: 'Peak Response Time',
        message: 'Highest survey responses recorded between 2-4 PM',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        action: 'Optimize survey distribution timing'
      }
    ]
  });

  const getMockAIInsights = () => ({
    predictions: [
      {
        metric: 'Customer Satisfaction',
        prediction: 'If current service speed issues continue, NPS may drop by 12% in next month',
        confidence: 85,
        recommendation: 'Implement staff training program for faster service delivery'
      },
      {
        metric: 'Response Rate',
        prediction: 'Survey completion rate likely to improve with shorter questionnaires',
        confidence: 72,
        recommendation: 'Reduce average survey length from 8 to 6 questions'
      }
    ],
    sentimentHeatmap: {
      regions: [
        { name: 'Riyadh', sentiment: 0.7, color: '#28a745' },
        { name: 'Jeddah', sentiment: 0.4, color: '#ffc107' },
        { name: 'Dammam', sentiment: 0.2, color: '#dc3545' }
      ]
    },
    suggestedActions: [
      'Focus on service speed improvement in Jeddah branch',
      'Implement recognition program for friendly staff',
      'Review pricing strategy based on customer feedback'
    ]
  });

  const generateAIInsights = async (executive, operational) => {
    // In production, this would call the AI insights API
    return getMockAIInsights();
  };

  // Chart configurations
  const satisfactionChartData = {
    labels: dashboardData.trends?.satisfactionTrend?.labels || [],
    datasets: [
      {
        label: 'Customer Satisfaction',
        data: dashboardData.trends?.satisfactionTrend?.values || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  };

  const npsChartData = {
    labels: ['Promoters', 'Passives', 'Detractors'],
    datasets: [
      {
        data: [
          dashboardData.executive?.npsScore?.promoters || 0,
          dashboardData.executive?.npsScore?.passives || 0,
          dashboardData.executive?.npsScore?.detractors || 0
        ],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        borderWidth: 2
      }
    ]
  };

  const complaintsChartData = {
    labels: dashboardData.operational?.topComplaints?.map(c => c.category) || [],
    datasets: [
      {
        label: 'Complaints',
        data: dashboardData.operational?.topComplaints?.map(c => c.count) || [],
        backgroundColor: 'rgba(220, 53, 69, 0.8)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <div className="analytics-dashboard-container">
        <div className="analytics-loading">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard-container">
      {/* Header Section */}
      <div className="page-header-section">
        <div className="header-content">
          <div className="header-left">
            <div className="page-icon">
              <MdAssessment />
            </div>
            <div className="page-info">
              <h1 className="page-title">Analytics Dashboard</h1>
              <p className="page-subtitle">Real-time insights and AI-powered analytics</p>
            </div>
          </div>
          <div className="header-actions">
            <select
              className="date-range-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
              <option value="1y">Last Year</option>
            </select>
            <button className="btn btn-outline-primary" onClick={fetchDashboardData}>
              <MdRefresh />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Dashboard */}
      <div className="executive-section">
        <div className="section-card">
          <div className="section-header">
            <div className="section-icon">
              <MdAnalytics />
            </div>
            <h2 className="section-title">Executive Dashboard</h2>
          </div>

          {/* Executive Stats Grid */}
          <div className="stats-grid">
            {/* Customer Satisfaction Index */}
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon stat-icon-primary">
                  <MdSentimentSatisfied />
                </div>
                <div className="stat-info">
                  <h3 className="stat-number">
                    {dashboardData.executive?.customerSatisfactionIndex?.overall || 0}/5.0
                  </h3>
                  <p className="stat-label">Customer Satisfaction Index</p>
                  <div className={`stat-trend ${(dashboardData.executive?.customerSatisfactionIndex?.trend || 0) >= 0 ? 'trend-up' : 'trend-down'}`}>
                    {(dashboardData.executive?.customerSatisfactionIndex?.trend || 0) >= 0 ? <MdTrendingUp /> : <MdTrendingDown />}
                    <span>{Math.abs(dashboardData.executive?.customerSatisfactionIndex?.trend || 0)}%</span>
                  </div>
                </div>
              </div>
              <div className="location-breakdown">
                {dashboardData.executive?.customerSatisfactionIndex?.locations?.map((loc, idx) => (
                  <div key={idx} className="breakdown-item">
                    <span className="breakdown-label">{loc.name}</span>
                    <span className="breakdown-value">{loc.score}/5.0 ({loc.responses})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NPS Score */}
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon stat-icon-success">
                  <MdThumbUp />
                </div>
                <div className="stat-info">
                  <h3 className="stat-number">
                    {dashboardData.executive?.npsScore?.current || 0}
                  </h3>
                  <p className="stat-label">Net Promoter Score</p>
                  <div className="stat-trend trend-up">
                    <MdTrendingUp />
                    <span>+{dashboardData.executive?.npsScore?.trend || 0}</span>
                  </div>
                </div>
              </div>
              <div className="chart-container-small">
                <Doughnut data={npsChartData} options={{ maintainAspectRatio: true }} />
              </div>
            </div>

            {/* Response Rate */}
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon stat-icon-info">
                  <MdSpeed />
                </div>
                <div className="stat-info">
                  <h3 className="stat-number">
                    {dashboardData.executive?.responseRate?.current || 0}%
                  </h3>
                  <p className="stat-label">Response Rate</p>
                </div>
              </div>
              <div className="progress-wrapper">
                <div className="progress-bar-wrapper">
                  <div
                    className="progress-fill"
                    style={{ width: `${dashboardData.executive?.responseRate?.current || 0}%` }}
                  />
                </div>
                <span className="progress-text">
                  {dashboardData.executive?.responseRate?.completed || 0} of {dashboardData.executive?.responseRate?.total || 0} completed
                </span>
              </div>
            </div>
          </div>

          {/* Satisfaction Trend Chart */}
          <div className="chart-section">
            <div className="chart-header">
              <h3 className="chart-title">Satisfaction Trend (Month-on-Month)</h3>
            </div>
            <div className="chart-container">
              <Line
                data={satisfactionChartData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operational Dashboard */}
      <div className="operational-section">
        <div className="operational-grid">
          <div className="operational-main">
            <div className="section-card">
              <div className="section-header">
                <div className="section-icon">
                  <MdNotifications />
                </div>
                <h2 className="section-title">Operational Dashboard - Real-time Alerts</h2>
              </div>

              {/* Alert Stats */}
              <div className="alert-stats">
                <div className="alert-stat alert-critical">
                  <div className="alert-icon">
                    <FaExclamationTriangle />
                  </div>
                  <div className="alert-info">
                    <h3 className="alert-number">{dashboardData.operational?.alerts?.critical || 0}</h3>
                    <p className="alert-label">Critical Alerts</p>
                  </div>
                </div>
                <div className="alert-stat alert-warning">
                  <div className="alert-icon">
                    <MdWarning />
                  </div>
                  <div className="alert-info">
                    <h3 className="alert-number">{dashboardData.operational?.alerts?.warning || 0}</h3>
                    <p className="alert-label">Warnings</p>
                  </div>
                </div>
                <div className="alert-stat alert-success">
                  <div className="alert-icon">
                    <MdCheckCircle />
                  </div>
                  <div className="alert-info">
                    <h3 className="alert-number">{dashboardData.operational?.slaMetrics?.onTimeResolution || 0}%</h3>
                    <p className="alert-label">SLA Compliance</p>
                  </div>
                </div>
              </div>

              {/* Complaints vs Praises */}
              <div className="feedback-grid">
                <div className="feedback-section">
                  <div className="feedback-header">
                    <MdThumbDown className="feedback-icon complaints-icon" />
                    <h3 className="feedback-title">Top 5 Complaints</h3>
                  </div>
                  <div className="feedback-list">
                    {dashboardData.operational?.topComplaints?.map((complaint, idx) => (
                      <div key={idx} className="feedback-item">
                        <span className="feedback-category">{complaint.category}</span>
                        <div className="feedback-meta">
                          <span className="feedback-count complaint-count">{complaint.count}</span>
                          <div className={`trend-indicator ${complaint.trend === 'up' ? 'trend-up' : complaint.trend === 'down' ? 'trend-down' : 'trend-neutral'}`}>
                            {complaint.trend === 'up' ? <MdTrendingUp /> :
                              complaint.trend === 'down' ? <MdTrendingDown /> :
                                <span>—</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="feedback-section">
                  <div className="feedback-header">
                    <MdThumbUp className="feedback-icon praises-icon" />
                    <h3 className="feedback-title">Top 5 Praises</h3>
                  </div>
                  <div className="feedback-list">
                    {dashboardData.operational?.topPraises?.map((praise, idx) => (
                      <div key={idx} className="feedback-item">
                        <span className="feedback-category">{praise.category}</span>
                        <div className="feedback-meta">
                          <span className="feedback-count praise-count">{praise.count}</span>
                          <div className={`trend-indicator ${praise.trend === 'up' ? 'trend-up' : praise.trend === 'down' ? 'trend-down' : 'trend-neutral'}`}>
                            {praise.trend === 'up' ? <MdTrendingUp /> :
                              praise.trend === 'down' ? <MdTrendingDown /> :
                                <span>—</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLA Tracker */}
          <div className="sla-sidebar">
            <div className="section-card">
              <div className="section-header">
                <div className="section-icon">
                  <MdTimer />
                </div>
                <h2 className="section-title">SLA Tracker</h2>
              </div>
              <div className="sla-metrics">
                <div className="sla-metric">
                  <div className="sla-metric-row">
                    <span className="sla-label">Average Response Time</span>
                    <span className="sla-value">{dashboardData.operational?.slaMetrics?.averageResponseTime || 'N/A'}</span>
                  </div>
                </div>
                <div className="sla-metric">
                  <div className="sla-metric-row">
                    <span className="sla-label">On-time Resolution</span>
                    <span className="sla-value">{dashboardData.operational?.slaMetrics?.onTimeResolution || 0}%</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div
                      className="progress-fill success-progress"
                      style={{ width: `${dashboardData.operational?.slaMetrics?.onTimeResolution || 0}%` }}
                    />
                  </div>
                </div>
                <div className="sla-alert">
                  <div className="alert-danger-card">
                    <FaClock className="alert-icon" />
                    <span className="alert-text">
                      {dashboardData.operational?.slaMetrics?.overdueActions || 0} overdue actions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Report */}
      <div className="ai-insights-section">
        <div className="section-card">
          <div className="section-header">
            <div className="section-icon">
              <MdInsights />
            </div>
            <h2 className="section-title">AI Insights Report - Predictive Analysis</h2>
          </div>

          <div className="insights-grid">
            <div className="insights-main">
              <div className="insights-header">
                <div className="insights-icon">
                  <MdBarChart />
                </div>
                <h3 className="insights-title">Predictive Insights</h3>
              </div>
              <div className="predictions-list">
                {dashboardData.aiInsights?.predictions?.map((prediction, idx) => (
                  <div key={idx} className={`prediction-card ${idx === 0 ? 'prediction-warning' : 'prediction-info'}`}>
                    <div className="prediction-content">
                      <div className="prediction-main">
                        <h4 className="prediction-metric">{prediction.metric}</h4>
                        <p className="prediction-text">{prediction.prediction}</p>
                        <div className="prediction-recommendation">
                          <MdInsights className="recommendation-icon" />
                          <span className="recommendation-text">{prediction.recommendation}</span>
                        </div>
                      </div>
                      <div className="prediction-confidence">
                        <span className="confidence-badge">
                          {prediction.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="insights-sidebar">
              <div className="sentiment-section">
                <div className="sentiment-header">
                  <div className="sentiment-icon">
                    <MdLocationOn />
                  </div>
                  <h3 className="sentiment-title">Sentiment Heatmap</h3>
                </div>
                <div className="sentiment-regions">
                  {dashboardData.aiInsights?.sentimentHeatmap?.regions?.map((region, idx) => (
                    <div key={idx} className="sentiment-region">
                      <span className="region-name">{region.name}</span>
                      <div className="region-sentiment">
                        <div
                          className="sentiment-indicator"
                          style={{ backgroundColor: region.color }}
                        />
                        <span className="sentiment-score">{Math.round(region.sentiment * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="alerts-section">
        <div className="section-card">
          <div className="section-header">
            <div className="section-left">
              <div className="section-icon">
                <MdFlag />
              </div>
              <h2 className="section-title">Recent Alerts & Notifications</h2>
            </div>
            <div className="section-actions">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowAlertsModal(true)}
              >
                View All
              </button>
            </div>
          </div>

          <div className="alerts-list">
            {dashboardData.alerts?.slice(0, 3).map((alert, idx) => (
              <div
                key={alert.id}
                className={`alert-card alert-${alert.type}`}
              >
                <div className="alert-content">
                  <div className="alert-main">
                    <h4 className="alert-title">{alert.title}</h4>
                    <p className="alert-message">{alert.message}</p>
                    <div className="alert-meta">
                      <span className="alert-timestamp">{alert.timestamp.toLocaleString()}</span>
                      <span className="alert-separator">•</span>
                      <span className="alert-action">{alert.action}</span>
                    </div>
                  </div>
                  <div className="alert-badge">
                    <span className={`badge-${alert.type}`}>
                      {alert.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;