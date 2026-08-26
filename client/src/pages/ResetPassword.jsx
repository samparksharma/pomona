import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import {
  FiEye,
  FiEyeOff,
  FiLock,
} from "react-icons/fi";

import API_URL from "../services/api";

import "../components/auth/AuthModal.css";

// =====================================================
// PASSWORD VALIDATION
// =====================================================

const getPasswordError = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character.";
  }

  return "";
};

function ResetPassword() {
  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token");

  const email =
    searchParams.get("email");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [status, setStatus] =
    useState({
      type: "",
      message: "",
    });

  const [success, setSuccess] =
    useState(false);

  // =====================================================
  // LIVE PASSWORD ERROR
  // =====================================================

  const passwordError =
    password
      ? getPasswordError(password)
      : "";

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading || success) {
      return;
    }

    setStatus({
      type: "",
      message: "",
    });

    // =========================================
    // VALIDATE RESET LINK
    // =========================================

    if (!token || !email) {
      setStatus({
        type: "error",
        message:
          "This password reset link is invalid.",
      });

      return;
    }

    // =========================================
    // VALIDATE PASSWORD
    // =========================================

    const passwordValidationError =
      getPasswordError(password);

    if (passwordValidationError) {
      setStatus({
        type: "error",
        message:
          passwordValidationError,
      });

      return;
    }

    // =========================================
    // CONFIRM PASSWORD
    // =========================================

    if (
      password !== confirmPassword
    ) {
      setStatus({
        type: "error",
        message:
          "Passwords do not match.",
      });

      return;
    }

    setLoading(true);

    try {
      const response =
        await axios.post(
          `${API_URL}/api/auth/reset-password`,
          {
            token,
            email,
            password,
          }
        );

      setSuccess(true);

      setStatus({
        type: "success",
        message:
          response.data.message ||
          "Your password has been changed successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data
            ?.message ||
          "This reset link is invalid or expired.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f6f5f1",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "42px",
          borderRadius: "28px",
          background: "#111111",
          color: "#fafaf8",
          boxShadow:
            "0 25px 70px rgba(0,0,0,0.16)",
        }}
      >
        {/* =========================================
            ICON
        ========================================= */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "46px",
            height: "46px",
            margin: "0 auto 22px",
            borderRadius: "50%",
            background: "#fafaf8",
            color: "#111111",
          }}
        >
          <FiLock size={19} />
        </div>

        {/* =========================================
            HEADING
        ========================================= */}

        <div
          style={{
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: "12px",
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color:
                "rgba(250,250,248,0.42)",
            }}
          >
            Pomona Account
          </span>

          <h1
            style={{
              margin: 0,
              fontFamily:
                '"Instrument Serif", serif',
              fontSize:
                "clamp(46px, 8vw, 54px)",
              fontWeight: 400,
              lineHeight: 0.95,
            }}
          >
            {success
              ? "Password changed."
              : "Reset your password."}
          </h1>

          <p
            style={{
              maxWidth: "360px",
              margin:
                "18px auto 28px",
              fontSize: "14px",
              lineHeight: 1.7,
              color:
                "rgba(250,250,248,0.56)",
            }}
          >
            {success
              ? "Your password has been changed successfully. You can now close this tab."
              : "Choose a new password for your Pomona account."}
          </p>
        </div>

        {/* =========================================
            FORM
        ========================================= */}

        {!success ? (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* =====================================
                NEW PASSWORD
            ===================================== */}

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                className="auth-input"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="New password"
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value
                  );

                  // Clear old submit error
                  // while user is fixing password.
                  if (status.type === "error") {
                    setStatus({
                      type: "",
                      message: "",
                    });
                  }
                }}
                autoComplete="new-password"
                disabled={loading}
                required
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position:
                    "absolute",
                  right: "14px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background:
                    "transparent",
                  color: "#888",
                  cursor:
                    loading
                      ? "default"
                      : "pointer",
                }}
              >
                {showPassword ? (
                  <FiEyeOff size={17} />
                ) : (
                  <FiEye size={17} />
                )}
              </button>
            </div>

            {/* =====================================
                PASSWORD REQUIREMENT MESSAGE
            ===================================== */}

            {password && (
              <p
                style={{
                  margin:
                    "12px 4px 2px",
                  fontSize: "11px",
                  lineHeight: 1.5,
                  color:
                    passwordError
                      ? "rgba(249, 13, 13, 0.42)"
                      : "#7aaa7f",
                }}
              >
                {passwordError ||
                  "Password meets all requirements."}
              </p>
            )}

            {/* =====================================
                CONFIRM PASSWORD
            ===================================== */}

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                className="auth-input"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value
                  );

                  if (status.type === "error") {
                    setStatus({
                      type: "",
                      message: "",
                    });
                  }
                }}
                autoComplete="new-password"
                disabled={loading}
                required
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) =>
                      !previous
                  )
                }
                disabled={loading}
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position:
                    "absolute",
                  right: "14px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background:
                    "transparent",
                  color: "#888",
                  cursor:
                    loading
                      ? "default"
                      : "pointer",
                }}
              >
                {showConfirmPassword ? (
                  <FiEyeOff size={17} />
                ) : (
                  <FiEye size={17} />
                )}
              </button>
            </div>

            {/* =====================================
                STATUS
            ===================================== */}

            {status.message && (
              <p
                className={`auth-status ${status.type}`}
                style={{
                  margin:
                    "4px 0 0",
                }}
                role="status"
                aria-live="polite"
              >
                {status.message}
              </p>
            )}

            {/* =====================================
                SUBMIT
            ===================================== */}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
              style={{
                marginTop: "6px",
              }}
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </button>
          </form>
        ) : (
          /* =======================================
             SUCCESS STATE
          ======================================= */

          <div
            style={{
              textAlign: "center",
            }}
          >
            <p
              className={`auth-status ${status.type}`}
              style={{
                margin: 0,
              }}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </p>

            <p
              style={{
                marginTop: "14px",
                marginBottom: 0,
                fontSize: "12px",
                lineHeight: 1.6,
                color:
                  "rgba(250,250,248,0.42)",
              }}
            >
              You can now close this tab.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default ResetPassword;