import "./AuthModal.css";
import { useState } from "react";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
function AuthModal({
  onClose,
  initialMode = "login",
}) {
  const [mode, setMode] = useState(initialMode);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const isLogin = mode === "login";

  const [showPassword, setShowPassword] = useState(false);

  // =========================================
  // SWITCH LOGIN / SIGNUP
  // =========================================

  const switchMode = () => {
    setMode(isLogin ? "signup" : "login");

    setName("");
    setEmail("");
    setPassword("");

    setStatus({
      type: "",
      message: "",
    });
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    setStatus({
      type: "",
      message: "",
    });

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

      const response = await axios.post(
        endpoint,
        payload,
        {
          withCredentials: true,
        }
      );

      setStatus({
        type: "success",
        message:
          response.data.message ||
          (isLogin
            ? "Login successful."
            : "Account created successfully."),
      });

      /*
       * Give the success message a tiny moment
       * before closing the modal.
       */
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error(
        "Authentication error:",
        error
      );

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
        {/* =====================================
            CLOSE
        ===================================== */}

        <button
          className="auth-close"
          onClick={onClose}
          aria-label="Close authentication modal"
          type="button"
        >
          ×
        </button>

        {/* =====================================
            HEADING
        ===================================== */}

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

        {/* =====================================
            FORM
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          {!isLogin && (
            <input
              className="auth-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
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
              setEmail(event.target.value)
            }
            autoComplete="email"
            disabled={loading}
            required
          />

          <div className="auth-password-wrapper">
  
  <input
    className="auth-input auth-password-input"
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(event) =>
      setPassword(event.target.value)
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
        <FiEye size={17} />
    ) : (
        <FiEyeOff size={17} />
    )}
  </button>
</div>
          {/* ===================================
              SUBMIT
          =================================== */}

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

        {/* =====================================
            STATUS
        ===================================== */}

        {status.message && (
          <p
            className={`auth-status ${status.type}`}
            role="status"
            aria-live="polite"
          >
            {status.message}
          </p>
        )}

        {/* =====================================
            SWITCH
        ===================================== */}

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
      </div>
    </div>
  );
}

export default AuthModal;