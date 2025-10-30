"use client";

import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { FaLock } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthLayout from "../../layouts/AuthLayout";
import Swal from "sweetalert2";
import { resetPassword } from "../../api/axiosInstance"; // ✅ Adjust path as needed
import { useNavigate } from "react-router-dom";

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

    console.log("🚀 Sending Reset Request", {
      email,
      otp,
      newPassword,
    });

    setLoading(true);

    try {
      await resetPassword({
        email,
        code: otp,
        newPassword,
      });

      Swal.fire("✅ Success", "Your password has been reset", "success");
      navigate("/login"); // ✅ Redirect to login page
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
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>New Password</Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
          <Form.Label>Confirm Password</Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

        <Button type="submit" variant="primary" className="w-100" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default ResetPassword;
