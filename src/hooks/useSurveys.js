// src/hooks/useSurveys.js
// ============================================================================
// Centralized survey-list hook — replaces 4× duplicate fetchSurveys() logic
// ============================================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

// Simple in-memory cache to avoid refetching on every page mount
let _cachedSurveys = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

/**
 * Centralized hook for fetching and selecting surveys.
 *
 * @param {Object} options
 * @param {string}  [options.initialSurveyId]  - Pre-select this survey on mount
 * @param {boolean} [options.autoSelect=true]   - Auto-select first survey if none specified
 * @returns {{ surveys, selectedSurvey, setSelectedSurvey, loading, error, refetch }}
 */
const useSurveys = ({ initialSurveyId, autoSelect = true } = {}) => {
    const [surveys, setSurveys] = useState(_cachedSurveys || []);
    const [selectedSurvey, setSelectedSurvey] = useState(initialSurveyId || "");
    const [loading, setLoading] = useState(!_cachedSurveys);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);

    // Read ?surveyId= from URL if present (deep-link support)
    const [searchParams] = useSearchParams();
    const urlSurveyId = searchParams.get("surveyId");

    const fetchSurveys = useCallback(async (forceRefresh = false) => {
        // Return cache if fresh and not force-refreshing
        const now = Date.now();
        if (!forceRefresh && _cachedSurveys && now - _cacheTimestamp < CACHE_TTL_MS) {
            setSurveys(_cachedSurveys);
            setLoading(false);
            return _cachedSurveys;
        }

        // Cancel any in-flight request
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get("/surveys", {
                signal: abortRef.current.signal,
            });

            if (response.data.success) {
                const surveyList = response.data.data || response.data.surveys || [];

                // Update cache
                _cachedSurveys = surveyList;
                _cacheTimestamp = Date.now();

                setSurveys(surveyList);
                return surveyList;
            }

            setSurveys([]);
            return [];
        } catch (err) {
            if (err.name === "CanceledError" || err.name === "AbortError") return;
            setError("Failed to load surveys");
            setSurveys([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        fetchSurveys().then((list) => {
            if (!list || list.length === 0) return;

            // Priority: URL param > initialSurveyId > autoSelect first
            const targetId = urlSurveyId || initialSurveyId;
            if (targetId && list.some((s) => s._id === targetId)) {
                setSelectedSurvey(targetId);
            } else if (autoSelect && !selectedSurvey) {
                setSelectedSurvey(list[0]._id);
            }
        });
        // No cleanup abort — fetchSurveys() handles stale-request cancellation internally.
        // Aborting on unmount causes "canceled" logs in React 18 Strict Mode (double mount).
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        surveys,
        selectedSurvey,
        setSelectedSurvey,
        loading,
        error,
        refetch: () => fetchSurveys(true),
    };
};

/**
 * Invalidate the survey cache (call after creating/deleting surveys)
 */
export const invalidateSurveyCache = () => {
    _cachedSurveys = null;
    _cacheTimestamp = 0;
};

export default useSurveys;
