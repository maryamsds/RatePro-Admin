import axiosInstance from "./axiosInstance";

// export const createUser = async (userData) => {
//   const response = await axiosInstance.post('/auth/register', {
//     ...userData,
//     source: 'admin'
//   });
//   return response.data;
// };

// export const createUser = (data) =>
//   axiosInstance.post("/users", data);

export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/users", userData);
    return response;
  } catch (error) {
    console.error("Create user error:", {
      status: error.response?.status,
      message: error.response?.data?.message,
    });
    throw error;
  }
};