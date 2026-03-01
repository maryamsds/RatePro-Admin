// src/api/services/analyticsService.js
// ============================================================================
// 📈 Analytics Service - API calls with response transformation
// ============================================================================
import axiosInstance from "../axiosInstance";

// ============================================================================
// 📊 Survey Analytics
// ============================================================================

/**
 * Get survey analytics
 * @param {string} surveyId
 * @param {Object} params - { dateRange, startDate, endDate }
 * @returns {Promise<Object>}
 */
export const getSurveyAnalytics = async (surveyId, params = {}) => {
  const { dateRange = "30d", startDate, endDate } = params;

  const queryParams = new URLSearchParams();

  // Normalize dateRange for backend
  const rangeMap = {
    last7days: "7d",
    last30days: "30d",
    custom: "custom"
  };

  const normalizedRange = rangeMap[dateRange] || "30d";
  queryParams.append("range", normalizedRange);

  // Only send dates for custom range
  if (normalizedRange === "custom") {
    if (startDate && endDate) {
      queryParams.append("startDate", startDate.toISOString());
      queryParams.append("endDate", endDate.toISOString());
    } else {
      console.warn("Custom range selected but start/end dates missing");
    }
  }

  console.log(
    "Fetching survey analytics for:",
    surveyId,
    "with params:",
    queryParams.toString()
  );

  const response = await axiosInstance.get(
    `/analytics/${surveyId}?${queryParams.toString()}`
  );

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
// 🎭 Sentiment Analysis
// ============================================================================

/**
 * Get sentiment analysis for a survey
 * @param {string} surveyId
 * @param {Object} params - { range }
 * @returns {Promise<Object>}
 */
export const getSurveySentiment = async (surveyId, params = {}) => {
  const { range = "30d" } = params;
  const response = await axiosInstance.get(`/analytics/sentiment/${surveyId}?range=${range}`);
  return transformSentimentAnalysis(response.data);
};

/**
 * Get sentiment heatmap visualization data
 * @param {string} surveyId
 * @param {Object} params - { range, groupBy }
 * @returns {Promise<Object>}
 */
export const getSentimentHeatmap = async (surveyId, params = {}) => {
  const { range = "30d", groupBy = "day" } = params;
  const response = await axiosInstance.get(
    `/analytics/sentiment/${surveyId}/heatmap?range=${range}&groupBy=${groupBy}`
  );
  return transformSentimentHeatmap(response.data);
};

// ============================================================================
// 📋 Survey Summary & Insights
// ============================================================================

/**
 * Get comprehensive survey insights
 * @param {string} surveyId
 * @param {Object} params - { range }
 * @returns {Promise<Object>}
 */
export const getSurveySummary = async (surveyId, params = {}) => {
  const { range = "30d" } = params;
  const response = await axiosInstance.get(`/analytics/summary/${surveyId}?range=${range}`);
  return transformSurveySummary(response.data);
};

/**
 * Get tenant-wide dashboard summary
 * @param {Object} params - { range }
 * @returns {Promise<Object>}
 */
export const getTenantSummary = async (params = {}) => {
  const { range = "30d" } = params;
  const response = await axiosInstance.get(`/analytics/summary/tenant?range=${range}`);
  return transformTenantSummary(response.data);
};

/**
 * Get quick real-time widget data
 * @returns {Promise<Object>}
 */
export const getQuickSummary = async () => {
  const response = await axiosInstance.get("/analytics/summary/quick");
  return transformQuickSummary(response.data);
};

// ============================================================================
// 📈 Trends Analysis
// ============================================================================

/**
 * Get all trends in one call
 * @param {Object} params - { days: number (positive integer), surveyId?: string }
 * @returns {Promise<Object>}
 * @throws {Error} If days is not a positive integer
 */
export const getAllTrends = async (params = {}) => {
  const { days = 30, surveyId } = params;

  // Strict validation — prevent silent fallback when callers pass range strings
  if (!Number.isInteger(days) || days <= 0) {
    throw new Error(
      `getAllTrends requires a positive integer 'days' parameter. Received: ${JSON.stringify(days)}`
    );
  }

  const queryParams = new URLSearchParams({ days: String(days) });
  if (surveyId) queryParams.append("surveyId", surveyId);

  const response = await axiosInstance.get(`/analytics/trends/all?${queryParams.toString()}`);
  return transformAllTrends(response.data);
};

/**
 * Get satisfaction trends over time
 * @param {Object} params - { range, surveyId }
 * @returns {Promise<Object>}
 */
export const getSatisfactionTrend = async (params = {}) => {
  const { range = "30d", surveyId } = params;
  const queryParams = new URLSearchParams({ range });
  if (surveyId) queryParams.append("surveyId", surveyId);

  const response = await axiosInstance.get(`/analytics/trends/satisfaction?${queryParams.toString()}`);
  return transformSatisfactionTrend(response.data);
};

/**
 * Get engagement patterns (peak hours/days)
 * @param {Object} params - { range, surveyId }
 * @returns {Promise<Object>}
 */
export const getEngagementTrend = async (params = {}) => {
  const { range = "30d", surveyId } = params;
  const queryParams = new URLSearchParams({ range });
  if (surveyId) queryParams.append("surveyId", surveyId);

  const response = await axiosInstance.get(`/analytics/trends/engagement?${queryParams.toString()}`);
  return transformEngagementData(response.data);
};

// ============================================================================
// 📝 Response Analytics
// ============================================================================

/**
 * Get filtered response list for a survey
 * @param {string} surveyId
 * @param {Object} params - { page, limit, sentiment, rating, startDate, endDate, search }
 * @returns {Promise<Object>}
 */
export const getSurveyResponses = async (surveyId, params = {}) => {
  const {
    page = 1,
    limit = 20,
    sentiment,
    rating,
    startDate,
    endDate,
    search,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("page", page);
  queryParams.append("limit", limit);
  queryParams.append("sortBy", sortBy);
  queryParams.append("sortOrder", sortOrder);
  if (sentiment) queryParams.append("sentiment", sentiment);
  if (rating) queryParams.append("rating", rating);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  if (search) queryParams.append("search", search);

  const response = await axiosInstance.get(
    `/analytics/responses/${surveyId}?${queryParams.toString()}`
  );
  return transformResponseList(response.data);
};

/**
 * Get flagged (low-rating) responses across all surveys
 * @param {Object} params - { page, limit, threshold, range }
 * @returns {Promise<Object>}
 */
export const getFlaggedResponses = async (params = {}) => {
  const { page = 1, limit = 20, threshold = 3, range = "30d" } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("page", page);
  queryParams.append("limit", limit);
  queryParams.append("threshold", threshold);
  queryParams.append("range", range);

  const response = await axiosInstance.get(`/analytics/responses/flagged?${queryParams.toString()}`);
  return transformFlaggedResponses(response.data);
};

// ============================================================================
// 📤 Export Functions
// ============================================================================

/**
 * Export survey responses as CSV
 * @param {string} surveyId
 * @param {Object} params - { startDate, endDate, sentiment }
 * @returns {Promise<Blob>}
 */
export const exportResponsesCSV = async (surveyId, params = {}) => {
  const { startDate, endDate, sentiment } = params;

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  if (sentiment) queryParams.append("sentiment", sentiment);

  const response = await axiosInstance.get(
    `/analytics/responses/${surveyId}/export/csv?${queryParams.toString()}`,
    { responseType: "blob" }
  );

  // Extract filename from Content-Disposition header or generate one
  const contentDisposition = response.headers?.["content-disposition"];
  let filename = `survey_responses_${new Date().toISOString().split("T")[0]}.csv`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match) filename = match[1];
  }

  // Trigger the download
  downloadFile(response.data, filename);
  return { success: true, filename };
};

