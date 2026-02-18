// src\pages\Auth\EnterOTP.jsx
import { useState, useEffect } from "react";
import { FaKey } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Swal from "sweetalert2";
import { verifyResetCode } from "../../api/axiosInstance";

const inputClass = `w-full px-3 py-2.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                    bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                    transition-all duration-200 text-base`

const labelClass = "block text-sm font-medium mb-1.5 text-[var(--light-text)] dark:text-[var(--dark-text)]"

const EnterOTP = ({ email: propEmail, onVerified }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fallback to email from URL query if not passed via props
  const queryParams = new URLSearchParams(location.search);
  const email = propEmail || queryParams.get("email");

  useEffect(() => {
    if (!email) {
      Swal.fire("❌ Missing Email", "Email is required to verify OTP", "error");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("handleSubmit triggered");
    console.log("Email:", email);
    console.log("OTP:", otp);

    try {
      const res = await verifyResetCode({ email, code: otp });
      Swal.fire("✅ Verified", res.data.message, "success");

      if (onVerified) {
        onVerified(email, otp);
      } else {
        navigate(`/reset-password?email=${email}&otp=${otp}`);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      console.log("OTP verify error:", msg);
      Swal.fire("❌ Failed", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Enter OTP"
      subtitle="Check your email for the 6-digit code"
      icon={<FaKey className="text-white" size={28} />}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={labelClass}>OTP Code</label>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-base font-medium rounded-lg
                     bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white
                     transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </span>
          ) : (
            "Verify OTP"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default EnterOTP;
