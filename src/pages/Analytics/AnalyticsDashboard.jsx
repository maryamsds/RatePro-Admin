// src/pages/Analytics/AnalyticsDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MdAnalytics, MdTrendingUp, MdTrendingDown, MdWarning,
  MdCheckCircle, MdFlag, MdTimer,
  MdSentimentSatisfied,
  MdNotifications, MdRefresh, MdAssessment,
  MdSpeed, MdThumbUp, MdThumbDown
} from 'react-icons/md';
import {
  FaExclamationTriangle, FaClock
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
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
  getAlerts,
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
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    executive: {},
    operational: {},
    trends: {},
    alerts: []
  });
  const [dateRange, setDateRange] = useState('30d');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Parse days from range for the trends endpoint which expects `days` not `range`
      const days = parseInt(dateRange.replace(/\D/g, '')) || 30;

      // Fetch 4 dedicated analytics endpoints in parallel
      const [executiveRes, operationalRes, trendsRes, alertsRes] = await Promise.allSettled([
        getExecutiveDashboard({ range: dateRange }),
        getOperationalDashboard({ range: dateRange }),
        getAllTrends({ days }),
        getAlerts()
      ]);

      // Process results — use backend response directly, no reconstruction
      const executiveData = executiveRes.status === 'fulfilled' ? executiveRes.value : null;
      const operationalData = operationalRes.status === 'fulfilled' ? operationalRes.value : {};
      const trendsData = trendsRes.status === 'fulfilled' ? trendsRes.value : { satisfaction: { labels: [], values: [] } };
      const alertsData = alertsRes.status === 'fulfilled' ? alertsRes.value : [];



      if (!executiveData) {
        setError('Failed to load executive dashboard data. Other sections may still be available.');
      }

      setDashboardData({
        executive: executiveData || {},
        operational: operationalData,
        trends: trendsData,
        alerts: Array.isArray(alertsData) ? alertsData : []
      });

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Chart configurations — memoized to avoid recomputation on every render
  const satisfactionChartData = useMemo(() => ({
    labels: dashboardData.trends?.satisfaction?.labels || [],
    datasets: [
      {
        label: 'Customer Satisfaction',
        data: dashboardData.trends?.satisfaction?.values || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  }), [dashboardData.trends?.satisfaction]);

  const npsChartData = useMemo(() => ({
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
  }), [dashboardData.executive?.npsScore]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] p-6">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--light-text)] dark:text-[var(--dark-text)]">Loading Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] p-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-[var(--warning-color)]/10 border border-[var(--warning-color)] rounded-md p-4 mb-6 flex items-center gap-3" role="alert">
          <MdWarning className="text-[var(--warning-color)] flex-shrink-0" size={20} />
          <div className="flex-1 text-[var(--light-text)] dark:text-[var(--dark-text)]">{error}</div>
          <button
            className="px-3 py-1.5 rounded-md font-medium transition-colors border border-[var(--warning-color)] text-[var(--warning-color)] hover:bg-[var(--warning-color)]/20"
            onClick={() => { setError(null); fetchDashboardData(); }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--primary-color)]/10 dark:bg-[var(--primary-color)]/20 flex items-center justify-center">
              <MdAssessment className="text-2xl text-[var(--primary-color)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">Analytics Dashboard</h1>
              <p className="text-sm text-[var(--text-secondary)]">Real-time insights and AI-powered analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="px-4 py-2 rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
              <option value="365d">Last Year</option>
            </select>
            <button 
              className="px-4 py-2 rounded-md font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-card)] dark:bg-[var(--dark-card)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-bg)] dark:hover:bg-[var(--dark-bg)] flex items-center gap-2"
              onClick={fetchDashboardData}
            >
              <MdRefresh />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Dashboard */}
      <div className="mb-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <MdAnalytics className="text-xl text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Executive Dashboard</h2>
          </div>

          {/* Executive Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Customer Satisfaction Index */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <MdSentimentSatisfied className="text-2xl text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {dashboardData.executive?.customerSatisfactionIndex?.overall || 0}/5.0
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">Customer Satisfaction Index</p>
                  <div className={`flex items-center gap-1 mt-1 ${(dashboardData.executive?.customerSatisfactionIndex?.trend || 0) >= 0 ? 'text-[var(--success-color)]' : 'text-[var(--danger-color)]'}`}>
                    {(dashboardData.executive?.customerSatisfactionIndex?.trend || 0) >= 0 ? <MdTrendingUp /> : <MdTrendingDown />}
                    <span className="text-sm font-medium">{Math.abs(dashboardData.executive?.customerSatisfactionIndex?.trend || 0)}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {dashboardData.executive?.customerSatisfactionIndex?.locations?.map((loc, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-secondary)]">{loc.name}</span>
                    <span className="font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{loc.score}/5.0 ({loc.responses})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NPS Score */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
                  <MdThumbUp className="text-2xl text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {dashboardData.executive?.npsScore?.current || 0}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">Net Promoter Score</p>
                  <div className={`flex items-center gap-1 mt-1 ${(dashboardData.executive?.npsScore?.trend || 0) >= 0 ? 'text-[var(--success-color)]' : 'text-[var(--danger-color)]'}`}>
                    {(dashboardData.executive?.npsScore?.trend || 0) >= 0 ? <MdTrendingUp /> : <MdTrendingDown />}
                    <span className="text-sm font-medium">{Math.abs(dashboardData.executive?.npsScore?.trend || 0)} pts</span>
                  </div>
                </div>
              </div>
              <div className="h-40 flex items-center justify-center">
                <Doughnut data={npsChartData} options={{ maintainAspectRatio: true }} />
              </div>
            </div>

            {/* Survey Activity */}
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                  <MdSpeed className="text-2xl text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {dashboardData.executive?.responseRate?.completed || 0}
                    <span className="text-sm font-normal text-[var(--text-secondary)]"> responses</span>
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">Survey Activity</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary-color)] transition-all duration-300"
                    style={{
                      width: `${dashboardData.executive?.responseRate?.surveysSent > 0
                        ? Math.min(100, Math.round((dashboardData.executive?.responseRate?.completed || 0) / dashboardData.executive.responseRate.surveysSent * 100))
                        : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  {dashboardData.executive?.responseRate?.completed || 0} of {dashboardData.executive?.responseRate?.surveysSent || 0} surveys sent
                </span>
              </div>
            </div>
          </div>

          {/* Satisfaction Trend Chart */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-4">Satisfaction Trend (Month-on-Month)</h3>
            <div className="h-80 flex justify-center items-center">
              {satisfactionChartData.labels.length > 0 ? (
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
              ) : (
                <p className="text-[var(--text-secondary)]">No satisfaction trend data available for this period.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Dashboard */}
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                  <MdNotifications className="text-xl text-orange-500" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Operational Dashboard - Real-time Alerts</h2>
              </div>

              {/* Alert Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-500/10 dark:bg-red-500/20 rounded-md p-4 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 dark:bg-red-500/30 flex items-center justify-center">
                      <FaExclamationTriangle className="text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{dashboardData.operational?.alerts?.critical || 0}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Critical Alerts</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-500/10 dark:bg-yellow-500/20 rounded-md p-4 border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 dark:bg-yellow-500/30 flex items-center justify-center">
                      <MdWarning className="text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{dashboardData.operational?.alerts?.warning || 0}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Warnings</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-500/10 dark:bg-green-500/20 rounded-md p-4 border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 dark:bg-green-500/30 flex items-center justify-center">
                      <MdCheckCircle className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">{dashboardData.operational?.slaMetrics?.onTimeResolution || 0}%</h3>
                      <p className="text-sm text-[var(--text-secondary)]">SLA Compliance</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complaints vs Praises */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MdThumbDown className="text-xl text-red-500" />
                    <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Top 5 Complaints</h3>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.operational?.topComplaints?.map((complaint, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{complaint.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-red-500">{complaint.count}</span>
                          <div className={`${complaint.trend === 'up' ? 'text-red-500' : complaint.trend === 'down' ? 'text-green-500' : 'text-[var(--text-secondary)]'}`}>
                            {complaint.trend === 'up' ? <MdTrendingUp /> :
                              complaint.trend === 'down' ? <MdTrendingDown /> :
                                <span className="text-sm">—</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MdThumbUp className="text-xl text-green-500" />
                    <h3 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Top 5 Praises</h3>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.operational?.topPraises?.map((praise, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                        <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">{praise.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-green-500">{praise.count}</span>
                          <div className={`${praise.trend === 'up' ? 'text-green-500' : praise.trend === 'down' ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}>
                            {praise.trend === 'up' ? <MdTrendingUp /> :
                              praise.trend === 'down' ? <MdTrendingDown /> :
                                <span className="text-sm">—</span>}
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
          <div>
            <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center">
                  <MdTimer className="text-xl text-cyan-500" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">SLA Tracker</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-secondary)]">Average Response Time</span>
                    <span className="text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">{dashboardData.operational?.slaMetrics?.averageResponseTime || 'N/A'}</span>
                  </div>
                </div>
                <div className="p-4 rounded-md bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[var(--text-secondary)]">On-time Resolution</span>
                    <span className="text-sm font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">{dashboardData.operational?.slaMetrics?.onTimeResolution || 0}%</span>
                  </div>
                  <div className="w-full bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${dashboardData.operational?.slaMetrics?.onTimeResolution || 0}%` }}
                    />
                  </div>
                </div>
                <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <FaClock className="text-red-500" />
                    <span className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      {dashboardData.operational?.slaMetrics?.overdueActions || 0} overdue actions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mb-6">
        <div className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-md shadow-md p-6 border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
              <MdFlag className="text-xl text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">Recent Alerts & Notifications</h2>
          </div>

          <div className="space-y-3">
            {dashboardData.alerts?.length > 0 ? (
              dashboardData.alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-md border ${
                    alert.type === 'critical' 
                      ? 'bg-red-500/10 border-red-500/20' 
                      : alert.type === 'warning' 
                      ? 'bg-yellow-500/10 border-yellow-500/20' 
                      : alert.type === 'info'
                      ? 'bg-blue-500/10 border-blue-500/20'
                      : 'bg-green-500/10 border-green-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] mb-1">{alert.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">{alert.message}</p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>
                          {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : '—'}
                        </span>
                        {alert.action && (
                          <>
                            <span>•</span>
                            <span>{alert.action}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        alert.type === 'critical' 
                          ? 'bg-red-500 text-white' 
                          : alert.type === 'warning' 
                          ? 'bg-yellow-500 text-white' 
                          : alert.type === 'info'
                          ? 'bg-blue-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}>
                        {alert.type?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                No active alerts — all systems operating normally.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;