/**
 * Export survey analytics as PDF
 * @param {string} surveyId
 * @param {Object} params - { range }
 * @returns {Promise<Object>}
 */
export const exportAnalyticsPDF = async (surveyId, params = {}) => {
  const { range = "30d" } = params;

  const response = await axiosInstance.get(
    `/analytics/responses/${surveyId}/export/pdf?range=${range}`,
    { responseType: "blob" }
  );

  // Extract filename from Content-Disposition header or generate one
  const contentDisposition = response.headers?.["content-disposition"];
  let filename = `survey_analytics_${new Date().toISOString().split("T")[0]}.pdf`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match) filename = match[1];
  }

  // Trigger the download
  downloadFile(response.data, filename);
  return { success: true, filename };
};

/**
 * Download exported file
 * @param {Blob} blob
 * @param {string} filename
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ============================================================================
// 🔄 Transform Functions
// ============================================================================

/**
 * Transform survey analytics response to frontend format.
 * 
 * Backend returns ONLY: { nps, sentimentHeatmap, trendline, totalResponses }
 * We map exactly those fields — no phantom defaults.
 */
const transformSurveyAnalytics = (data) => {
  // Aggregate sentiment from heatmap array (visualization aggregation, not business logic)
  const heatmapArr = Array.isArray(data.sentimentHeatmap) ? data.sentimentHeatmap : [];
  let positive = 0, negative = 0, neutral = 0;
  heatmapArr.forEach(entry => {
    const s = (entry.sentiment || 'neutral').toLowerCase();
    if (s === 'positive') positive++;
    else if (s === 'negative') negative++;
    else neutral++;
  });
  const sentimentTotal = positive + negative + neutral;

  return {
    // Overview — only fields backend provides
    overview: {
      totalResponses: data.totalResponses || 0,
      npsScore: data.nps?.score ?? null,
    },

    // NPS breakdown — backend provides full object
    nps: {
      score: data.nps?.score ?? null,
      promoters: data.nps?.promoters || 0,
      passives: data.nps?.passives || 0,
      detractors: data.nps?.detractors || 0,
      total: data.nps?.total || 0,
    },

    // Trendline — backend: [{ date, count }]
    trends: {
      responsesByDate: transformTrendline(data.trendline || []),
    },

    // Sentiment — aggregated from heatmap for charts
    sentiment: {
      breakdown: {
        positive,
        negative,
        neutral,
      },
      percentages: {
        positive: sentimentTotal > 0 ? Math.round((positive / sentimentTotal) * 100) : 0,
        negative: sentimentTotal > 0 ? Math.round((negative / sentimentTotal) * 100) : 0,
        neutral: sentimentTotal > 0 ? Math.round((neutral / sentimentTotal) * 100) : 0,
      },
      total: sentimentTotal,
    },

    // Demographics placeholder — filled separately by lazy-loaded endpoint
    demographics: {
      byDevice: [],
      byLocation: [],
      byTimeOfDay: [],
      byDayOfWeek: [],
    },
  };
};

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

