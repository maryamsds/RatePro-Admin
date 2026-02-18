// src\pages\Auth\EnterEmail.jsx
import { useState } from "react";
import { FaEnvelopeOpenText } from "react-icons/fa";
import AuthLayout from "../../layouts/AuthLayout";
import Swal from "sweetalert2";
import { forgotPassword } from "../../api/axiosInstance";

const inputClass = `w-full px-3 py-2.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                    bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                    transition-all duration-200 text-base`

const labelClass = "block text-sm font-medium mb-1.5 text-[var(--light-text)] dark:text-[var(--dark-text)]"

const EnterEmail = ({ onOTPSent }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      Swal.fire("✅ OTP Sent", res.data.message || "Check your email", "success");
      onOTPSent(email);
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      Swal.fire("❌ Failed", err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email to receive a reset code"
      icon={<FaEnvelopeOpenText className="text-white" size={28} />}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              Sending...
            </span>
          ) : (
            "Send OTP"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default EnterEmail;
