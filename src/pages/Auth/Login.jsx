// src\pages\Auth\Login.jsx
import { useState } from "react"
import { Form, Button, Alert } from "react-bootstrap"
import { useNavigate, Link } from "react-router-dom"
import { FaEye, FaEyeSlash, FaSignInAlt } from "react-icons/fa"
import axiosInstance from "../../api/axiosInstance"
import AuthLayout from "../../layouts/AuthLayout"
import { useAuth } from "../../context/AuthContext"
import Swal from "sweetalert2"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await axiosInstance.post("/auth/login", {
        email,
        password,
        source: "admin",
      });

      const user = data?.user;
      if (!user) {
        // Server ne 2xx diya lekin expected shape nahi mila
        throw new Error(data?.message || "Malformed server response");
      }

      // ✅ Active check
      if (!user.isActive) {
        Swal.fire({
          icon: "error",
          title: "Account Inactive",
          text: "Your account is currently inactive. Please contact the administrator.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      // ✅ Email verification check (DB flag)
      if (!user.isVerified) {
        Swal.fire({
          icon: "info",
          title: "Email Not Verified",
          text:
            "Your email is not verified. A verification link has been sent to your email. Kindly click the link to verify your account.",
          confirmButtonColor: "#0d6efd",
        });
        return;
      }

      // ✅ Save & redirect
      localStorage.setItem("authUser", JSON.stringify(user));
      setUser(user);

      if (user.role === "user") {
        window.location.href = "https://ratepro-public.vercel.app/";
      } else {
        navigate("/app");
      }
    } catch (err) {
      const status = err.response?.status;
      const rawMsg = err.response?.data?.message || err.message || "";
      const msg = rawMsg.toLowerCase();

      // 🟦 Email not verified (server ne error status bheja ho)
      if (
        msg.includes("login verification required") ||
        msg.includes("email not verified") ||
        msg.includes("verify your email") ||
        msg.includes("unverified")
      ) {
        Swal.fire({
          icon: "info",
          title: "Email Not Verified",
          text:
            "Your email is not verified. A verification link has been sent to your email. Kindly click the link to verify your account.",
          confirmButtonColor: "#0d6efd",
        });
        return;
      }

      // 🔴 User not found
      if (msg.includes("user not found")) {
        Swal.fire({
          icon: "error",
          title: "User Not Found",
          text:
            "No account found with this email. Please double-check or contact support.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      // 🔴 Invalid password
      if (msg.includes("invalid password")) {
        Swal.fire({
          icon: "error",
          title: "Invalid Password",
          text: "The password you entered is incorrect. Please try again.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      // 🟠 Rate limit / too many attempts
      if (status === 429) {
        Swal.fire({
          icon: "warning",
          title: "Too Many Attempts",
          text: "Please wait a moment before trying again.",
          confirmButtonColor: "#f0ad4e",
        });
        return;
      }

      // 🔧 Server-side issue
      if (status >= 500) {
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "We're having trouble on our end. Please try again later.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      // 🛑 General fallback
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: rawMsg || "Something went wrong. Please try again.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your RatePro account"
      icon={<FaSignInAlt className="text-white" size={28} />}
    >
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="position-absolute top-50 end-0 translate-middle-y pe-3"
              style={{ cursor: "pointer", color: "#6c757d", fontSize: "1.15rem" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check type="checkbox" label="Remember me" />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100 mb-3" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="text-center">
          <Link to="/forgot-password" className="text-decoration-none">
            Forgot your password?
          </Link>
        </div>
      </Form>
    </AuthLayout>
  )
}

export default Login