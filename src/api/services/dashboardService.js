// src/api/services/dashboardService.js
// ============================================================================
// 📊 Dashboard Service - API calls with response transformation
// ============================================================================
import axiosInstance from "../axiosInstance";
import { getQuickSummary, getTenantSummary, getAlerts } from "./analyticsService";

/**
 * Get executive dashboard data
 * @param {Object} params - { range, timeframe }
 * @returns {Promise<Object>}
 */
export const getExecutiveDashboard = async (params = {}) => {
  const { range = "30d" } = params;
  const response = await axiosInstance.get(`/surveys/dashboards/executive?range=${range}`);
  return transformExecutiveDashboard(response.data);
};

/**
 * Get operational dashboard data
 * @param {Object} params - { range }
 * @returns {Promise<Object>}
 */
export const getOperationalDashboard = async (params = {}) => {
  const { range = "30d" } = params;
  const response = await axiosInstance.get(`/surveys/dashboards/operational?range=${range}`);
  return transformOperationalDashboard(response.data);
};

/**
 * Get main dashboard stats (combined)
 * @returns {Promise<Object>}
 */
export const getDashboardStats = async () => {
  const [executive, operational] = await Promise.all([
    getExecutiveDashboard(),
    getOperationalDashboard(),
  ]);
  
  return {
    ...executive,
    ...operational,
  };
};

/**
 * Get real-time dashboard widget data
 * Uses the new quick summary endpoint
 * @returns {Promise<Object>}
 */
