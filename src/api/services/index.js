// src/api/services/index.js
// ============================================================================
// 📦 API Services - Centralized Export
// ============================================================================

// Survey Service
export { default as surveyService } from "./surveyService";
export * from "./surveyService";

// Analytics Service
export { default as analyticsService } from "./analyticsService";
export * from "./analyticsService";

// Dashboard Service
export { default as dashboardService } from "./dashboardService";
export * from "./dashboardService";

// Action Service
export { default as actionService } from "./actionService";
export * from "./actionService";

// Re-export axios instance
export { default as axiosInstance } from "../axiosInstance";