/**
 * Transform sentiment analysis response
 * Handles both direct data or wrapped in {success: true, data: {...}}
 */
const transformSentimentAnalysis = (response) => {
  // Unwrap from success response if needed
  const data = response?.data || response;

  return {
    surveyId: data.surveyId,
    surveyTitle: data.surveyTitle,
    totalResponses: data.totalResponses || 0,
    analyzedResponses: data.analyzedResponses || 0,

    // Overall sentiment breakdown
    breakdown: {
      positive: data.breakdown?.positive || data.positive || 0,
      negative: data.breakdown?.negative || data.negative || 0,
      neutral: data.breakdown?.neutral || data.neutral || 0,
    },

    // Percentages
    percentages: {
      positive: data.percentages?.positive || 0,
      negative: data.percentages?.negative || 0,
      neutral: data.percentages?.neutral || 0,
    },

    // Average sentiment score (-1 to 1)
    averageSentimentScore: data.averageSentimentScore || data.averageScore || 0,

    // Emotion distribution
    emotions: data.emotions || {
      joy: 0, frustration: 0, satisfaction: 0,
      disappointment: 0, anger: 0, gratitude: 0,
    },

    // Top keywords and themes
    topKeywords: (data.topKeywords || []).map(kw => ({
      word: kw.word || kw.keyword || kw,
      count: kw.count || kw.frequency || 0,
      sentiment: kw.sentiment || "neutral",
    })),

    topThemes: (data.topThemes || []).map(theme => ({
      name: theme.name || theme.theme || theme,
      count: theme.count || 0,
      sentiment: theme.sentiment || "neutral",
    })),

    // Trend over time
    trend: (data.trend || []).map(item => ({
      date: item.date || item._id,
      positive: item.positive || 0,
      negative: item.negative || 0,
      neutral: item.neutral || 0,
    })),
  };
};

