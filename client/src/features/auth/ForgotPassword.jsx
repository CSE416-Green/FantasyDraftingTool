import { useState } from "react";
import axios from "axios";

import "../../css/login.css";

export default function ForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("/user/forgot-password", { email });
      setStep("otp");
    } catch (err) {
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOtpError("");
    try {
      await axios.post("/user/verify-otp", { email, otp });
      setStep("password");
    } catch (err) {
      const attempts = otpAttempts + 1;
      setOtpAttempts(attempts);
      if (attempts >= 3) {
        setOtpError("Too many failed attempts. Please restart.");
        setStep("email");
        setOtp("");
        setOtpAttempts(0);
      } else {
        setOtpError(`Invalid or expired OTP. ${3 - attempts} attempt(s) remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/user/reset-password", { email, otp, password });
      setStep("done");
    } catch (err) {
      setError("Invalid or expired OTP. Please start over.");
      setStep("email");
    } finally {
      setLoading(false);
    }
  };

// AI - generated 
  return (
    <div className="login-page">
      <h1 className="login-title">Fantasy Baseball Draft Kit</h1>
      <div className="login-wrap">
        <h2 className="login-header">Reset Password</h2>
        <div className="login-body">

          {/* STEP 1 - Email */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit}>
              <div className="login-field">
                <label>Email Address:</label>
                <input
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="login-error">{error}</p>}
              <div className="login-buttons">
                <button className="form-buttom" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
                <button className="form-buttom" type="button" onClick={onBackToLogin}>
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {/* STEP 2 - OTP */}
          {step === "otp" && (
            <form onSubmit={handleOtpSubmit}>
              <div style={{ marginBottom: "16px", color:"black", fontSize:"14px"}}> If the email address is valid you will have a One Time Password via email, please type it below. </div>
              <div className="login-field">
                <label>One Time Password:</label>
                <input
                  className="login-input"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              {otpError && <p className="login-error">{otpError}</p>}
              <div className="login-buttons">
                <button className="form-buttom" type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <button className="form-buttom" type="button" onClick={() => { setStep("email"); setOtp(""); setOtpError(""); setOtpAttempts(0); }}>
                  Retry
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 - New Password */}
          {step === "password" && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="login-field">
                <label>New Password:</label>
                <input
                  className="login-input"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="login-field">
                <label>Confirm New Password:</label>
                <input
                  className="login-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="login-error">{error}</p>}
              <div className="login-buttons">
                <button className="form-buttom" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save New Password"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4 - Done */}
          {step === "done" && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p style={{ marginBottom: "16px", color:"black", fontSize:"14px"}}> Password reset successfully! </p>
              <button className="form-buttom" onClick={onBackToLogin}>
                Back to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}