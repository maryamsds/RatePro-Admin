// import { Navigate } from "react-router-dom"
// import { useAuth } from "../context/AuthContext"

// const ProtectedRoute = ({ children }) => {
//   const { user } = useAuth()

//   if (!user) {
//     return <Navigate to="/login" />
//   }

//   return children
// }

// export default ProtectedRoute

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FullScreenLoader from "../Loader/FullScreenLoader";

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <FullScreenLoader />; 
    // <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
