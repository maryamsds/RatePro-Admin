// src\pages\Auth\EnterResetCode.jsx
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { MdVpnKey } from "react-icons/md"
import axiosInstance from "../../api/axiosInstance"

const inputClass = `w-full px-3 py-2.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                    bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                    transition-all duration-200 text-base`

const EnterResetCode = () => {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const email = localStorage.getItem("resetEmail")
      const otp = code.toString()

      console.log("Sending data", { email, otp });

      const res = await axiosInstance.post("/auth/verify-reset-code", {
        email,
        otp
      })

      // Save verified OTP for reset-password
      localStorage.setItem("resetOTP", code.toString());
      localStorage.setItem("isResetVerified", "true")
      navigate("/reset-password")
    } catch (error) {
      setError(error.response?.data.message || "Invalid reset code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Reset code sent to your email!")
    } catch {
      setError("Failed to resend code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-4 px-3
                    bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-lg border-0 overflow-hidden
                        bg-[var(--light-card)] dark:bg-[var(--dark-card)]">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[var(--primary-color)] flex items-center justify-center mx-auto mb-3">
                <MdVpnKey className="text-white" size={32} />
              </div>
              <h1 className="text-xl font-bold mb-1 text-[var(--primary-color)]">Enter Reset Code</h1>
              <p className="text-[var(--secondary-color)] text-sm mb-0">We've sent a 6-digit code to your email</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="resetCode" className="block text-sm font-medium mb-1.5 text-[var(--light-text)] dark:text-[var(--dark-text)]">
                  Reset Code
                </label>
                <input
                  id="resetCode"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  autoFocus
                  className={`${inputClass} text-center text-2xl tracking-[0.3em]`}
                />
                <p className="mt-1.5 text-xs text-[var(--secondary-color)]">Check your inbox for the code</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mb-3 py-2.5 text-base font-medium rounded-lg
                           bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white
                           transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            {/* Footer links */}
            <div className="text-center mt-4">
              <p className="mb-2 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)]">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={loading}
                  className="text-[var(--primary-color)] hover:underline font-medium bg-transparent border-0 cursor-pointer p-0 disabled:opacity-60"
                >
                  Resend Code
                </button>
              </p>
              <Link to="/forgot-password" className="text-[var(--secondary-color)] hover:underline text-sm no-underline">
                Back to Forgot Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnterResetCode