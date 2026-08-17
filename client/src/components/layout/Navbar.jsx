import "./Navbar.css";

import logoLight from "../../assets/images/logo.svg";
import logoDark from "../../assets/images/logo-dark.svg";

import { Link, useNavigate } from "react-router-dom";

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
  FiX,
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

  const filterRef = useRef(null);
  const accountRef = useRef(null);

  // =========================================
  // AUTH
  // =========================================

  const {
    user,
    isAuthenticated,
    logout,
    newsletterSubscribed,
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

    const handleClickOutside = (event) => {
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

  // =========================================
  // SEASON
  // =========================================

  const handleSeasonSelect = (season) => {
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
  // USER INITIAL
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
  // NEWSLETTER ACTION
  // =========================================

  const handleNewsletterToggle =
    async () => {
      if (newsletterLoading) {
        return;
      }

      if (newsletterSubscribed) {
        await unsubscribeFromNewsletter();
      } else {
        await subscribeToNewsletter();
      }
    };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {
    await logout();

    setAccountOpen(false);
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <>
      <motion.nav
        className={`navbar ${
          light ? "navbar-light" : ""
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
          ease: [0.22, 1, 0.36, 1],
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
                <FiSliders size={16} />

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
                {seasons.map((season) => {
                  const Icon =
                    season.icon;

                  return (
                    <button
                      key={season.name}
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
                      <Icon size={17} />

                      <span>
                        {season.name}
                      </span>
                    </button>
                  );
                })}
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

              <button
                type="button"
                className="navbar-account-action"
                onClick={
                  handleNewsletterToggle
                }
                disabled={
                  newsletterLoading
                }
              >
                <FiMail size={15} />

                <span>
                  {newsletterLoading
                    ? "Updating..."
                    : newsletterSubscribed
                    ? "Unsubscribe from newsletter"
                    : "Subscribe to newsletter"}
                </span>
              </button>

              <button
                type="button"
                className="navbar-account-action logout"
                onClick={handleLogout}
              >
                <FiLogOut size={15} />

                <span>
                  Logout
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
    </>
  );
}

export default Navbar;