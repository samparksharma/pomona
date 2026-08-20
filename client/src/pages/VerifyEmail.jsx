import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import axios from "axios";

function VerifyEmail() {
  const [searchParams] =
    useSearchParams();

  const hasVerified =
    useRef(false);

  const [status, setStatus] =
    useState("verifying");

  const [message, setMessage] =
    useState(
      "Verifying your email..."
    );

  useEffect(() => {
    // Prevent React StrictMode from
    // sending the single-use token twice.
    if (hasVerified.current) {
      return;
    }

    hasVerified.current = true;

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
              withCredentials: true,
            }
          );

        setStatus("success");

        setMessage(
          response.data.message ||
            "Your email has been verified successfully."
        );

        // The backend creates the auth session
        // after verification, so reload the app.
        // AuthContext will detect the cookies
        // and restore the user automatically.
        window.setTimeout(() => {
          window.location.href = "/";
        }, 900);
      } catch (error) {
        setStatus("error");

        setMessage(
          error.response?.data?.message ||
            "This verification link is invalid or expired."
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <main className="newsletter-confirmed">
      <div className="newsletter-confirmed-card">
        <span className="newsletter-confirmed-eyebrow">
          Pomona
        </span>

        <h1>
          {status === "verifying"
            ? "Verifying..."
            : status === "success"
            ? "You're verified."
            : "Verification failed."}
        </h1>

        <p>
          {message}
        </p>

        {status === "error" && (
          <Link to="/">
            Back to Pomona
          </Link>
        )}
      </div>
    </main>
  );
}

export default VerifyEmail;