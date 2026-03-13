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
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Validation state
  const [emailError, setEmailError] = useState("")
  const [emailTouched, setEmailTouched] = useState(false)

  const navigate = useNavigate()
  const { setUser } = useAuth()

  // --- Email validation ---
  const validateEmail = (value) => {
    if (!value) return "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address"
    return ""
  }

  const handleEmailChange = (e) => {
    const val = e.target.value
    setEmail(val)
    if (emailTouched) setEmailError(validateEmail(val))
  }

  const handleEmailBlur = () => {
    setEmailTouched(true)
    setEmailError(validateEmail(email))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation before submit
    const emailErr = validateEmail(email)
    setEmailTouched(true)
    setEmailError(emailErr)
    if (emailErr) return

    setLoading(true);
    setError("");

    try {
      const { data } = await axiosInstance.post("/auth/login", {
        email,
        password,
        source: "admin",
        rememberMe,
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

      if (status === 423) {
        Swal.fire({
          icon: "warning",
          title: "Account Locked",
          text: rawMsg || "Too many failed attempts. Your account is temporarily locked. Please try again later.",
          confirmButtonColor: "#f0ad4e",
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

  const hasEmailError = emailTouched && emailError

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your RatePro account"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <div className="mb-4">
          <label
            htmlFor="login-email"
            className="block text-sm sm:text-base font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]"
          >
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            required
            aria-invalid={hasEmailError ? "true" : undefined}
            aria-describedby={hasEmailError ? "email-error" : undefined}
            className={`w-full px-3 py-2.5 rounded-lg border
                       ${hasEmailError
                         ? "border-red-400 dark:border-red-500 focus:ring-red-400"
                         : "border-[var(--light-border)] dark:border-[var(--dark-border)] focus:ring-[var(--primary-color)]"
                       }
                       bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                       focus:outline-none focus:ring-2 focus:border-transparent
                       transition-all duration-200 text-base`}
            style={{ minHeight: "44px" }}
          />
          {hasEmailError && (
            <p id="email-error" role="alert" className="mt-1 text-sm text-red-500 dark:text-red-400">
              {emailError}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label
            htmlFor="login-password"
            className="block text-sm sm:text-base font-medium mb-2 text-[var(--light-text)] dark:text-[var(--dark-text)]"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-describedby="password-hint"
              className="w-full px-3 py-2.5 pr-12 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                         bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                         transition-all duration-200 text-base"
              style={{ minHeight: "44px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center justify-center
                         cursor-pointer text-[var(--secondary-color)] text-lg w-11 h-11
                         bg-transparent border-none hover:text-[var(--primary-color)] transition-colors"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p id="password-hint" className="mt-1.5 text-xs text-[var(--secondary-color)]">
            Min. 8 characters with uppercase, lowercase, number & special character
          </p>
        </div>

        {/* Remember Me */}
        <div className="mb-4 flex flex-col gap-1">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--light-border)] text-[var(--primary-color)]
                         focus:ring-[var(--primary-color)] cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm sm:text-base text-[var(--light-text)] dark:text-[var(--dark-text)] cursor-pointer">
              Remember me
            </label>
          </div>
          <p className="ml-6 text-xs text-[var(--secondary-color)]">
            Keep me logged in for 7 days on this device.
          </p>
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