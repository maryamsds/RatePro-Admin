// src/pages/Dashboard/ExecutiveDashboard.jsx
"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

// API Services
import { getExecutiveDashboard, getOperationalDashboard } from '../../api/services/dashboardService';
import { getAlerts } from '../../api/services/analyticsService';


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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async (showRefreshSpinner = false) => {
    try {
      if (showRefreshSpinner) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [executiveData, operationalData, alertsData] = await Promise.all([
        getExecutiveDashboard({ range: selectedTimeframe === 'week' ? '7d' : selectedTimeframe === 'month' ? '30d' : '90d' })
          .catch(err => {
            console.warn("Executive dashboard API error:", err.message);
            return null;
          }),
        getOperationalDashboard()
          .catch(err => {
            console.warn("Operational dashboard API error:", err.message);
            return null;
          }),
        getAlerts()
          .catch(err => {
            console.warn("Alerts API error:", err.message);
            return [];
          }),
      ]);

      if (executiveData || operationalData) {
        setDashboardData({
          kpis: executiveData?.kpis || mockDashboardData.kpis,
          trends: executiveData?.trends || mockDashboardData.trends,
          locations: executiveData?.locations || mockDashboardData.locations,
          topComplaints: executiveData?.topComplaints || operationalData?.topComplaints || mockDashboardData.topComplaints,
          topPraises: executiveData?.topPraises || operationalData?.topPraises || mockDashboardData.topPraises,
        });
      } else {
        setDashboardData(mockDashboardData);
      }

      setAlerts(alertsData?.length > 0 ? alertsData : mockAlerts);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
      setDashboardData(mockDashboardData);
      setAlerts(mockAlerts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTimeframe]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
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
          borderColor: '#14b8a6',
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
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
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: '#3b82f6',
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
          backgroundColor: 'rgba(239, 68, 68, 0.8)'
        },
        {
          label: 'NPS',
          data: dashboardData?.locations.map(loc => loc.nps / 20) || [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
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
      case 'critical': return <MdFlag className="text-[var(--danger-color)]" />;
      case 'warning': return <MdWarning className="text-[var(--warning-color)]" />;
      case 'info': return <MdCheckCircle className="text-[var(--info-color)]" />;
      default: return <MdNotifications className="text-[var(--text-secondary)]" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      excellent: 'bg-[var(--success-color)]',
      good: 'bg-[var(--info-color)]',
      'needs-attention': 'bg-[var(--warning-color)]',
      critical: 'bg-[var(--danger-color)]'
    };
    return (
      <span className={`px-2 py-0.5 text-white rounded-full text-xs font-medium ${variants[status] || 'bg-[var(--secondary-color)]'}`}>
        {status.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <FaArrowUp className="text-[var(--danger-color)]" />;
      case 'down': return <FaArrowDown className="text-[var(--success-color)]" />;
      default: return <span className="text-[var(--text-secondary)]">—</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[var(--text-secondary)] text-lg">Loading executive dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <MdDashboard size={32} className="text-[var(--primary-color)]" />
            <div>
              <h2 className="text-2xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-0">
                Executive Dashboard
              </h2>
              <p className="text-[var(--text-secondary)] mb-0">
                Real-time insights and performance metrics
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                         border border-[var(--light-border)] dark:border-[var(--dark-border)]
                         text-[var(--light-text)] dark:text-[var(--dark-text)]
                         bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                         hover:bg-[var(--light-hover)]/10 dark:hover:bg-[var(--dark-hover)]/10
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-300"
            >
              {refreshing ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdRefresh size={16} />
              )}
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => navigate('/app/analytics')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                         bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]
                         text-white transition-colors duration-300"
            >
              <MdAnalytics size={16} />
              Detailed Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 mb-6 p-4 rounded-md
                       bg-[var(--danger-light)] border border-[var(--danger-color)]
                       text-[var(--danger-color)]">
          <span className="flex-1">{error}</span>
          <button 
            onClick={handleRefresh}
            className="text-sm text-[var(--primary-color)] hover:underline font-medium
                       bg-transparent border-0 cursor-pointer p-0 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-6">
        {['week', 'month', 'quarter'].map((tf) => (
          <button
            key={tf}
            onClick={() => setSelectedTimeframe(tf)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${selectedTimeframe === tf
                ? 'bg-[var(--primary-color)] text-white'
                : 'border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]'
              }`}
          >
            {tf === 'week' ? 'Last 7 Days' : tf === 'month' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* Real-time Alerts */}
      {alerts.length > 0 && (
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md mb-6
                        border-l-4 border-l-[var(--warning-color)]
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MdNotifications className="text-[var(--warning-color)]" size={20} />
                <strong className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  Active Alerts ({alerts.length})
                </strong>
              </div>
              <button 
                onClick={() => navigate('/app/actions')}
                className="text-sm text-[var(--primary-color)] hover:underline font-medium
                           bg-transparent border-0 cursor-pointer p-0 transition-colors duration-300"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} 
                     className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-md p-4">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <strong className="text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        {alert.title}
                      </strong>
                      <p className="mb-0 mt-1 text-sm text-[var(--text-secondary)]">
                        {alert.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium
                                     bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--text-secondary)]">
                      {alert.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                        rounded-md shadow-md p-4
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]
                        text-center transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full
                          bg-[var(--primary-light)] mx-auto mb-3">
            <MdAnalytics size={24} className="text-[var(--primary-color)]" />
          </div>
          <h4 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
            {dashboardData?.kpis.totalSurveys}
          </h4>
          <small className="text-[var(--text-secondary)] text-xs">Active Surveys</small>
        </div>

        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                        rounded-md shadow-md p-4
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]
                        text-center transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full
                          bg-[var(--info-light)] mx-auto mb-3">
            <FaUsers size={24} className="text-[var(--info-color)]" />
          </div>
          <h4 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
            {dashboardData?.kpis.totalResponses.toLocaleString()}
          </h4>
          <small className="text-[var(--text-secondary)] text-xs">Total Responses</small>
          <div className="mt-2">
            <span className="text-[var(--success-color)] text-xs flex items-center justify-center gap-1">
              <FaArrowUp />
              +{dashboardData?.trends.responses.change}%
            </span>
          </div>
        </div>

        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                        rounded-md shadow-md p-4
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]
                        text-center transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full
                          bg-[var(--success-light)] mx-auto mb-3">
            <FaStar size={24} className="text-[var(--success-color)]" />
          </div>
          <h4 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
            {dashboardData?.kpis.avgSatisfaction}
          </h4>
          <small className="text-[var(--text-secondary)] text-xs">Avg Satisfaction</small>
          <div className="mt-2">
            <span className="text-[var(--success-color)] text-xs flex items-center justify-center gap-1">
              <FaArrowUp />
              +{dashboardData?.trends.satisfaction.change}
            </span>
          </div>
        </div>

        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                        rounded-md shadow-md p-4
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]
                        text-center transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full
                          bg-[var(--warning-light)] mx-auto mb-3">
            <MdTrendingUp size={24} className="text-[var(--warning-color)]" />
          </div>
          <h4 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
            {dashboardData?.kpis.npsScore}
          </h4>
          <small className="text-[var(--text-secondary)] text-xs">NPS Score</small>
          <div className="mt-2">
            <span className="text-[var(--success-color)] text-xs flex items-center justify-center gap-1">
              <FaArrowUp />
              +{dashboardData?.trends.nps.change}
            </span>
          </div>
        </div>

        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                        rounded-md shadow-md p-4
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]
                        text-center transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full
                          bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] mx-auto mb-3">
            <MdCheckCircle size={24} className="text-[var(--text-secondary)]" />
          </div>
          <h4 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
            {dashboardData?.kpis.responseRate}%
          </h4>
          <small className="text-[var(--text-secondary)] text-xs">Response Rate</small>
        </div>

        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                        rounded-md shadow-md p-4
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]
                        text-center transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-full
                          bg-[var(--info-light)] mx-auto mb-3">
            <MdAssignment size={24} className="text-[var(--info-color)]" />
          </div>
          <h4 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">
            {dashboardData?.kpis.completionRate}%
          </h4>
          <small className="text-[var(--text-secondary)] text-xs">Completion Rate</small>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                        rounded-md shadow-md
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex justify-between items-center p-6 border-b
                          border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <h5 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">
              Satisfaction Trend
            </h5>
            <small className="text-[var(--text-secondary)]">Last 7 weeks</small>
          </div>
          <div className="p-6">
            <div className="w-full h-80">
              <Line {...satisfactionTrendChart} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                        rounded-md shadow-md
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex justify-between items-center p-6 border-b
                          border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <h5 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">
              NPS Performance
            </h5>
            <small className="text-[var(--text-secondary)]">Weekly comparison</small>
          </div>
          <div className="p-6">
            <div className="w-full h-80">
              <Bar {...npsChart} />
            </div>
          </div>
        </div>
      </div>

      {/* Location Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                        rounded-md shadow-md
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <h5 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">
              Location Performance
            </h5>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold
                                 text-[var(--light-text)] dark:text-[var(--dark-text)]
                                 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    Location
                  </th>
                  <th className="text-left p-4 text-sm font-semibold
                                 text-[var(--light-text)] dark:text-[var(--dark-text)]
                                 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    Satisfaction
                  </th>
                  <th className="text-left p-4 text-sm font-semibold
                                 text-[var(--light-text)] dark:text-[var(--dark-text)]
                                 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    Responses
                  </th>
                  <th className="text-left p-4 text-sm font-semibold
                                 text-[var(--light-text)] dark:text-[var(--dark-text)]
                                 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    NPS Score
                  </th>
                  <th className="text-left p-4 text-sm font-semibold
                                 text-[var(--light-text)] dark:text-[var(--dark-text)]
                                 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.locations.map((location, index) => (
                  <tr key={index}
                      className="hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)]
                                 transition-colors duration-200">
                    <td className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-[var(--text-secondary)]" />
                        <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {location.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                          {location.satisfaction}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < location.satisfaction ? 'text-[var(--warning-color)]' : 'text-[var(--text-secondary)]'}
                              size={12}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <span className="text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        {location.responses.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <span className={`font-bold ${
                        location.nps >= 70 
                          ? 'text-[var(--success-color)]' 
                          : location.nps >= 50 
                            ? 'text-[var(--warning-color)]' 
                            : 'text-[var(--danger-color)]'
                      }`}>
                        {location.nps}
                      </span>
                    </td>
                    <td className="p-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      {getStatusBadge(location.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                        rounded-md shadow-md
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <h5 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] m-0">
              Location Comparison
            </h5>
          </div>
          <div className="p-6">
            <div className="w-full h-80">
              <Bar {...locationPerformanceChart} />
            </div>
          </div>
        </div>
      </div>

      {/* Issues & Praises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                        rounded-md shadow-md
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex justify-between items-center p-6 border-b
                          border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <h5 className="font-semibold m-0 text-[var(--danger-color)] flex items-center gap-2">
              <MdThumbDown />
              Top Complaints
            </h5>
            <button
              onClick={() => navigate('/app/actions')}
              className="px-3 py-1.5 text-sm font-medium rounded-md
                         border border-[var(--danger-color)] text-[var(--danger-color)]
                         bg-transparent hover:bg-[var(--danger-light)]
                         transition-colors duration-300"
            >
              <MdAssignment className="inline mr-1" />
              Create Actions
            </button>
          </div>
          <div className="p-6">
            {dashboardData?.topComplaints.map((complaint, index) => (
              <div key={index} className="flex justify-between items-center mb-3 last:mb-0">
                <div>
                  <div className="font-semibold text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {complaint.issue}
                  </div>
                  <small className="text-[var(--text-secondary)]">{complaint.count} mentions</small>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-white rounded-full text-xs font-medium ${
                    complaint.severity === 'high' 
                      ? 'bg-[var(--danger-color)]' 
                      : complaint.severity === 'medium' 
                        ? 'bg-[var(--warning-color)]' 
                        : 'bg-[var(--info-color)]'
                  }`}>
                    {complaint.severity}
                  </span>
                  {getTrendIcon(complaint.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)]
                        rounded-md shadow-md
                        border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="p-6 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <h5 className="font-semibold m-0 text-[var(--success-color)] flex items-center gap-2">
              <MdThumbUp />
              Top Praises
            </h5>
          </div>
          <div className="p-6">
            {dashboardData?.topPraises.map((praise, index) => (
              <div key={index} className="flex justify-between items-center mb-3 last:mb-0">
                <div>
                  <div className="font-semibold text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {praise.praise}
                  </div>
                  <small className="text-[var(--text-secondary)]">{praise.count} mentions</small>
                </div>
                <div>
                  {getTrendIcon(praise.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;