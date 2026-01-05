// src/api/services/analyticsService.js
// ============================================================================
// 📈 Analytics Service - API calls with response transformation
// ============================================================================
import axiosInstance from "../axiosInstance";

/**
 * Get survey analytics
 * @param {string} surveyId
 * @param {Object} params - { dateRange, startDate, endDate }
 * @returns {Promise<Object>}
 */
export const getSurveyAnalytics = async (surveyId, params = {}) => {
  const { dateRange = "30d", startDate, endDate } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append("range", dateRange);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);

  const response = await axiosInstance.get(`/surveys/${surveyId}/analytics?${queryParams.toString()}`);
  
  return transformSurveyAnalytics(response.data);
};

/**
 * Get tenant-wide analytics
 * @param {Object} params - { range }
 * @returns {Promise<Object>}
 */
export const getTenantAnalytics = async (params = {}) => {
  const { range = "30d" } = params;
  const response = await axiosInstance.get(`/analytics/tenant?range=${range}`);
  return response.data;
};

/**
 * Get analytics trends
 * @param {Object} params - { range }
 * @returns {Promise<Object>}
 */
export const getTrendsAnalytics = async (params = {}) => {
  const { range = "30d" } = params;
  const response = await axiosInstance.get(`/analytics/trends?range=${range}`);
  return transformTrendsData(response.data);
};

/**
 * Get real-time alerts
 * @returns {Promise<Array>}
 */
export const getAlerts = async () => {
  const response = await axiosInstance.get("/analytics/alerts");
  return transformAlerts(response.data.alerts || []);
};

// ============================================================================
// 🔄 Transform Functions
// ============================================================================

/**
 * Transform survey analytics response to frontend format
 */
const transformSurveyAnalytics = (data) => ({
  // Overview metrics
  overview: {
    totalResponses: data.totalResponses || 0,
    averageRating: data.averageRating || 0,
    completionRate: data.completionRate || 0,
    npsScore: data.nps?.score || data.npsScore || 0,
    responseRate: data.responseRate || 0,
    satisfactionScore: data.satisfactionScore || 0,
    benchmarkComparison: data.benchmarkComparison || 0,
  },
  
  // NPS breakdown
  nps: {
    score: data.nps?.score || 0,
    promoters: data.nps?.promoters || 0,
    passives: data.nps?.passives || 0,
    detractors: data.nps?.detractors || 0,
    trend: data.nps?.trend || 0,
  },
  
  // Trends data
  trends: {
    responsesByDate: transformTrendline(data.trendline || []),
    ratingTrends: data.ratingTrends || [],
    completionTrends: data.completionTrends || [],
    npsHistory: data.npsHistory || [],
  },
  
  // Demographics
  demographics: {
    byDevice: data.demographics?.byDevice || [],
    byLocation: data.demographics?.byLocation || [],
    byTimeOfDay: data.demographics?.byTimeOfDay || [],
    byDayOfWeek: data.demographics?.byDayOfWeek || [],
  },
  
  // Sentiment analysis
  sentiment: {
    breakdown: transformSentimentBreakdown(data.sentimentHeatmap || data.sentiment || {}),
    topKeywords: data.topKeywords || [],
    emotionalTrends: data.emotionalTrends || [],
    satisfactionDrivers: data.satisfactionDrivers || [],
  },
  
  // Question performance
  questions: {
    performance: data.questionPerformance || [],
    dropoffPoints: data.dropoffPoints || [],
    timeSpent: data.timeSpent || [],
    skipRates: data.skipRates || [],
  },
  
  // Feedback insights
  feedback: {
    topComplaints: data.topComplaints || [],
    topPraises: data.topPraises || [],
    urgentIssues: data.urgentIssues || [],
    actionableInsights: data.actionableInsights || [],
  },
});

/**
 * Transform trendline data for charts
 */
const transformTrendline = (trendline) => {
  if (!Array.isArray(trendline)) return [];
  
  return trendline.map((item) => ({
    date: item.date || item._id,
    count: item.count || item.responses || 0,
    avgRating: item.avgRating || 0,
  }));
};

/**
 * Transform sentiment heatmap to breakdown
 */
const transformSentimentBreakdown = (sentimentData) => {
  if (!sentimentData || typeof sentimentData !== "object") {
    return { positive: 0, negative: 0, neutral: 0 };
  }
  
  // If already in correct format
  if ("positive" in sentimentData) {
    return {
      positive: sentimentData.positive || 0,
      negative: sentimentData.negative || 0,
      neutral: sentimentData.neutral || 0,
    };
  }
  
  // Transform from heatmap format
  let positive = 0, negative = 0, neutral = 0;
  
  Object.values(sentimentData).forEach((value) => {
    if (typeof value === "object") {
      positive += value.positive || 0;
      negative += value.negative || 0;
      neutral += value.neutral || 0;
    }
  });
  
  return { positive, negative, neutral };
};

/**
 * Transform trends data
 */
const transformTrendsData = (data) => ({
  satisfactionTrend: {
    labels: data.satisfactionTrend?.labels || [],
    values: data.satisfactionTrend?.values || [],
  },
  volumeTrend: {
    labels: data.volumeTrend?.labels || [],
    surveys: data.volumeTrend?.surveys || [],
    responses: data.volumeTrend?.responses || [],
  },
  npsTrend: {
    labels: data.npsTrend?.labels || [],
    values: data.npsTrend?.values || [],
  },
  responseTrend: {
    labels: data.responseTrend?.labels || [],
    values: data.responseTrend?.values || [],
  },
});

/**
 * Transform alerts for frontend
 */
const transformAlerts = (alerts) => {
  if (!Array.isArray(alerts)) return [];
  
  return alerts.map((alert) => ({
    id: alert._id || alert.id,
    type: alert.type || "info",
    severity: alert.severity || alert.type,
    title: alert.title || alert.message,
    message: alert.message || alert.description,
    description: alert.description,
    timestamp: alert.createdAt || alert.timestamp,
    action: alert.action || alert.suggestedAction,
    location: alert.location,
    surveyId: alert.surveyId,
    isRead: alert.isRead || false,
    actionRequired: alert.actionRequired || alert.type === "critical",
  }));
};

// ============================================================================
// 📦 Default Export
// ============================================================================
export default {
  getSurveyAnalytics,
  getTenantAnalytics,
  getTrendsAnalytics,
  getAlerts,
};
