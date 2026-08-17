import "./AuthModal.css";
import { useState } from "react";

function AuthModal({
  onClose,
  initialMode = "login",
}) {
  const [mode, setMode] =
    useState(initialMode);

  const isLogin = mode === "login";

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div
        className="auth-card"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="auth-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <span className="auth-eyebrow">
          Welcome to Pomona
        </span>

        <h2 className="auth-title">
          {isLogin ? "Welcome back." : "Create an account."}
        </h2>

        <p className="auth-description">
          {isLogin
            ? "Sign in to continue exploring Pomona."
            : "Join Pomona and keep your discoveries close."}
        </p>

        {!isLogin && (
          <input
            className="auth-input"
            type="text"
            placeholder="Your name"
          />
        )}

        <input
          className="auth-input"
          type="email"
          placeholder="Email address"
          autoComplete="email"
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          autoComplete={
            isLogin ? "current-password" : "new-password"
          }
        />

        <button className="auth-submit">
          {isLogin ? "Login" : "Create Account"}
        </button>

        <button
          className="auth-switch"
          onClick={() =>
            setMode(isLogin ? "signup" : "login")
          }
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