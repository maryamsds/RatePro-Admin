/**
 * Platform Service
 * 
 * API calls for System Admin platform-level operations.
 */

import axiosInstance from '../axiosInstance';

/**
 * Get platform-wide dashboard statistics
 * @returns {Promise} Platform statistics
 */
export const getPlatformDashboard = async () => {
    const response = await axiosInstance.get('/platform/dashboard');
    return response.data;
};

export default {
    getPlatformDashboard
};
