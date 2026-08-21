import "./Footer.css";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

import {
  FiInstagram,
  FiLinkedin,
} from "react-icons/fi";

import {
  FaXTwitter,
} from "react-icons/fa6";

function Footer() {
  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  // =========================================
  // GO TO NEWSLETTER
  // =========================================

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      return;
    }

    navigate("/newsletter", {
      state: {
        email: cleanEmail,
      },
    });
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">

        {/* =========================================
            TOP NAV
        ========================================= */}

        <div className="site-footer-top">
          <nav className="site-footer-nav">
            <Link to="/about">
              About
            </Link>

            <Link to="/newsletter">
              Newsletter
            </Link>

            <Link to="/discover">
              Discover
            </Link>
          </nav>

          {/* SOCIALS */}

          <div className="site-footer-socials">
            <a
              href="#"
              aria-label="Instagram"
            >
              <FiInstagram />
            </a>

            <a
              href="https://x.com/_sampark_"
              aria-label="X"
              target="_blank"
              rel="noreferrer"
            >
              <FaXTwitter />
            </a>

            <a
              href="https://www.linkedin.com/in/sampark-sharma-9b0923335/"
              aria-label="LinkedIn"
              target="_blank"
              rel="noreferrer"
            >
              <FiLinkedin />
            </a>
          </div>
        </div>

        {/* =========================================
            NEWSLETTER
        ========================================= */}

        <div className="site-footer-newsletter">
          <span className="site-footer-eyebrow">
            Stay in the loop.
          </span>

          <form
            className="site-footer-form"
            onSubmit={
              handleSubmit
            }
          >
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Email address"
              aria-label="Email address"
              autoComplete="email"
              required
            />

            <button type="submit">
              Subscribe
            </button>
          </form>
        </div>

        {/* =========================================
            BOTTOM META
        ========================================= */}

        <div className="site-footer-meta">
          <span>
            ©{" "}
            {new Date().getFullYear()}
          </span>

          <span>
            Built with curiosity.
          </span>
        </div>

        {/* =========================================
            HUGE WORDMARK
        ========================================= */}

        <div className="site-footer-wordmark">
          Pomona
        </div>
      </div>
    </footer>
  );
}

export default Footer;