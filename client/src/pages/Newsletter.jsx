import "./Newsletter.css";
import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";

import Navbar from "../components/layout/Navbar";
import meImage from "../assets/images/me.png";

function Newsletter() {
  const [email, setEmail] = useState("");

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    setStatus({
      type: "",
      message: "",
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/newsletter/subscribe",
        {
          email: email.trim(),
        }
      );

      setStatus({
        type: "success",
        message:
          response.data.message ||
          "You're subscribed!",
      });

      setEmail("");
    } catch (error) {
      console.error(
        "Newsletter subscription error:",
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
    <main className="newsletter-page">
      <Navbar light />

      <motion.section
        className="newsletter-card"
        initial={{
          opacity: 0,
          y: 35,
        }}
        animate={{
          opacity: 1,
          y: [0, -12, 0],
        }}
        transition={{
          opacity: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          },

          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        {/* =========================================
            LEFT SIDE
        ========================================= */}

        <div className="newsletter-character">
          <motion.img
            src={meImage}
            alt="Newsletter character"
            className="newsletter-character-image"
            initial={{
              opacity: 0,
              scale: 0.92,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.2,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          />

          <h1 className="newsletter-character-title">
            Subscribe to be notified
            <br />
            about my new projects.
          </h1>
        </div>

        {/* =========================================
            RIGHT SIDE
        ========================================= */}

        <div className="newsletter-content">
          <span className="newsletter-eyebrow">
            Newsletter
          </span>

          <h2 className="newsletter-heading">
            Stay in the loop.
          </h2>

          <p className="newsletter-description">
            New projects, experiments, ideas and
            things I build along the way.
          </p>

          <form
            className="newsletter-form"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Your email address"
              aria-label="Your email address"
              autoComplete="email"
              required
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Subscribing..."
                : "Subscribe"}
            </button>
          </form>

          {/* =========================================
              STATUS
          ========================================= */}

          {status.message && (
            <p
              className={`newsletter-status ${status.type}`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </p>
          )}
        </div>
      </motion.section>
    </main>
  );
}

export default Newsletter;