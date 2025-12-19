// import { createContext, useContext, useState, useEffect } from "react";
// import axiosInstance from "../api/axiosInstance";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkAuth = async () => {
//       const hasAuthUser = localStorage.getItem("authUser");

//       if (!hasAuthUser) {
//         setUser(null);
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await axiosInstance.get("/auth/me", { withCredentials: true });
//         // console.log("checkAuth: User data fetched", res.data.user);
//         setUser(res.data.user);
//       } catch (err) {
//         console.error("checkAuth error:", err);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   const login = async (email, password) => {
//     try {
//       await axiosInstance.post("/auth/login", { email, password, source: "admin" }, { withCredentials: true });
//       const res = await axiosInstance.get("/auth/me", { withCredentials: true });
//       console.log("login: User data fetched", res.data.user);
//       setUser(res.data.user);
//       localStorage.setItem("authUser", JSON.stringify(res.data.user));
//       return true;
//     } catch (err) {
//       console.error("Login error:", err);
//       return false;
//     }
//   };

//   const hasPermission = (permissionName) => {
//     if (!user) {
//       return false;
//     }
//     for (const role of user.customRoles || []) {  
//       if (
//         role.permissions?.some((p) => {
//           if (typeof p === "string") {
//             return p === permissionName;
//           } else if (typeof p === "object") {
//             return p.name === permissionName;
//           }
//           return false;
//         })
//       ) {
//         return true;
//       }
//     }
//     return false;
//   };

//   const logout = async () => {
//     try {
//       await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
//       localStorage.removeItem("authUser");
//       setUser(null);
//     } catch (err) {
//       console.error("Logout error:", err);
//     }
//   };

//   const updateCompanyInfo = (updatedTenant) => {
//     setUser((prev) => {
//       if (!prev) return prev;
//       return {
//         ...prev,
//         tenant: {
//           ...prev.tenant,
//           ...updatedTenant,
//         },
//       };
//     });
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, setUser, updateCompanyInfo, hasPermission, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // const [user, setUser] = useState(null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 👇 Separate loaders
  const [authLoading, setAuthLoading] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    const savedParsed = savedUser ? JSON.parse(savedUser) : null;
    const savedAccessToken = savedParsed?.accessToken;

    if (savedAccessToken) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${savedAccessToken}`;
    }
    
    const checkAuth = async () => {
      const hasAuthUser = localStorage.getItem("authUser");

      if (!hasAuthUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get("/auth/me", { withCredentials: true });
        const userWithToken = { ...res.data.user, accessToken: savedAccessToken };
        setUser(userWithToken);
        localStorage.setItem("authUser", JSON.stringify(userWithToken));
      } catch (err) {
        console.error("❌ Startup auth failed:", err);
        setUser(null);
        localStorage.removeItem("authUser");
        // Try refresh token
        try {
          const refreshRes = await axiosInstance.post("/auth/refresh", {}, { withCredentials: true });
          const newAccessToken = refreshRes.data.accessToken;
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

          const res = await axiosInstance.get("/auth/me", { withCredentials: true });
          const refreshedUser = { ...res.data.user, accessToken: newAccessToken };
          setUser(refreshedUser);
          localStorage.setItem("authUser", JSON.stringify(refreshedUser));
        } catch (refreshErr) {
          console.error("Refresh token failed:", refreshErr);
          // Logout if refresh also fails
          setUser(null);
          localStorage.removeItem("authUser");
        }
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [])

  const login = async (email, password) => {
    try {
      const loginRes = await axiosInstance.post("/auth/login", { email, password, source: "admin" }, { withCredentials: true });
      const accessToken = loginRes.data.accessToken; // agar backend yeh bhejta hai
      if (accessToken) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      }
      const res = await axiosInstance.get("/auth/me", { withCredentials: true });
      const userWithToken = { ...res.data.user, accessToken };
      setUser(userWithToken);
      localStorage.setItem("authUser", JSON.stringify(userWithToken));
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const hasPermission = (permissionName) => {
    if (!user) return false;
    for (const role of user.customRoles || []) {
      if (
        role.permissions?.some((p) => {
          if (typeof p === "string") return p === permissionName;
          if (typeof p === "object") return p.name === permissionName;
          return false;
        })
      ) {
        return true;
      }
    }
    return false;
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      localStorage.removeItem("authUser");
      setUser(null);
      delete axiosInstance.defaults.headers.common['Authorization'];
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const updateCompanyInfo = (updatedTenant) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tenant: {
          ...prev.tenant,
          ...updatedTenant,
        },
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        setUser,
        updateCompanyInfo,
        hasPermission,
        authLoading,      // 👈 only for startup/auth check
        globalLoading,    // 👈 for overlay loader
        setGlobalLoading, // 👈 allow components to control global loader
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
