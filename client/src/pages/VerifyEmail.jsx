import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import axios from "axios";

import {
  FiCheck,
  FiX,
} from "react-icons/fi";

function VerifyEmail() {
  const [
    searchParams,
  ] = useSearchParams();

  const [status, setStatus] =
    useState("verifying");

  const [message, setMessage] =
    useState(
      "Verifying your email..."
    );

  useEffect(() => {
    let cancelled = false;

    const verifyEmail = async () => {
      const token =
        searchParams.get("token");

      const email =
        searchParams.get("email");

      if (!token || !email) {
        setStatus("error");

        setMessage(
          "This verification link is invalid."
        );

        return;
      }

      try {
        const response =
          await axios.get(
            "http://localhost:5000/api/auth/verify-email",
            {
              params: {
                token,
                email,
              },
            }
          );

        if (cancelled) {
          return;
        }

        setStatus("success");

        setMessage(
          response.data
            ?.message ||
            "Email verified successfully."
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setStatus("error");

        setMessage(
          error.response?.data
            ?.message ||
            "This verification link is invalid or expired."
        );
      }
    };

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <main
      className="newsletter-confirmed"
    >
      <div
        className="newsletter-confirmed-card"
        style={{
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            margin:
              "0 auto 20px",
            borderRadius:
              "50%",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            background:
              status === "success"
                ? "#e9f4ea"
                : status ===
                  "error"
                ? "#f7eaea"
                : "#eeeeeb",
            color:
              status === "success"
                ? "#4f8a5b"
                : status ===
                  "error"
                ? "#9b4444"
                : "#555",
          }}
        >
          {status ===
          "success" ? (
            <FiCheck
              size={23}
            />
          ) : status ===
            "error" ? (
            <FiX
              size={23}
            />
          ) : (
            "..."
          )}
        </div>

        <span className="newsletter-confirmed-eyebrow">
          Pomona
        </span>

        <h1>
          {status ===
          "verifying"
            ? "Verifying..."
            : status ===
              "success"
            ? "You're verified."
            : "Verification failed."}
        </h1>

        <p>
          {message}
        </p>

        {status ===
          "success" && (
          <p
            style={{
              marginTop:
                "18px",
              color:
                "rgba(250,250,248,0.55)",
              fontSize:
                "12px",
            }}
          >
            You can close this tab.
            Your original Pomona
            window will sign you in
            automatically.
          </p>
        )}

        {status ===
          "error" && (
          <Link to="/">
            Back to Pomona
          </Link>
        )}
      </div>
    </main>
  );
}

export default VerifyEmail;