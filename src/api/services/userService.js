// src/api/services/userService.js
// ============================================================================
// 👤 User Service - API calls for user operations
// ============================================================================
import axiosInstance from "../axiosInstance";

/**
 * Get tenant users for picker dropdown
 * @param {Object} params - { search, role, limit }
 * @returns {Promise<Array>}
 */
export const getTenantUsersForPicker = async (params = {}) => {
    const { search, role, limit = 50 } = params;

    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (role && role !== "all") queryParams.append("role", role);
    queryParams.append("limit", limit);

    const response = await axiosInstance.get(`/users/picker?${queryParams.toString()}`);
    return response.data?.users || [];
};

/**
 * Get current user info
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data?.user || response.data;
};

export default {
    getTenantUsersForPicker,
    getCurrentUser,
};
