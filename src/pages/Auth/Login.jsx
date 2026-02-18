// src\pages\Auth\Login.jsx
import { useState } from "react"
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
        throw new Error(data?.message || "Malformed server response");
      }

      if (!user.isActive) {
        Swal.fire({
          icon: "error",
          title: "Account Inactive",
          text: "Your account is currently inactive. Please contact the administrator.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      if (!user.isVerified) {
        Swal.fire({
          icon: "info",
          title: "Email Not Verified",
          text: "Your email is not verified. A verification link has been sent to your email. Kindly click the link to verify your account.",
          confirmButtonColor: "#0d6efd",
        });
        return;
      }

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

      if (
        msg.includes("login verification required") ||
        msg.includes("email not verified") ||
        msg.includes("verify your email") ||
        msg.includes("unverified")
      ) {
        Swal.fire({
          icon: "info",
          title: "Email Not Verified",
          text: "Your email is not verified. A verification link has been sent to your email. Kindly click the link to verify your account.",
          confirmButtonColor: "#0d6efd",
        });
        return;
      }

      if (msg.includes("user not found")) {
        Swal.fire({
          icon: "error",
          title: "User Not Found",
          text: "No account found with this email. Please double-check or contact support.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      if (msg.includes("invalid password")) {
        Swal.fire({
          icon: "error",
          title: "Invalid Password",
          text: "The password you entered is incorrect. Please try again.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      if (status === 429) {
        Swal.fire({
          icon: "warning",
          title: "Too Many Attempts",
          text: "Please wait a moment before trying again.",
          confirmButtonColor: "#f0ad4e",
        });
        return;
      }

      if (status >= 500) {
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "We're having trouble on our end. Please try again later.",
          confirmButtonColor: "#d33",
        });
        return;
      }

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
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm sm:text-base font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                       bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                       transition-all duration-200 text-base"
            style={{ minHeight: "44px" }}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm sm:text-base font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 pr-12 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                         bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                         transition-all duration-200 text-base"
              style={{ minHeight: "44px" }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center justify-center
                         cursor-pointer text-[var(--secondary-color)] text-lg w-11 h-11"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="remember-me"
            className="w-4 h-4 rounded border-[var(--light-border)] text-[var(--primary-color)]
                       focus:ring-[var(--primary-color)] cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 text-sm sm:text-base text-[var(--light-text)] dark:text-[var(--dark-text)] cursor-pointer">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mb-3 py-2.5 sm:py-3 text-base sm:text-lg font-medium rounded-lg
                     bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white
                     transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2"
          style={{ minHeight: "48px" }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="text-center">
          <Link to="/forgot-password" className="text-[var(--primary-color)] hover:underline text-sm sm:text-base no-underline">
            Forgot your password?
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Login