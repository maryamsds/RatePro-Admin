// /api/axiosInstance.js
// ========================================
// 📦 Axios Instance (Pro Version)
// ========================================
import axios from "axios";

// 🌐 Base Configuration
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================
// 🧭 Request Interceptor — Attach Token
// ========================================
axiosInstance.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        const { accessToken } = JSON.parse(storedUser);
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
      } catch (e) {
        console.warn("⚠️ Failed to parse authUser from localStorage:", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========================================
// 🔁 Response Interceptor — Refresh Token Logic
// ========================================
let isRefreshing = false;
let failedQueue = [];

// Helper to handle queued requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    console.groupCollapsed("📡 Axios Response Interceptor");
    console.log("URL:", originalRequest?.url);
    console.log("Method:", originalRequest?.method);
    console.log("Status:", status);
    console.log("Message:", message);
    console.groupEnd();

    // ✅ Handle Access Token Expiry (401)
    if (status === 401 && !originalRequest._retry) {
      // Agar refresh chal raha hai → queue me daal do
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 🚀 Refresh token request
        const refreshRes = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data.accessToken;

        // 🧠 Update Local Storage
        const oldUser = JSON.parse(localStorage.getItem("authUser") || "{}");
        const updatedUser = { ...oldUser, accessToken: newAccessToken };
        localStorage.setItem("authUser", JSON.stringify(updatedUser));

        // 🧠 Update axios headers
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // ⏳ Process failed queue
        processQueue(null, newAccessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("❌ Refresh Token Failed:", refreshError);

        const isInvalidToken =
          refreshError.response?.status === 401 &&
          (refreshError.response?.data?.message?.includes("Invalid refresh token") ||
            refreshError.response?.data?.message?.includes("No refresh token"));

        if (isInvalidToken) {
          localStorage.removeItem("authUser");
          window.location.href = "/login";
        }

        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ⚠️ Optional: Handle other statuses globally
    if (status === 403) {
      console.warn("🚫 Forbidden — User not authorized.");
    }

    if (status === 500) {
      console.error("💥 Server error:", message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// ------------------- Auth APIs -------------------
export const forgotPassword = ({ email }) =>
  axiosInstance.post("/auth/forgot-password", { email });

export const verifyResetCode = ({ email, code }) => {
  const payload = {
    email: email.trim(),
    code: code.trim(),
  };
  return axiosInstance.post("/auth/verify-reset-code", payload);
};

export const resetPassword = ({ email, code, newPassword }) =>
  axiosInstance.post("/auth/reset-password", { email, code, newPassword });

export const verifyEmail = ({ email, code }) =>
  axiosInstance.post("/auth/verify-email", { email, code });

export const getCurrentUser = () => axiosInstance.get("/auth/me", { withCredentials: true });

export const updateProfile = (data) =>
  axiosInstance.put("/users/me", data, { withCredentials: true });

export const updateUserProfile = (formData) =>
  axiosInstance.put("/auth/update-profile", formData, { withCredentials: true });

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return axiosInstance.put("/users/me", formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ------------------- User APIs -------------------
export const toggleUserActiveStatus = (userId) =>
  axiosInstance.put(`/users/toggle/${userId}`);

export const deleteUserById = (id) =>
  axiosInstance.delete(`/users/${id}`);

export const getUserById = (id) =>
  axiosInstance.get(`/users/${id}`);

export const updateUser = (id, data) =>
  axiosInstance.put(`/users/${id}`, data);

export const exportUserPDF = async (userId) => {
  if (!userId) throw new Error("User ID is required for export");
  return await axiosInstance.get(`/users/export/${userId}`, {
    responseType: "blob",
  });
};

export const sendUserNotification = (userId, subject, message) =>
  axiosInstance.post(`/users/notify/${userId}`, {
    subject,
    message,
  });

// ------------------- Company APIs -------------------
export const getCompanyById = (companyId) =>
  axiosInstance.get(`/api/company/${companyId}`);
