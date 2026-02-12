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
  const response = await axiosInstance.get(`/analytics/executive?range=${range}`);
  return transformExecutiveDashboard(response.data);
};

/**
 * Get operational dashboard data
 * @param {Object} params - { range }
 * @returns {Promise<Object>}
 */
export const getOperationalDashboard = async (params = {}) => {
  const { range = "30d" } = params;
  const response = await axiosInstance.get(`/analytics/operational?range=${range}`);
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
 * Backend /api/analytics/executive returns:
 * { success, data: { customerSatisfactionIndex, npsScore, responseRate, generatedAt } }
 */
const transformExecutiveDashboard = (data) => {
  // Backend wraps response in { success, data: {...} }
  const rawData = data?.data || data;

  // Extract KPIs from the new analytics endpoint structure
  const csi = rawData?.customerSatisfactionIndex || {};
  const nps = rawData?.npsScore || {};
  const rr = rawData?.responseRate || {};

  const kpis = {
    totalSurveys: rr.total || 0,
    totalResponses: rr.completed || 0,
    avgSatisfaction: csi.overall || 0,
    satisfactionIndex: Math.round((csi.overall || 0) * 20),
    npsScore: nps.current || 0,
    responseRate: rr.current || 0,
    completionRate: rr.completed > 0 ? 100 : 0,
    avgResponseTime: "-- min",
    averageRating: csi.overall || 0,
  };

  const trends = {
    satisfaction: {
      data: [csi.overall || 0],
      labels: ["Current"],
      change: csi.trend || 0,
    },
    nps: {
      data: [nps.detractors || 0, nps.passives || 0, nps.promoters || 0],
      labels: ["Detractors", "Passives", "Promoters"],
      change: nps.trend || 0,
    },
    responses: {
      data: rr.completed ? [rr.completed] : [],
      labels: ["Total Responses"],
      change: rr.trend || 0,
    },
  };

  return {
    kpis,
    trends,
    // Pass through backend data for components that need it
    customerSatisfactionIndex: csi,
    npsScore: nps,
    responseRate: rr,
    locations: csi.locations || [],
    topComplaints: [],
    topPraises: [],
    updatedAt: rawData?.generatedAt || new Date().toISOString(),
  };
};

/**
 * Transform operational dashboard response
 * Backend /api/analytics/operational returns:
 * { success, data: { alerts, slaMetrics, topComplaints, topPraises, generatedAt } }
 */
const transformOperationalDashboard = (data) => {
  const rawData = data?.data || data;

  return {
    alerts: rawData?.alerts || { critical: 0, warning: 0, info: 0 },

    slaMetrics: rawData?.slaMetrics || {
      averageResponseTime: "N/A",
      onTimeResolution: 0,
      overdueActions: 0,
    },

    topComplaints: (rawData?.topComplaints || []).map((c) => ({
      category: c.category || c._id,
      count: c.count,
      trend: c.trend || "stable",
    })),

    topPraises: (rawData?.topPraises || []).map((p) => ({
      category: p.category || p._id,
      count: p.count,
      trend: p.trend || "stable",
    })),

    generatedAt: rawData?.generatedAt || new Date().toISOString(),
  };
};

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
