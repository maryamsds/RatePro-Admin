// src\pages\Auth\ResetPassword.jsx
import { useState } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import AuthLayout from "../../layouts/AuthLayout";
import Swal from "sweetalert2";
import { resetPassword } from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const inputClass = `w-full px-3 py-2.5 rounded-lg border border-[var(--light-border)] dark:border-[var(--dark-border)]
                    bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] text-[var(--light-text)] dark:text-[var(--dark-text)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent
                    transition-all duration-200 text-base`

const labelClass = "block text-sm font-medium mb-1.5 text-[var(--light-text)] dark:text-[var(--dark-text)]"

const ResetPassword = ({ email, otp }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Swal.fire("❌ Error", "Passwords do not match", "error");
      return;
    }

    console.log("🚀 Sending Reset Request", { email, otp, newPassword });
    setLoading(true);

    try {
      await resetPassword({ email, code: otp, newPassword });
      Swal.fire("✅ Success", "Your password has been reset", "success");
      navigate("/login");
    } catch (err) {
      console.error("Reset Error:", err);
      Swal.fire("❌ Failed", err.response?.data?.message || "Reset failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Create a strong password for your account"
      icon={<FaLock className="text-white" size={28} />}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={labelClass}>New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={`${inputClass} pr-12`}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[var(--secondary-color)] text-lg"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label className={labelClass}>Confirm Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`${inputClass} pr-12`}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[var(--secondary-color)] text-lg"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
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
              Resetting...
            </span>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