/**
 * Transform sentiment heatmap for visualization
 */
const transformSentimentHeatmap = (data) => ({
  surveyId: data.surveyId,
  groupBy: data.groupBy || "day",

  // Heatmap data points
  data: (data.heatmap || data.data || []).map(item => ({
    period: item.period || item.date || item._id,
    hour: item.hour,
    dayOfWeek: item.dayOfWeek,
    positive: item.positive || 0,
    negative: item.negative || 0,
    neutral: item.neutral || 0,
    total: item.total || (item.positive + item.negative + item.neutral) || 0,
    dominantSentiment: item.dominantSentiment || getDominantSentiment(item),
  })),

  // Summary stats
  summary: {
    peakPositiveTime: data.summary?.peakPositiveTime || null,
    peakNegativeTime: data.summary?.peakNegativeTime || null,
    mostActiveDay: data.summary?.mostActiveDay || null,
    mostActiveHour: data.summary?.mostActiveHour || null,
  },
});

/**
 * Transform comprehensive survey summary
 * Handles both direct data or wrapped in {success: true, data: {...}}
 */
const transformSurveySummary = (response) => {
  // Unwrap from success response if needed
  const data = response?.data || response;

  return {
    surveyId: data.surveyId || data.survey?._id,
    surveyTitle: data.surveyTitle || data.survey?.title,
    status: data.status || data.survey?.status,
    createdAt: data.createdAt || data.survey?.createdAt,

    // Response metrics
    responses: {
      total: data.totalResponses || data.responses?.total || 0,
      completed: data.completedResponses || 0,
      partial: data.partialResponses || 0,
      completionRate: data.completionRate || 0,
      avgCompletionTime: data.avgCompletionTime || 0,
    },

    // Satisfaction metrics
    satisfaction: {
      averageRating: data.averageRating || data.metrics?.averageRating || 0,
      nps: data.nps || data.metrics?.nps || { score: 0, promoters: 0, passives: 0, detractors: 0 },
      csi: data.csi || data.metrics?.csi || 0,
      trend: data.satisfactionTrend || [],
    },

    // Sentiment analysis
    sentiment: transformSentimentBreakdown(data.sentiment || data.metrics?.sentiment || {}),
    sentimentScore: data.sentimentScore || data.metrics?.sentimentScore || 0,

    // Key insights
    insights: {
      topComplaints: data.topComplaints || data.insights?.topComplaints || [],
      topPraises: data.topPraises || data.insights?.topPraises || [],
      urgentIssues: data.urgentIssues || data.insights?.urgentIssues || [],
      actionableItems: data.actionableItems || data.insights?.actionableItems || [],
    },

    // Question breakdown
    questionAnalysis: (data.questionAnalysis || data.questions || []).map(q => ({
      questionId: q.questionId || q._id,
      questionText: q.questionText || q.text,
      questionType: q.questionType || q.type,
      responseCount: q.responseCount || q.responses || 0,
      avgRating: q.avgRating || null,
      distribution: q.distribution || [],
      topAnswers: q.topAnswers || [],
    })),

    // Actions generated
    actionsGenerated: data.actionsGenerated || 0,
    openActions: data.openActions || 0,
  };
};

/**
 * Transform tenant-wide summary
 * Maps backend structure: { overview, kpis, sentiment, trends, engagement, comparison }
 * to frontend expected structure
 */
