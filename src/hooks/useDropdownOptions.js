/**
 * useDropdownOptions Hook
 * 
 * Custom hook for fetching and caching dropdown options from the settings API.
 * Returns options for a specific dropdown type with loading/error states.
 * 
 * Usage:
 * const { options, loading, error, refresh } = useDropdownOptions('industry');
 */

import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

// Cache for dropdown options to avoid repeated API calls
const optionsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useDropdownOptions = (type, { useCache = true } = {}) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOptions = useCallback(async (forceRefresh = false) => {
        if (!type) {
            setOptions([]);
            setLoading(false);
            return;
        }

        // Check cache first
        if (useCache && !forceRefresh) {
            const cached = optionsCache.get(type);
            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                setOptions(cached.data);
                setLoading(false);
                return;
            }
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get(`/settings/dropdowns/${type}`);

            if (response.data.success) {
                const fetchedOptions = response.data.options || [];
                setOptions(fetchedOptions);

                // Update cache
                optionsCache.set(type, {
                    data: fetchedOptions,
                    timestamp: Date.now(),
                });
            } else {
                throw new Error(response.data.message || 'Failed to fetch options');
            }
        } catch (err) {
            console.error(`Error fetching ${type} dropdown options:`, err);
            setError(err.message || 'Failed to load dropdown options');
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, [type, useCache]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    // Transform options to select-friendly format
    const selectOptions = options.map(opt => ({
        value: opt.key,
        label: opt.label,
        color: opt.color,
        icon: opt.icon,
        ...opt,
    }));

    return {
        options,           // Raw options from API
        selectOptions,     // Transformed for use in Select components
        loading,
        error,
        refresh: () => fetchOptions(true), // Force refresh
    };
};

/**
 * Clear the dropdown options cache
 * Useful when options are updated via admin
 */
export const clearDropdownCache = (type = null) => {
    if (type) {
        optionsCache.delete(type);
    } else {
        optionsCache.clear();
    }
};

export default useDropdownOptions;
