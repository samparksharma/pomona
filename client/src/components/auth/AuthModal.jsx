import "./AuthModal.css";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import { useAuth } from "./AuthContext";

import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiCheck,
} from "react-icons/fi";

const API_URL = "http://localhost:5000";

const WATCHER_KEY =
  "pomonaVerificationWatcher";

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

  const [
    waitingForVerification,
    setWaitingForVerification,
  ] = useState(false);

  const [
    verificationComplete,
    setVerificationComplete,
  ] = useState(false);

  const pollingRef =
    useRef(null);

  const isLogin =
    mode === "login";

  // =========================================
  // CLEANUP POLLING
  // =========================================

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        window.clearInterval(
          pollingRef.current
        );

        pollingRef.current = null;
      }
    };
  }, []);

  // =========================================
  // START VERIFICATION WATCHER
  // =========================================

  const startVerificationWatcher = (
    watcherToken
  ) => {
    if (!watcherToken) {
      return;
    }

    if (pollingRef.current) {
      window.clearInterval(
        pollingRef.current
      );

      pollingRef.current = null;
    }

    sessionStorage.setItem(
      WATCHER_KEY,
      watcherToken
    );

    setWaitingForVerification(true);
    setVerificationComplete(false);

    pollingRef.current =
      window.setInterval(
        async () => {
          const currentToken =
            sessionStorage.getItem(
              WATCHER_KEY
            );

          if (!currentToken) {
            return;
          }

          try {
            const response =
              await axios.get(
                `${API_URL}/api/auth/verification-status`,
                {
                  params: {
                    token:
                      currentToken,
                  },
                  withCredentials: true,
                }
              );

            if (
              response.data.status ===
              "verified"
            ) {
              window.clearInterval(
                pollingRef.current
              );

              pollingRef.current =
                null;

              sessionStorage.removeItem(
                WATCHER_KEY
              );

              setWaitingForVerification(
                false
              );

              setVerificationComplete(
                true
              );

              setUser(
                response.data.user
              );

              setStatus({
                type: "success",
                message:
                  "Email verified. You're now signed in.",
              });

              window.setTimeout(() => {
                onClose();
              }, 300);

              return;
            }

            // Keep waiting while status is "pending".
          } catch (error) {
            // ---------------------------------
            // WATCHER EXPIRED
            // ---------------------------------

            if (
              error.response?.status ===
              410
            ) {
              window.clearInterval(
                pollingRef.current
              );

              pollingRef.current =
                null;

              sessionStorage.removeItem(
                WATCHER_KEY
              );

              setWaitingForVerification(
                false
              );

              setStatus({
                type: "error",
                message:
                  "Verification session expired. Please request a new verification email.",
              });

              return;
            }

            /*
             * Important:
             * 429 / 500 / network errors should
             * NOT kill the watcher.
             *
             * We'll simply try again on the
             * next interval.
             */
          }
        },
        3000
      );
  };

  // =========================================
  // RESEND VERIFICATION
  // =========================================

  const resendVerification =
    async () => {
      if (
        loading ||
        !email.trim()
      ) {
        return;
      }

      setLoading(true);

      setStatus({
        type: "",
        message: "",
      });

      try {
        const response =
          await axios.post(
            `${API_URL}/api/auth/resend-verification`,
            {
              email:
                email.trim(),
            }
          );

        if (
          response.data
            .verificationWatcherToken
        ) {
          startVerificationWatcher(
            response.data
              .verificationWatcherToken
          );
        }

        setStatus({
          type: "success",
          message:
            response.data.message ||
            "A new verification email has been sent.",
        });
      } catch (error) {
        setStatus({
          type: "error",
          message:
            error.response?.data
              ?.message ||
            "Could not resend the verification email.",
        });
      } finally {
        setLoading(false);
      }
    };

  // =========================================
  // FORGOT PASSWORD
  // =========================================

  const handleForgotPassword =
    async () => {
      if (loading) {
        return;
      }

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
          `${API_URL}/api/auth/forgot-password`,
          {
            email:
              cleanEmail,
          }
        );

        setStatus({
          type: "success",
          message:
            "If an account exists for this email, a reset link has been sent.",
        });
      } catch (error) {
        /*
         * Same response intentionally kept
         * to prevent account enumeration.
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
  // LOGIN / SIGNUP
  // =========================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (loading) {
        return;
      }

      setLoading(true);

      setStatus({
        type: "",
        message: "",
      });

      try {
        const endpoint = isLogin
          ? `${API_URL}/api/auth/login`
          : `${API_URL}/api/auth/signup`;

        const payload = isLogin
          ? {
              email:
                email.trim(),
              password,
            }
          : {
              name:
                name.trim(),
              email:
                email.trim(),
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

        // =====================================
        // SIGNUP
        // =====================================

        if (
          !isLogin &&
          response.data
            .requiresEmailVerification
        ) {
          startVerificationWatcher(
            response.data
              .verificationWatcherToken
          );

          setStatus({
            type: "success",
            message:
              "Account created. Check your email to verify your account.",
          });

          return;
        }

        // =====================================
        // LOGIN
        // =====================================

        if (isLogin) {
          setUser(
            response.data.user
          );

          setStatus({
            type: "success",
            message:
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
            error.response?.data
              ?.message ||
            "Something went wrong. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

  // =========================================
  // SWITCH LOGIN / SIGNUP
  // =========================================

  const switchMode = () => {
    if (pollingRef.current) {
      window.clearInterval(
        pollingRef.current
      );

      pollingRef.current = null;
    }

    sessionStorage.removeItem(
      WATCHER_KEY
    );

    setWaitingForVerification(
      false
    );

    setVerificationComplete(
      false
    );

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

    setShowPassword(false);
  };

  // =========================================
  // CLOSE MODAL
  // =========================================

  const handleClose = () => {
    if (pollingRef.current) {
      window.clearInterval(
        pollingRef.current
      );

      pollingRef.current = null;
    }

    sessionStorage.removeItem(
      WATCHER_KEY
    );

    onClose();
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div
      className="auth-overlay"
      onClick={handleClose}
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
          onClick={handleClose}
          type="button"
          aria-label="Close"
        >
          ×
        </button>

        {/* HEADING */}

        <span className="auth-eyebrow">
          Welcome to Pomona
        </span>

        <h2 className="auth-title">
          {verificationComplete
            ? "You're verified."
            : isLogin
            ? "Welcome back."
            : "Create an account."}
        </h2>

        <p className="auth-description">
          {verificationComplete
            ? "Your email is confirmed and your account is now signed in."
            : waitingForVerification
            ? "Check your email. Keep this window open — we'll sign you in automatically once you verify."
            : isLogin
            ? "Sign in to continue exploring Pomona."
            : "Join Pomona and keep your discoveries close."}
        </p>

        {/* =====================================
            VERIFICATION WAITING
        ===================================== */}

        {waitingForVerification &&
        !verificationComplete ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
              padding:
                "12px 0 4px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f1f1ed",
                color: "#111",
              }}
            >
              <FiMail size={21} />
            </div>

            <strong
              style={{
                fontSize: 14,
              }}
            >
              Verification email sent
            </strong>

            <span
              style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: "#777",
                maxWidth: 300,
              }}
            >
              Open the email on
              any device and
              click the verify
              button. You can
              leave this Pomona
              window open.
            </span>

            {status.message && (
              <p
                className={`auth-status ${status.type}`}
                role="status"
                aria-live="polite"
              >
                {status.message}
              </p>
            )}

            <button
              type="button"
              className="auth-switch"
              onClick={
                resendVerification
              }
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Resend verification email"}
            </button>
          </div>
        ) : (
          <>
            {/* =================================
                FORM
            ================================= */}

            <form
              onSubmit={
                handleSubmit
              }
              className="auth-form"
            >
              {!isLogin && (
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
                >
                  {showPassword ? (
                    <FiEyeOff
                      size={17}
                    />
                  ) : (
                    <FiEye
                      size={17}
                    />
                  )}
                </button>
              </div>

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

            {status.message && (
              <p
                className={`auth-status ${status.type}`}
                role="status"
                aria-live="polite"
              >
                {status.message}
              </p>
            )}

            <button
              className="auth-switch"
              onClick={
                switchMode
              }
              type="button"
              disabled={loading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </>
        )}

        {/* VERIFIED INDICATOR */}

        {verificationComplete && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "12px",
              color: "#4f8a5b",
            }}
          >
            <FiCheck size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;