const transformTenantSummary = (response) => {
  // Handle both direct data or wrapped in success response
  const data = response?.data || response;

  // Extract from nested backend structure
  const overview = data.overview || {};
  const kpis = data.kpis || {};
  const sentiment = data.sentiment || {};
  const trends = data.trends || {};
  const comparison = data.comparison || {};

  return {
    // Overall metrics (from overview)
    totalSurveys: overview.totalSurveys || data.totalSurveys || 0,
    activeSurveys: overview.activeSurveys || data.activeSurveys || 0,
    totalResponses: overview.totalResponses || data.totalResponses || 0,
    avgResponsesPerSurvey: kpis.responseRate?.avgPerSurvey || data.avgResponsesPerSurvey || 0,

    // Satisfaction metrics (from kpis)
    overallSatisfaction: kpis.csi?.current || data.overallSatisfaction || 0,
    overallNPS: kpis.nps?.current || data.overallNPS || 0,
    overallCSI: kpis.csi?.current || data.overallCSI || 0,

    // Sentiment overview
    sentiment: {
      positive: sentiment.positive || data.sentiment?.positive || 0,
      negative: sentiment.negative || data.sentiment?.negative || 0,
      neutral: sentiment.neutral || data.sentiment?.neutral || 0,
      avgRating: sentiment.avgRating || 0,
      avgScore: sentiment.avgScore || 0,
    },

    // Top performing surveys
    topSurveys: (data.topSurveys || []).map(s => ({
      id: s._id || s.id,
      title: s.title,
      responseCount: s.responseCount || s.totalResponses || 0,
      avgRating: s.avgRating || 0,
      nps: s.nps || 0,
    })),

    // Attention needed
    surveysNeedingAttention: (data.surveysNeedingAttention || []).map(s => ({
      id: s._id || s.id,
      title: s.title,
      issue: s.issue,
      severity: s.severity || "warning",
    })),

    // Trends (from trends object with volume array)
    trends: {
      responsesOverTime: (trends.volume || data.responsesOverTime || []).map(t => ({
        date: t.date,
        value: t.count || t.responses || t.value || 0,
      })),
      satisfactionOverTime: data.satisfactionOverTime || [],
      npsOverTime: data.npsOverTime || [],
      growth: trends.growth || 0,
      peakDate: trends.peakDate || null,
    },

    // Actions summary
    actions: {
      open: overview.actionsGenerated || data.openActions || 0,
      inProgress: data.inProgressActions || 0,
      resolved: data.resolvedActions || 0,
      overdue: data.overdueActions || 0,
    },

    // Comparison data
    comparison: {
      responseChange: comparison.responseChange || 0,
      ratingChange: comparison.ratingChange || 0,
      direction: comparison.direction || "stable",
    },

    // Engagement data
    engagement: data.engagement || {},

    // Period info
    period: data.period || {},
  };
};


/**
 * Transform quick summary for widgets
 */
const transformQuickSummary = (data) => ({
  // Real-time metrics
  todayResponses: data.todayResponses || 0,
  activeRespondents: data.activeRespondents || 0,
  avgRatingToday: data.avgRatingToday || 0,

  // Comparison with yesterday
  responsesChange: data.responsesChange || 0,
  ratingChange: data.ratingChange || 0,

  // Alerts
  criticalAlerts: data.criticalAlerts || 0,
  pendingActions: data.pendingActions || 0,

  // Quick stats
  completionRateToday: data.completionRateToday || 0,
  npsToday: data.npsToday || 0,

  // Last updated
  lastUpdated: data.lastUpdated || new Date().toISOString(),
});

/**
 * Transform all trends data
 * Maps backend structure: { satisfaction: { trend: [] }, volume: { trend: [] }, ... }
 * to frontend expected structure with labels/values arrays
 */
const transformAllTrends = (response) => {
  // Handle both direct data or wrapped in success response
  const data = response?.data || response;

  // Backend returns: satisfaction.trend, volume.trend, etc.
  const satisfaction = data.satisfaction || {};
  const volume = data.volume || {};
  const complaints = data.complaints || {};
  const engagement = data.engagement || {};

  // Extract trend arrays or use empty fallbacks
  const satisfactionTrend = satisfaction.trend || [];
  const volumeTrend = volume.trend || [];

  return {
    satisfaction: {
      labels: satisfactionTrend.map(t => t.date),
      values: satisfactionTrend.map(t => t.avgRating || t.avgScore || 0),
      average: satisfaction.summary?.overallAvgRating || 0,
      trend: "stable",
      change: 0,
    },
    volume: {
      labels: volumeTrend.map(t => t.date),
      responses: volumeTrend.map(t => t.count || t.responses || 0),
      surveys: volumeTrend.map(() => 0), // Not available in backend response
    },
    nps: {
      labels: [],
      scores: [],
      promoters: [],
      detractors: [],
    },
    sentiment: {
      labels: [],
      positive: [],
      negative: [],
      neutral: [],
    },
    engagement: transformEngagementData(engagement),
    complaints: {
      labels: (complaints.categories || []).map(c => c.category),
      counts: (complaints.categories || []).map(c => c.count || 0),
      categories: complaints.categories || [],
    },
  };
};


/**
 * Transform satisfaction trend data
 */
const transformSatisfactionTrend = (data) => ({
  labels: data.labels || [],
  values: data.values || data.scores || [],
  average: data.average || 0,
  trend: data.trend || "stable",
  change: data.change || 0,

  // Breakdown by question type if available
  byQuestionType: data.byQuestionType || [],
});

/**
 * Transform engagement patterns
 * Maps backend: { hourlyDistribution, dailyDistribution, peakEngagement, avgCompletionTime }
 */
const transformEngagementData = (data) => ({
  // Peak hours analysis - backend uses hourlyDistribution[]
  peakHours: (data.hourlyDistribution || data.peakHours || data.byHour || []).map(h => ({
    hour: h.hour ?? h._id,
    responses: h.count || h.responses || 0,
    avgRating: h.avgRating || 0,
  })),

  // Peak days analysis - backend uses dailyDistribution[]
  peakDays: (data.dailyDistribution || data.peakDays || data.byDay || []).map(d => ({
    day: d.day || d._id,
    dayName: d.name || getDayName(d.day || d._id),
    responses: d.count || d.responses || 0,
    avgRating: d.avgRating || 0,
  })),

  // Summary - backend uses peakEngagement object
  mostActiveHour: data.peakEngagement?.hourFormatted || data.mostActiveHour || null,
  mostActiveDay: data.peakEngagement?.day || data.mostActiveDay || null,
  avgSessionDuration: data.avgCompletionTime || data.avgSessionDuration || 0,
  peakResponseTime: data.peakResponseTime || null,
  totalResponses: data.totalResponses || 0,
});


/**
 * Transform response list
 */
const transformResponseList = (data) => ({
  responses: (data.responses || []).map(r => ({
    id: r._id || r.id,
    surveyId: r.survey?._id || r.surveyId,
    surveyTitle: r.survey?.title || r.surveyTitle,
    respondentEmail: r.respondent?.email || r.email,
    respondentName: r.respondent?.name || r.name,
    isAnonymous: r.isAnonymous || !r.respondent,

    // Response data
    completedAt: r.completedAt || r.createdAt,
    completionTime: r.completionTime || 0,
    status: r.status || "completed",

    // Analysis
    sentiment: r.analysis?.sentiment || r.sentiment || "neutral",
    sentimentScore: r.analysis?.sentimentScore || 0,
    rating: r.analysis?.avgRating || r.avgRating || null,

    // Flags
    isFlagged: r.isFlagged || false,
    flagReason: r.flagReason || null,

    // Quick preview
    previewText: r.analysis?.summary || r.previewText || "",
    keywords: r.analysis?.keywords || [],
  })),

  pagination: {
    page: data.page || 1,
    limit: data.limit || 20,
    total: data.total || 0,
    totalPages: data.totalPages || Math.ceil((data.total || 0) / (data.limit || 20)),
  },

  // Aggregated stats
  stats: {
    total: data.total || 0,
    positive: data.positiveCount || 0,
    negative: data.negativeCount || 0,
    neutral: data.neutralCount || 0,
    avgRating: data.avgRating || 0,
  },
});

/**
 * Transform flagged responses
 */
const transformFlaggedResponses = (data) => ({
  responses: (data.responses || data.flaggedResponses || []).map(r => ({
    id: r._id || r.id,
    surveyId: r.survey?._id || r.surveyId,
    surveyTitle: r.survey?.title || r.surveyTitle,

    // Respondent info
    respondent: r.respondent || null,
    isAnonymous: r.isAnonymous || !r.respondent,

    // Flag details
    flagReason: r.flagReason || r.reason || "Low rating",
    flaggedAt: r.flaggedAt || r.createdAt,
    severity: r.severity || getSeverityFromRating(r.avgRating),

    // Analysis
    sentiment: r.analysis?.sentiment || r.sentiment || "negative",
    rating: r.analysis?.avgRating || r.avgRating || 0,
    summary: r.analysis?.summary || r.summary || "",

    // Action status
    hasAction: r.hasAction || false,
    actionId: r.actionId || null,
    actionStatus: r.actionStatus || null,
  })),

  pagination: {
    page: data.page || 1,
    limit: data.limit || 20,
    total: data.total || 0,
    totalPages: data.totalPages || Math.ceil((data.total || 0) / (data.limit || 20)),
  },

  // Summary
  summary: {
    totalFlagged: data.total || 0,
    byReason: data.byReason || [],
    bySeverity: data.bySeverity || { critical: 0, high: 0, medium: 0, low: 0 },
    withActions: data.withActions || 0,
    withoutActions: data.withoutActions || 0,
  },
});

// ============================================================================
// 🛠️ Helper Functions
// ============================================================================

/**
 * Get dominant sentiment from counts
 */
const getDominantSentiment = (item) => {
  const { positive = 0, negative = 0, neutral = 0 } = item;
  if (positive >= negative && positive >= neutral) return "positive";
  if (negative >= positive && negative >= neutral) return "negative";
  return "neutral";
};

/**
 * Get day name from day number (0-6)
 */
const getDayName = (dayNum) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayNum] || dayNum;
};

/**
 * Get severity level from rating
 */
const getSeverityFromRating = (rating) => {
  if (rating <= 1) return "critical";
  if (rating <= 2) return "high";
  if (rating <= 3) return "medium";
  return "low";
};

// ============================================================================
// 📊 Demographics Analytics
// ============================================================================

/**
 * Get response demographics breakdown
 * @param {Object} params - { days, surveyId }
 * @returns {Promise<Object>}
 */
export const getDemographics = async (params = {}) => {
  const { days = 30, surveyId } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("days", days);
  if (surveyId) queryParams.append("surveyId", surveyId);

  const response = await axiosInstance.get(`/analytics/demographics?${queryParams.toString()}`);
  return response.data.data;
};

/**
 * Get survey-specific demographics
 * @param {string} surveyId
 * @param {Object} params - { days }
 * @returns {Promise<Object>}
 */
export const getSurveyDemographics = async (surveyId, params = {}) => {
  const { days = 30 } = params;

  const response = await axiosInstance.get(`/analytics/demographics/${surveyId}?days=${days}`);
  return response.data.data;
};

// ============================================================================
// 📦 Default Export
// ============================================================================
export default {
  // Survey analytics
  getSurveyAnalytics,
  getTenantAnalytics,
  getTrendsAnalytics,
  getAlerts,

  // Sentiment
  getSurveySentiment,
  getSentimentHeatmap,

  // Summary
  getSurveySummary,
  getTenantSummary,
  getQuickSummary,

  // Trends
  getAllTrends,
  getSatisfactionTrend,
  getEngagementTrend,

  // Demographics
  getDemographics,
  getSurveyDemographics,

  // Responses
  getSurveyResponses,
  getFlaggedResponses,

  // Export
  exportResponsesCSV,
  exportAnalyticsPDF,
  downloadFile,
};
