import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import axios from "axios";

import {
  FiEye,
  FiEyeOff,
  FiLock,
} from "react-icons/fi";
import API_URL from "../services/api";

import "../components/auth/AuthModal.css";

function ResetPassword() {
  const [
    searchParams,
  ] = useSearchParams();

  const navigate =
    useNavigate();

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

    if (!token || !email) {
      setStatus({
        type: "error",
        message:
          "This password reset link is invalid.",
      });
      return;
    }

    if (password.length < 8) {
      setStatus({
        type: "error",
        message:
          "Password must be at least 8 characters.",
      });
      return;
    }

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
          "Your password has been reset successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "This reset link is invalid or expired.",
      });
    } finally {
      setLoading(false);
    }
  };

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
              fontSize: "54px",
              fontWeight: 400,
              lineHeight: 0.95,
            }}
          >
            {success
              ? "You're back in."
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
              ? "Your password has been changed and your previous sessions have been revoked."
              : "Choose a new password for your Pomona account."}
          </p>
        </div>

        {!success ? (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
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
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                minLength={8}
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
                    (prev) => !prev
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
                  cursor: "pointer",
                }}
              >
                {showPassword ? (
                  <FiEyeOff size={17} />
                ) : (
                  <FiEye size={17} />
                )}
              </button>
            </div>

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
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
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
                    (prev) => !prev
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
                  cursor: "pointer",
                }}
              >
                {showConfirmPassword ? (
                  <FiEyeOff size={17} />
                ) : (
                  <FiEye size={17} />
                )}
              </button>
            </div>

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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <p
              className={`auth-status ${status.type}`}
              style={{
                margin: 0,
              }}
              role="status"
            >
              {status.message}
            </p>

            <button
              className="auth-submit"
              type="button"
              onClick={() =>
                navigate("/")
              }
            >
              Continue to Login
            </button>
          </div>
        )}

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          <Link
            to="/"
            style={{
              color:
                "rgba(250,250,248,0.5)",
              textDecoration: "none",
              fontSize: "12px",
            }}
          >
            Back to Pomona
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;