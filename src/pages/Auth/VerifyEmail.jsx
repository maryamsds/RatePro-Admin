// import { useEffect } from "react"
// import { useSearchParams, useNavigate } from "react-router-dom"
// import axios from "axios"
// import Swal from "sweetalert2"

// const VerifyEmail = () => {
//   const [searchParams] = useSearchParams()
//   const code = searchParams.get("code") // <- fixed name here
//   const email = searchParams.get("email")
//   const navigate = useNavigate()

//   useEffect(() => {
//     const verify = async () => {
//       try {
//         const res = await axios.post("http://localhost:5000/api/auth/verify-email", { code, email }) // <- send correct keys
//         Swal.fire("✅ Verified!", res.data.message, "success")
//         navigate("/app")
//       } catch (error) {
//         Swal.fire("❌ Verification Failed", error.response?.data?.message || "Something went wrong", "error")
//       }
//     }

//     if (code && email) {
//       verify()
//     }
//   }, [code, email, navigate])

//   return (
//     <div className="text-center mt-5">
//       <h2>Verifying your email...</h2>
//     </div>
//   )
// }

// export default VerifyEmail

import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const email = searchParams.get("email");
  const isLogin = searchParams.get("login"); // "true" if from login
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const verify = async () => {
      try {
        // ✅ Email verification API call
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/verify-email`,
          { code, email },
          { withCredentials: true }
        );
  
        Swal.fire("✅ Email Verified!", "Your email has been successfully verified.", "success");
  
        const { user } = res.data;
        console.log(user)
        localStorage.setItem("authUser", JSON.stringify(user));
        setUser(user);
  
        // ✅ Redirect to app
        navigate("/app");
  
      } catch (error) {
        Swal.fire(
          "❌ Verification Failed",
          error.response?.data?.message || "Verification link is invalid or expired.",
          "error"
        );
      }
    };
  
    // Run verification only if we have code and email in URL
    if (code && email) {
      verify();
    }
  }, [code, email, navigate, setUser]);
 
  return (
    <div className="text-center mt-5">
      <h2>Verifying your email...</h2>
    </div>
  );
};

export default VerifyEmail;