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
  getAllTrends,
} from '../../api/services/analyticsService';
import {
  getExecutiveDashboard,
  getOperationalDashboard
} from '../../api/services/dashboardService';


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

      // Fetch 3 dedicated analytics endpoints
      const [executiveRes, operationalRes, trendsRes] = await Promise.allSettled([
        getExecutiveDashboard({ range: dateRange }),
        getOperationalDashboard({ range: dateRange }),
        getAllTrends({ range: dateRange })
      ]);

      // Process results — use backend response directly, no reconstruction
      const executiveData = executiveRes.status === 'fulfilled' ? executiveRes.value : null;
      const operationalData = operationalRes.status === 'fulfilled' ? operationalRes.value : {};
      const trendsData = trendsRes.status === 'fulfilled' ? trendsRes.value : { satisfactionTrend: [], volumeTrend: [] };

      console.log('[AnalyticsDashboard] API Responses:', {
        executive: executiveRes.status,
        operational: operationalRes.status,
        trends: trendsRes.status
      });

      if (!executiveData) {
        setError('Failed to load dashboard data');
        setLoading(false);
        return;
      }

      setDashboardData({
        executive: executiveData,
        operational: operationalData,
        trends: trendsData,
        alerts: operationalData.alerts ? [
          ...(operationalData.alerts.critical > 0 ? [{ id: 'critical', type: 'critical', title: 'Critical Alerts', message: `${operationalData.alerts.critical} critical issues require attention`, timestamp: new Date(), action: 'Review high-priority actions' }] : []),
          ...(operationalData.alerts.warning > 0 ? [{ id: 'warning', type: 'warning', title: 'Warnings', message: `${operationalData.alerts.warning} warnings detected`, timestamp: new Date(), action: 'Monitor and address' }] : []),
          ...(operationalData.alerts.info > 0 ? [{ id: 'info', type: 'info', title: 'Information', message: `${operationalData.alerts.info} informational items`, timestamp: new Date(), action: 'Review when available' }] : [])
        ] : []
      });

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <div className="chart-container d-flex justify-content-center align-items-center">
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

      {/* AI Insights Section removed — was running entirely on mock data */}

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