export const getRealTimeStats = async () => {
  try {
    const quickData = await getQuickSummary();
    return {
      todayResponses: quickData.todayResponses || 0,
      activeRespondents: quickData.activeRespondents || 0,
      avgRatingToday: quickData.avgRatingToday || 0,
      responsesChange: quickData.responsesChange || 0,
      ratingChange: quickData.ratingChange || 0,
      criticalAlerts: quickData.criticalAlerts || 0,
      pendingActions: quickData.pendingActions || 0,
      completionRateToday: quickData.completionRateToday || 0,
      npsToday: quickData.npsToday || 0,
      lastUpdated: quickData.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching real-time stats:', error);
    return null;
  }
};

/**
 * Get comprehensive dashboard data with new analytics
 * @param {Object} params - { range }
 * @returns {Promise<Object>}
 */
export const getComprehensiveDashboard = async (params = {}) => {
  const { range = "30d" } = params;
  
  const [tenantSummary, quickStats, alerts] = await Promise.allSettled([
    getTenantSummary({ range }),
    getQuickSummary(),
    getAlerts(),
  ]);
  
  return {
    summary: tenantSummary.status === 'fulfilled' ? tenantSummary.value : null,
    realTime: quickStats.status === 'fulfilled' ? quickStats.value : null,
    alerts: alerts.status === 'fulfilled' ? alerts.value : [],
  };
};

// ============================================================================
// 🔄 Transform Functions
// ============================================================================

/**
 * Transform executive dashboard response
 */
const transformExecutiveDashboard = (data) => {
  const metrics = data.metrics || data;
  
  return {
    kpis: {
      totalSurveys: metrics.totalSurveys || 0,
      totalResponses: metrics.totalResponses || 0,
      avgSatisfaction: metrics.averageRating || metrics.satisfactionIndex / 20 || 0,
      satisfactionIndex: metrics.satisfactionIndex || 0,
      npsScore: metrics.npsScore || calculateNpsFromTrend(metrics.npsTrend),
      responseRate: metrics.responseRate || 0,
      completionRate: metrics.completionRate || 0,
      averageRating: metrics.averageRating || 0,
      averageScore: metrics.averageScore || 0,
    },
    
    trends: {
      satisfaction: {
        data: metrics.satisfactionTrend?.values || [],
        labels: metrics.satisfactionTrend?.labels || generateWeekLabels(7),
        change: metrics.satisfactionChange || 0,
      },
      nps: {
        data: extractNpsTrendData(metrics.npsTrend),
        labels: extractNpsTrendLabels(metrics.npsTrend) || generateWeekLabels(7),
        change: metrics.npsChange || 0,
      },
      responses: {
        data: metrics.responseTrend?.values || [],
        labels: metrics.responseTrend?.labels || generateWeekLabels(7),
        change: metrics.responseChange || 0,
      },
    },
    
    locations: metrics.locations || [],
    
    topComplaints: (metrics.topComplaints || []).map((c) => ({
      issue: c.category || c.issue,
      count: c.count,
      trend: c.trend || "stable",
      severity: c.severity || "medium",
    })),
    
    topPraises: (metrics.topPraises || []).map((p) => ({
      praise: p.category || p.praise,
      count: p.count,
      trend: p.trend || "stable",
    })),
    
    updatedAt: metrics.updatedAt || new Date().toISOString(),
  };
};

/**
 * Transform operational dashboard response
 */
const transformOperationalDashboard = (data) => ({
  alerts: {
    critical: data.criticalAlerts || countAlertsByType(data.recentNegativeFeedback, "critical"),
    warning: data.warningAlerts || countAlertsByType(data.recentNegativeFeedback, "warning"),
    info: data.infoAlerts || 0,
    total: data.openActionsCount || 0,
  },
  
  slaMetrics: {
    averageResponseTime: data.slaAvgResponseTime || "N/A",
    onTimeResolution: data.onTimeResolution || 0,
    overdueActions: data.overdueActions || 0,
  },
  
  recentNegativeFeedback: (data.recentNegativeFeedback || []).map((feedback) => ({
    id: feedback._id,
    surveyTitle: feedback.response?.survey?.title || "Unknown Survey",
    sentiment: feedback.sentiment,
    summary: feedback.summary || feedback.extractedThemes?.join(", "),
    createdAt: feedback.createdAt,
    categories: feedback.categories || [],
    priority: feedback.sentiment === "negative" ? "high" : "medium",
  })),
  
  openActionsCount: data.openActionsCount || 0,
  
  topComplaints: (data.topComplaints || []).map((c) => ({
    category: c.category || c._id,
    count: c.count,
    trend: c.trend || "stable",
  })),
  
  topPraises: data.topPraises || [],
});

// ============================================================================
// 🛠️ Helper Functions
// ============================================================================

/**
 * Calculate NPS from trend array
 */
const calculateNpsFromTrend = (npsTrend) => {
  if (!Array.isArray(npsTrend) || npsTrend.length === 0) return 0;
  const latest = npsTrend[npsTrend.length - 1];
  return latest?.score || latest?.value || 0;
};

/**
 * Extract NPS trend data values
 */
const extractNpsTrendData = (npsTrend) => {
  if (!Array.isArray(npsTrend)) return [];
  return npsTrend.map((item) => item.score || item.value || item);
};

/**
 * Extract NPS trend labels
 */
const extractNpsTrendLabels = (npsTrend) => {
  if (!Array.isArray(npsTrend)) return null;
  return npsTrend.map((item) => item.label || item.date || "");
};

/**
 * Generate week labels
 */
const generateWeekLabels = (count) => {
  return Array.from({ length: count }, (_, i) => `Week ${i + 1}`);
};

/**
 * Count alerts by type from feedback array
 */
const countAlertsByType = (feedbackArray, type) => {
  if (!Array.isArray(feedbackArray)) return 0;
  
  if (type === "critical") {
    return feedbackArray.filter((f) => f.sentiment === "negative").length;
  }
  if (type === "warning") {
    return feedbackArray.filter((f) => f.sentiment === "mixed").length;
  }
  return 0;
};

// ============================================================================
// 📦 Default Export
// ============================================================================
export default {
  getExecutiveDashboard,
  getOperationalDashboard,
  getDashboardStats,
  getRealTimeStats,
  getComprehensiveDashboard,
};
