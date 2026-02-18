// src\pages\Auth\ForgotPassword.jsx
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { MdEmail, MdArrowBack, MdSend } from "react-icons/md"
import AuthLayout from "../../layouts/AuthLayout"
import axiosInstance from "../../api/axiosInstance"

const inputClass = `w-full px-3 py-2.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                    bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                    transition-all duration-200 text-base disabled:opacity-60`

const labelClass = "block text-sm font-medium mb-1.5 text-[var(--light-text)] dark:text-[var(--dark-text)]"

const ForgotPassword = ({ darkMode }) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setMessage("")
      setError("")
      setLoading(true)

      const res = await axiosInstance.post("/auth/forgotpassword", { email });
      console.log("Response: ", res.data);

      localStorage.setItem("resetEmail", email)
      navigate("/enter-reset-code")
    } catch (error) {
      setError(error.response?.data.message || "Failed to reset password")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Rate Pro"
      subtitle="Reset your password"
      icon={<MdEmail className="text-white" size={32} />}
      footer={
        <div className="text-center mt-4">
          <p className="text-[var(--secondary-color)] text-sm mb-0">
            Need help? Contact our{" "}
            <Link to="/support" className="text-[var(--primary-color)] hover:underline no-underline">
              support team
            </Link>
          </p>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={loading}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-[var(--secondary-color)]">
            We'll send you a link to reset your password.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-base font-medium rounded-lg flex items-center justify-center gap-2
                     bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white
                     transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <MdSend />
              Reset Password
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-4">
        <Link
          to="/login"
          className="text-[var(--primary-color)] hover:underline no-underline inline-flex items-center gap-1"
        >
          <MdArrowBack size={16} />
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword
