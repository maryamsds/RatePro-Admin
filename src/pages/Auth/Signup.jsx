// src\pages\Auth\Signup.jsx
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa"
import AuthLayout from "../../layouts/AuthLayout"
import axiosInstance from "../../api/axiosInstance"

const inputClass = `w-full px-3 py-2.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                    bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                    transition-all duration-200 text-base`

const labelClass = "block text-sm font-medium mb-1.5 text-[var(--light-text)] dark:text-[var(--dark-text)]"

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions")
      setLoading(false)
      return
    }

    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      }

      await axiosInstance.post("/auth/register", userData)
      alert("Account created successfully. Check your email for verification.")
      navigate("/login")
    } catch (err) {
      setError(err.response?.data.message || "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join RatePro and start creating surveys"
      icon={<FaUserPlus className="text-white" size={28} />}
      footer={
        <>
          <span className="text-[var(--secondary-color)]">Already have an account? </span>
          <Link to="/login" className="text-[var(--primary-color)] hover:underline no-underline">Sign in</Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={labelClass}>First Name</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={inputClass} />
        </div>

        <div className="mb-4">
          <label className={labelClass}>Last Name</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className={inputClass} />
        </div>

        <div className="mb-4">
          <label className={labelClass}>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
        </div>

        <div className="mb-4">
          <label className={labelClass}>Company (Optional)</label>
          <input type="text" name="company" value={formData.company} onChange={handleChange} className={inputClass} />
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <label className={labelClass}>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`${inputClass} pr-12`}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-[38px] right-3 cursor-pointer text-[var(--secondary-color)] text-lg"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="mb-4 relative">
          <label className={labelClass}>Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={`${inputClass} pr-12`}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-[38px] right-3 cursor-pointer text-[var(--secondary-color)] text-lg"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            name="agreeToTerms"
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            required
            className="w-4 h-4 rounded border-[var(--light-border)] text-[var(--primary-color)]
                       focus:ring-[var(--primary-color)] cursor-pointer"
          />
          <label htmlFor="agreeToTerms" className="ml-2 text-sm text-[var(--light-text)] dark:text-[var(--dark-text)] cursor-pointer">
            I agree to the Terms of Service and Privacy Policy
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mb-3 py-2.5 text-base font-medium rounded-lg
                     bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white
                     transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Signup
