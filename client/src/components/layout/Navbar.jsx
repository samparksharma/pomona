import "./Navbar.css";

import logoLight from "../../assets/images/logo.svg";
import logoDark from "../../assets/images/logo-dark.svg";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  FiSliders,
  FiLogOut,
  FiMail,
  FiTrash2,
} from "react-icons/fi";

import FruitSearch from "../fruit/FruitSearch";
import AuthModal from "../auth/AuthModal";

import { useAuth } from "../auth/AuthContext";

function Navbar({
  light = false,
  showBack = false,
  showSearch = false,

  showFilter = false,
  seasons = [],
  selectedSeason = "All",
  setSelectedSeason,
  filterOpen = false,
  setFilterOpen,

  logoLinksHome = true,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const filterRef = useRef(null);
  const accountRef = useRef(null);

  // =========================================
  // AUTH
  // =========================================

  const {
    user,
    isAuthenticated,
    logout,
    deleteAccount,

    newsletterSubscribed,
    newsletterPending,
    newsletterLoading,

    subscribeToNewsletter,
    unsubscribeFromNewsletter,
  } = useAuth();

  const [authOpen, setAuthOpen] =
    useState(false);

  const [authMode, setAuthMode] =
    useState("login");

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [newsletterToast, setNewsletterToast] =
    useState("");

  // =========================================
  // DELETE ACCOUNT STATE
  // =========================================

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [
    deletePassword,
    setDeletePassword,
  ] = useState("");

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);

  const [
    deleteMessage,
    setDeleteMessage,
  ] = useState("");

  // =========================================
  // FILTER OUTSIDE CLICK
  // =========================================

  useEffect(() => {
    if (!showFilter || !filterOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(
          event.target
        )
      ) {
        setFilterOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [
    showFilter,
    filterOpen,
    setFilterOpen,
  ]);

  // =========================================
  // ACCOUNT OUTSIDE CLICK
  // =========================================

  useEffect(() => {
    if (!accountOpen) {
      return;
    }

    const handleClickOutside = (
      event
    ) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(
          event.target
        )
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [accountOpen]);

  useEffect(() => {
  if (!accountOpen) {
    return;
  }

  const handleClickOutside = (event) => {
    if (
      accountRef.current &&
      !accountRef.current.contains(event.target)
    ) {
      setAccountOpen(false);
    }
  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, [accountOpen]);

//////////////
useEffect(() => {
  if (location.state?.openLogin) {
    setAuthMode("login");
    setAuthOpen(true);

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  }
}, [location.state]);

  // =========================================
  // SEASON
  // =========================================

  const handleSeasonSelect = (
    season
  ) => {
    if (setSelectedSeason) {
      setSelectedSeason(season);
    }

    if (setFilterOpen) {
      setFilterOpen(false);
    }
  };

  // =========================================
  // AUTH MODAL
  // =========================================

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  // =========================================
  // USER INITIALS
  // =========================================

  const getInitials = () => {
    if (!user?.name) {
      return "?";
    }

    const parts = user.name
      .trim()
      .split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // =========================================
  // TOAST
  // =========================================

  const showNewsletterToast = (
    message,
    duration = 4000
  ) => {
    setNewsletterToast(message);

    window.setTimeout(() => {
      setNewsletterToast("");
    }, duration);
  };

  // =========================================
  // NEWSLETTER
  // =========================================

  const handleNewsletterToggle =
    async () => {
      if (
        newsletterLoading ||
        newsletterPending
      ) {
        return;
      }

      // -----------------------------
      // UNSUBSCRIBE
      // -----------------------------

      if (newsletterSubscribed) {
        const result =
          await unsubscribeFromNewsletter();

        if (result?.success) {
          showNewsletterToast(
            "You have been unsubscribed."
          );

          setAccountOpen(false);
        } else if (result?.message) {
          showNewsletterToast(
            result.message
          );
        }

        return;
      }

      // -----------------------------
      // SUBSCRIBE
      // -----------------------------

      const result =
        await subscribeToNewsletter();

      if (result?.success) {
        showNewsletterToast(
          "Check your email to confirm your subscription.",
          5000
        );
      } else if (
        result?.alreadySubscribed
      ) {
        showNewsletterToast(
          "You're already subscribed."
        );
      } else if (result?.pending) {
        showNewsletterToast(
          "Check your email to confirm your subscription.",
          5000
        );
      } else if (result?.message) {
        showNewsletterToast(
          result.message
        );
      }
    };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {
    await logout();

    setAccountOpen(false);
    setNewsletterToast("");
  };

  // =========================================
  // OPEN DELETE MODAL
  // =========================================

  const openDeleteAccount = () => {
    setAccountOpen(false);

    setDeletePassword("");
    setDeleteMessage("");

    setDeleteOpen(true);
  };

  // =========================================
  // CLOSE DELETE MODAL
  // =========================================

  const closeDeleteAccount = () => {
    if (deleteLoading) {
      return;
    }

    setDeleteOpen(false);
    setDeletePassword("");
    setDeleteMessage("");
  };

  // =========================================
  // DELETE ACCOUNT
  // =========================================

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteMessage(
        "Enter your password to continue."
      );
      return;
    }

    if (deleteLoading) {
      return;
    }

    setDeleteLoading(true);
    setDeleteMessage("");

    try {
      const result =
        await deleteAccount(
          deletePassword
        );

      if (result?.success) {
        setDeleteOpen(false);
        setAccountOpen(false);
        setDeletePassword("");
        setDeleteMessage("");

        showNewsletterToast(
          "Your account has been deleted.",
          4000
        );
      } else {
        setDeleteMessage(
          result?.message ||
            "Could not delete your account."
        );
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <>
      <motion.nav
        className={`navbar ${
          light
            ? "navbar-light"
            : ""
        }`}
        initial={{
          opacity: 0,
          y: -18,
          filter: "blur(8px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        transition={{
          delay: 1.0,
          duration: 0.7,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
      >
        {/* ==============================
            LEFT
        ============================== */}

        <div className="navbar__left">
          {showFilter && (
            <div
              className="navbar-filter"
              ref={filterRef}
            >
              <button
                type="button"
                className={`navbar-filter-trigger ${
                  filterOpen
                    ? "open"
                    : ""
                }`}
                onClick={() =>
                  setFilterOpen &&
                  setFilterOpen(
                    (prev) => !prev
                  )
                }
              >
                <FiSliders
                  size={16}
                />

                <span>
                  Filter
                </span>

                <span className="navbar-filter-chevron">
                  {filterOpen
                    ? "↑"
                    : "↓"}
                </span>
              </button>

              <div
                className={`navbar-filter-panel ${
                  filterOpen
                    ? "open"
                    : ""
                }`}
              >
                {seasons.map(
                  (season) => {
                    const Icon =
                      season.icon;

                    return (
                      <button
                        key={
                          season.name
                        }
                        type="button"
                        className={`navbar-season-option ${
                          selectedSeason ===
                          season.name
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          handleSeasonSelect(
                            season.name
                          )
                        }
                      >
                        <Icon
                          size={17}
                        />

                        <span>
                          {
                            season.name
                          }
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          <div className="navbar__logo">
            {showBack && (
              <button
                className="navbar-back"
                onClick={() =>
                  navigate(-1)
                }
                type="button"
              >
                ←
              </button>
            )}

            {logoLinksHome ? (
              <Link to="/">
                <img
                  src={
                    light
                      ? logoDark
                      : logoLight
                  }
                  alt="Pomona Logo"
                />
              </Link>
            ) : (
              <img
                src={
                  light
                    ? logoDark
                    : logoLight
                }
                alt="Pomona Logo"
              />
            )}
          </div>
        </div>

        {/* ==============================
            CENTER SEARCH
        ============================== */}

        {showSearch && (
          <FruitSearch />
        )}

        {/* ==============================
            NAVIGATION
        ============================== */}

        <div className="navbar__links">
          <Link to="/">
            Home
          </Link>

          <Link to="/discover">
            Discover
          </Link>

          <Link to="/about">
            About
          </Link>

          <Link to="/newsletter">
            Newsletter
          </Link>
        </div>

        {/* ==============================
            AUTH
        ============================== */}

        {!isAuthenticated ? (
          <div className="navbar__auth">
            <button
              type="button"
              className="login-btn"
              onClick={() =>
                openAuth("login")
              }
            >
              Login
            </button>

            <button
              type="button"
              className="signup-btn"
              onClick={() =>
                openAuth("signup")
              }
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div
            className="navbar-account"
            ref={accountRef}
          >
            <button
              type="button"
              className="navbar-avatar"
              onClick={() =>
                setAccountOpen(
                  (prev) => !prev
                )
              }
              aria-label="Open account menu"
              aria-expanded={
                accountOpen
              }
            >
              {getInitials()}
            </button>

            <div
              className={`navbar-account-menu ${
                accountOpen
                  ? "open"
                  : ""
              }`}
            >
              {/* ACCOUNT HEADER */}

              <div className="navbar-account-header">
                <div className="navbar-account-large-avatar">
                  {getInitials()}
                </div>

                <div className="navbar-account-user">
                  <strong>
                    {user?.name}
                  </strong>

                  <span>
                    {user?.email}
                  </span>
                </div>
              </div>

              <div className="navbar-account-divider" />

              {/* NEWSLETTER */}

              <button
                type="button"
                className="navbar-account-action"
                onClick={
                  handleNewsletterToggle
                }
                disabled={
                  newsletterLoading ||
                  newsletterPending
                }
              >
                <FiMail
                  size={15}
                />

                <span>
                  {newsletterLoading
                    ? "Updating..."
                    : newsletterSubscribed
                    ? "Unsubscribe from newsletter"
                    : newsletterPending
                    ? "Confirmation email sent"
                    : "Subscribe to newsletter"}
                </span>
              </button>

              {/* LOGOUT */}

              <button
                type="button"
                className="navbar-account-action logout"
                onClick={
                  handleLogout
                }
              >
                <FiLogOut
                  size={15}
                />

                <span>
                  Logout
                </span>
              </button>

              {/* DELETE */}

              <button
                type="button"
                className="navbar-account-action danger"
                onClick={
                  openDeleteAccount
                }
              >
                <FiTrash2
                  size={15}
                />

                <span>
                  Delete account
                </span>
              </button>
            </div>
          </div>
        )}
      </motion.nav>

      {/* ==============================
          AUTH MODAL
      ============================== */}

      {authOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() =>
            setAuthOpen(false)
          }
        />
      )}

      {/* ==============================
          DELETE ACCOUNT MODAL
      ============================== */}

      {deleteOpen && (
        <div
          className="auth-overlay"
          onClick={
            closeDeleteAccount
          }
        >
          <div
            className="auth-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="auth-close"
              type="button"
              onClick={
                closeDeleteAccount
              }
              aria-label="Close delete account dialog"
            >
              ×
            </button>

            <span className="auth-eyebrow">
              Account
            </span>

            <h2 className="auth-title">
              Delete your account?
            </h2>

            <p className="auth-description">
              This permanently deletes
              your Pomona account and
              revokes your active sessions.
              This action cannot be undone.
            </p>

            <div className="auth-form">
              <input
                className="auth-input"
                type="password"
                placeholder="Your password"
                value={deletePassword}
                onChange={(event) =>
                  setDeletePassword(
                    event.target.value
                  )
                }
                disabled={
                  deleteLoading
                }
                autoComplete="current-password"
              />

              {deleteMessage && (
                <p className="auth-status error">
                  {deleteMessage}
                </p>
              )}

              <button
                className="auth-submit"
                type="button"
                onClick={
                  handleDeleteAccount
                }
                disabled={
                  deleteLoading
                }
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete Account"}
              </button>

              <button
                className="auth-switch"
                type="button"
                onClick={
                  closeDeleteAccount
                }
                disabled={
                  deleteLoading
                }
              >
                Keep my account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================
          NEWSLETTER / GENERAL TOAST
      ============================== */}

      {newsletterToast && (
        <div
          className="newsletter-toast"
          role="status"
          aria-live="polite"
        >
          <FiMail
            size={16}
          />

          <span>
            {newsletterToast}
          </span>
        </div>
      )}
    </>
  );
}

export default Navbar;