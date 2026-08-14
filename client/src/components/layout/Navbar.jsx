import "./Navbar.css";
import logoLight from "../../assets/images/logo.svg";
import logoDark from "../../assets/images/logo-dark.svg";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import FruitSearch from "../fruit/FruitSearch";
import { motion } from "framer-motion";
import { FiSliders } from "react-icons/fi";

function Navbar({
  light = false,
  showBack = false,
  showSearch = false,

  // Discover filter props
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
  useEffect(() => {
  if (!showFilter || !filterOpen) {
    return;
  }

  const handleClickOutside = (event) => {
    if (
      filterRef.current &&
      !filterRef.current.contains(event.target)
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
  const handleSeasonSelect = (season) => {
    if (setSelectedSeason) {
      setSelectedSeason(season);
    }

    if (setFilterOpen) {
      setFilterOpen(false);
    }
  };

  return (
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
          <div className="navbar-filter" ref={filterRef}>
            <button
              type="button"
              className={`navbar-filter-trigger ${
                filterOpen ? "open" : ""
              }`}
              onClick={() =>
                setFilterOpen &&
                setFilterOpen(
                  (prev) => !prev
                )
              }
            >
              <FiSliders size={16} />

              <span>Filter</span>

              <span className="navbar-filter-chevron">
                {filterOpen ? "↑" : "↓"}
              </span>
            </button>

            <div
              className={`navbar-filter-panel ${
                filterOpen ? "open" : ""
              }`}
            >
              {seasons.map((season) => {
                const Icon = season.icon;

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
      src={light ? logoDark : logoLight}
      alt="Pomona Logo"
    />
  </Link>
) : (
  <img
    src={light ? logoDark : logoLight}
    alt="Pomona Logo"
  />
)}
        </div>
      </div>

      {/* ==============================
          CENTER SEARCH
      ============================== */}

      {showSearch && <FruitSearch />}

      {/* ==============================
          NAVIGATION
      ============================== */}

      <div className="navbar__links">
        <Link to="/">Home</Link>
        <Link to="/discover">
          Discover
        </Link>
        <Link to="/about">About</Link>
        <Link to="/newsletter">
          Newsletter
        </Link>
      </div>

      {/* ==============================
          AUTH
      ============================== */}

      <div className="navbar__auth">
        <Link
          to="/login"
          className="login-btn"
        >
          Login
        </Link>

        <Link
          to="/signup"
          className="signup-btn"
        >
          Sign Up
        </Link>
      </div>
    </motion.nav>
  );
}

export default Navbar;