import "./Discover.css";
import discoverBg from "../assets/images/discover-bg.png";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  FiSun,
  FiSunrise,
  FiCloud,
  FiSliders,
} from "react-icons/fi";

import { TbSnowflake } from "react-icons/tb";

import Navbar from "../components/layout/Navbar";
import SearchBar from "../components/discover/SearchBar";
import MasonryGrid from "../components/discover/MasonryGrid";
import FruitGenerationLoading from "../components/discover/FruitGenerationLoading";

// =====================================================
// SEASONS
// =====================================================

const seasons = [
  {
    name: "All",
    icon: FiSliders,
  },
  {
    name: "Spring",
    icon: FiSunrise,
  },
  {
    name: "Summer",
    icon: FiSun,
  },
  {
    name: "Autumn",
    icon: FiCloud,
  },
  {
    name: "Winter",
    icon: TbSnowflake,
  },
];

function Discover() {
  const navigate = useNavigate();

  // ===================================================
  // NORMAL DISCOVER DATA
  // ===================================================

  const [fruits, setFruits] = useState([]);

  const [randomSeed] = useState(
    () => Math.random().toString(36).slice(2)
  );

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // ===================================================
  // SEARCH DATA
  // ===================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // ===================================================
  // SEASON FILTER
  // ===================================================

  const [selectedSeason, setSelectedSeason] =
    useState("All");

  const [filterOpen, setFilterOpen] = useState(false);

  // ===================================================
  // AI / FRUIT CREATION
  // ===================================================

  const [creatingFruit, setCreatingFruit] = useState(false);

  const loader = useRef(null);

  // ===================================================
  // FETCH NORMAL FRUITS
  // ===================================================

  const fetchFruits = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/api/fruits?page=${page}&limit=15&seed=${randomSeed}`
      );

      console.log(
        "PAGE:",
        page,
        response.data.fruits.map(
          (fruit) => fruit.name
        )
      );

      setFruits((prev) => [
        ...prev,
        ...response.data.fruits,
      ]);

      if (page >= response.data.totalPages) {
        setHasMore(false);
      }
    } catch (error) {
      console.error(
        "Failed to fetch fruits:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // FIND / CREATE FRUIT
  // ===================================================

  const handleSearchSubmit = async () => {
    const query = searchQuery.trim();

    if (!query || creatingFruit) {
      return;
    }

    // -----------------------------------------------
    // EXISTING FRUIT
    // -----------------------------------------------

    if (searchResults.length > 0) {
      const fruit = searchResults[0];

      setSearchQuery("");
      setSearchResults([]);

      navigate(`/fruit/${fruit._id}`);

      return;
    }

    // -----------------------------------------------
    // NEW FRUIT
    // -----------------------------------------------

    try {
      setCreatingFruit(true);

      const response = await axios.post(
        "http://localhost:5000/api/fruits/find-or-create",
        {
          name: query,
        }
      );

      const fruit = response.data.fruit;

      // Keep search visible and replace
      // the loading state with the new card.
      setSearchResults([fruit]);
    } catch (error) {
      console.error(
        "Failed to create/search fruit:",
        error
      );
    } finally {
      setCreatingFruit(false);
    }
  };

  // ===================================================
  // FETCH NORMAL FRUITS WHEN PAGE CHANGES
  // ===================================================

  useEffect(() => {
    if (
      searchQuery.trim() ||
      creatingFruit
    ) {
      return;
    }

    fetchFruits();
  }, [page]);

  // ===================================================
  // SEARCH MONGODB
  // ===================================================

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query || creatingFruit) {
      if (!query) {
        setSearchResults([]);
      }

      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/fruits/search?q=${encodeURIComponent(
            query
          )}`
        );

        if (!cancelled) {
          setSearchResults(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Discover search failed:",
            error
          );

          setSearchResults([]);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchQuery, creatingFruit]);

  // ===================================================
  // RESET PAGINATION
  // ===================================================

  useEffect(() => {
    if (
      searchQuery.trim() ||
      creatingFruit
    ) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [searchQuery, creatingFruit]);

  // ===================================================
  // INFINITE SCROLL
  // ===================================================

  useEffect(() => {
    if (
      !hasMore ||
      searchQuery.trim() ||
      creatingFruit
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            !loading &&
            hasMore
          ) {
            console.log("INTERSECTED");

            setPage((prev) => prev + 1);
          }
        },
        {
          threshold: 1,
        }
      );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [
    loading,
    hasMore,
    searchQuery,
    creatingFruit,
  ]);

  // ===================================================
  // BASE GRID DATA
  // ===================================================

  const displayedFruits =
    searchQuery.trim()
      ? searchResults
      : fruits;

  // ===================================================
  // SEASON FILTER
  // ===================================================

  const filteredFruits =
    selectedSeason === "All"
      ? displayedFruits
      : displayedFruits.filter((fruit) => {
          const fruitSeasons =
            fruit.harvest?.seasons;

          if (!Array.isArray(fruitSeasons)) {
            return false;
          }

          return fruitSeasons.some(
            (season) =>
              season.toLowerCase() ===
              selectedSeason.toLowerCase()
          );
        });

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>
      <Navbar
        light
        showFilter
        seasons={seasons}
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        logoLinksHome={false}
      />

      <main
        className="discover-page"
        style={{
          "--discover-bg": `url(${discoverBg})`,
        }}
      >
        {/* =========================================
            HERO
        ========================================= */}

        <section className="discover-hero">
          <motion.h1
            className="discover-title"
            initial={{
              opacity: 0,
              y: 35,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              delay: 0.35,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Discover Every Fruit.
          </motion.h1>

          <motion.p
            className="discover-subtitle"
            initial={{
              opacity: 0,
              y: 22,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.55,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Search through nature's most
            beautiful collection.
          </motion.p>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
          />
        </section>

        {/* =========================================
            CONTENT
        ========================================= */}

        <section className="discover-content">
          {creatingFruit ? (
            <FruitGenerationLoading />
          ) : searchQuery.trim() &&
            searchResults.length === 0 ? (
            <div className="search-empty">
              <p>
                No fruit found in the collection.
              </p>

              <span>
                Press Enter ↵ to discover it.
              </span>
            </div>
          ) : (
            <motion.div
              key={
                searchResults.length > 0
                  ? searchResults[0]?._id
                  : `grid-${selectedSeason}`
              }
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {filteredFruits.length > 0 ? (
                <MasonryGrid
                  fruits={filteredFruits}
                />
              ) : (
                <div className="search-empty">
                  <p>
                    No fruits found for{" "}
                    {selectedSeason}.
                  </p>

                  <span>
                    Try another season.
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* =======================================
              INFINITE SCROLL
          ======================================= */}

          {!searchQuery.trim() &&
            !creatingFruit &&
            hasMore && (
              <div
                ref={loader}
                style={{
                  height: "40px",
                }}
              />
            )}
        </section>
      </main>
    </>
  );
}

export default Discover;