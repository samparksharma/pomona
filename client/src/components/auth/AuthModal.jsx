import "./AuthModal.css";

import { useState } from "react";
import axios from "axios";

import { useAuth } from "./AuthContext";

import {
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

function AuthModal({
  onClose,
  initialMode = "login",
}) {
  const { setUser } = useAuth();

  const [mode, setMode] =
    useState(initialMode);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [status, setStatus] =
    useState({
      type: "",
      message: "",
    });

  const [verificationNeeded, setVerificationNeeded] =
    useState(false);

  const isLogin = mode === "login";
  const isSignup = mode === "signup";

  // =========================================
  // SWITCH LOGIN / SIGNUP
  // =========================================

  const switchMode = () => {
    setMode(
      isLogin
        ? "signup"
        : "login"
    );

    setName("");
    setEmail("");
    setPassword("");

    setStatus({
      type: "",
      message: "",
    });

    setVerificationNeeded(false);
    setShowPassword(false);
  };

  // =========================================
  // FORGOT PASSWORD
  // =========================================

  const handleForgotPassword = async () => {
    if (loading) return;

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setStatus({
        type: "error",
        message:
          "Enter your email address first.",
      });

      return;
    }

    setLoading(true);

    setStatus({
      type: "",
      message: "",
    });

    try {
      await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        {
          email: cleanEmail,
        }
      );

      setStatus({
        type: "success",
        message:
          "If an account exists for this email, a reset link has been sent.",
      });
    } catch (error) {
      /*
       * Keep the same message even if the request
       * fails so we don't reveal whether an account
       * exists for this email.
       */
      setStatus({
        type: "success",
        message:
          "If an account exists for this email, a reset link has been sent.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // RESEND VERIFICATION
  // =========================================

  const resendVerification = async () => {
    if (
      loading ||
      !email.trim()
    ) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await axios.post(
          "http://localhost:5000/api/auth/resend-verification",
          {
            email: email.trim(),
          },
          {
            withCredentials: true,
          }
        );

      setStatus({
        type: "success",
        message:
          response.data.message ||
          "Verification email sent.",
      });
    } catch {
      setStatus({
        type: "error",
        message:
          "Could not resend the verification email.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOGIN / SIGNUP
  // =========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    setStatus({
      type: "",
      message: "",
    });

    setVerificationNeeded(false);

    try {
      const endpoint = isLogin
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/signup";

      const payload = isLogin
        ? {
            email: email.trim(),
            password,
          }
        : {
            name: name.trim(),
            email: email.trim(),
            password,
          };

      const response =
        await axios.post(
          endpoint,
          payload,
          {
            withCredentials: true,
          }
        );

      // =======================================
      // SIGNUP
      // =======================================

      if (
        isSignup &&
        response.data
          .requiresEmailVerification
      ) {
        setVerificationNeeded(true);

        setStatus({
          type: "success",
          message:
            response.data.message ||
            "Check your email to verify your account.",
        });

        return;
      }

      // =======================================
      // LOGIN
      // =======================================

      if (isLogin) {
        setUser(response.data.user);

        setStatus({
          type: "success",
          message:
            response.data.message ||
            "Login successful.",
        });

        window.setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div
      className="auth-overlay"
      onClick={onClose}
    >
      <div
        className="auth-card"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* CLOSE */}

        <button
          className="auth-close"
          onClick={onClose}
          aria-label="Close authentication modal"
          type="button"
        >
          ×
        </button>

        {/* HEADING */}

        <span className="auth-eyebrow">
          Welcome to Pomona
        </span>

        <h2 className="auth-title">
          {isLogin
            ? "Welcome back."
            : "Create an account."}
        </h2>

        <p className="auth-description">
          {isLogin
            ? "Sign in to continue exploring Pomona."
            : "Join Pomona and keep your discoveries close."}
        </p>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          {/* NAME */}

          {isSignup && (
            <input
              className="auth-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              autoComplete="name"
              disabled={loading}
              required
            />
          )}

          {/* EMAIL */}

          <input
            className="auth-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            autoComplete="email"
            disabled={loading}
            required
          />

          {/* PASSWORD */}

          <div className="auth-password-wrapper">
            <input
              className="auth-input auth-password-input"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete={
                isLogin
                  ? "current-password"
                  : "new-password"
              }
              minLength={8}
              disabled={loading}
              required
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() =>
                setShowPassword(
                  (prev) => !prev
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              disabled={loading}
            >
              {showPassword ? (
                <FiEyeOff size={17} />
              ) : (
                <FiEye size={17} />
              )}
            </button>
          </div>

          {/* FORGOT PASSWORD */}

          {isLogin && (
            <button
              type="button"
              className="auth-forgot"
              onClick={
                handleForgotPassword
              }
              disabled={loading}
            >
              Forgot password?
            </button>
          )}

          {/* SUBMIT */}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? isLogin
                ? "Logging in..."
                : "Creating account..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        {/* STATUS */}

        {status.message && (
          <p
            className={`auth-status ${status.type}`}
            role="status"
            aria-live="polite"
          >
            {status.message}
          </p>
        )}

        {/* RESEND VERIFICATION */}

        {verificationNeeded && (
          <button
            type="button"
            className="auth-switch"
            onClick={
              resendVerification
            }
            disabled={loading}
          >
            Resend verification email
          </button>
        )}

        {/* SWITCH */}

        {!verificationNeeded && (
          <button
            className="auth-switch"
            onClick={switchMode}
            type="button"
            disabled={loading}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthModal;