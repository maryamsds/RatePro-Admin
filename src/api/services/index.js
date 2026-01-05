// src/api/services/index.js
// ============================================================================
// 📦 API Services - Centralized Export
// ============================================================================

// Survey Service
export { default as surveyService } from "./surveyService";
export * from "./surveyService";

// Analytics Service
export { default as analyticsService } from "./analyticsService";
export {
  getSurveyAnalytics,
  getTenantAnalytics,
  getTrendsAnalytics,
  getAlerts,
  getSurveySentiment,
  getSentimentHeatmap,
  getSurveySummary,
  getTenantSummary,
  getQuickSummary,
  getAllTrends,
  getSatisfactionTrend,
  getEngagementTrend,
  getSurveyResponses,
  getFlaggedResponses,
  exportResponsesCSV,
  exportAnalyticsPDF,
  downloadFile,
} from "./analyticsService";

// Dashboard Service
export { default as dashboardService } from "./dashboardService";
export * from "./dashboardService";

// Action Service
export { default as actionService } from "./actionService";
export * from "./actionService";

// Re-export axios instance
export { default as axiosInstance } from "../axiosInstance";
