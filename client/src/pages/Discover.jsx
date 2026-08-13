import "./Discover.css";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import SearchBar from "../components/discover/SearchBar";
import MasonryGrid from "../components/discover/MasonryGrid";

function Discover() {

  const navigate = useNavigate();
  // -----------------------------------------
  // NORMAL DISCOVER DATA
  // -----------------------------------------

  const [fruits, setFruits] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // -----------------------------------------
  // SEARCH DATA
  // -----------------------------------------

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState([]);

  const loader = useRef(null);

  // -----------------------------------------
  // FETCH NORMAL FRUITS
  // -----------------------------------------

  const fetchFruits = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/api/fruits?page=${page}&limit=15`
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

      if (
        page >= response.data.totalPages
      ) {
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

  // find or fetch function implementation

 const handleSearchSubmit = async () => {
  const query = searchQuery.trim();

  if (!query) {
    return;
  }

  // -----------------------------------------
  // IF MONGO FOUND RESULTS
  // -----------------------------------------

  if (searchResults.length > 0) {
    // Open the first / best match.
    const fruit = searchResults[0];

    navigate(`/fruit/${fruit._id}`);

    return;
  }

  // -----------------------------------------
  // IF NOTHING WAS FOUND
  // FETCH / CREATE THE FRUIT
  // -----------------------------------------

  try {
    setLoading(true);

    const response = await axios.post(
      "http://localhost:5000/api/fruits/find-or-create",
      {
        name: query,
      }
    );

    const fruit = response.data.fruit;

    // Open newly created fruit
    navigate(`/fruit/${fruit._id}`);

  } catch (error) {
    console.error(
      "Failed to create/search fruit:",
      error
    );
  } finally {
    setLoading(false);
  }
};

  // -----------------------------------------
  // FETCH NORMAL FRUITS WHEN PAGE CHANGES
  // -----------------------------------------

  useEffect(() => {
    if (searchQuery.trim()) return;

    fetchFruits();
  }, [page]);

  // -----------------------------------------
  // SEARCH MONGODB
  // -----------------------------------------

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/fruits/search?q=${encodeURIComponent(
            query
          )}`
        );

        setSearchResults(response.data);
      } catch (error) {
        console.error(
          "Discover search failed:",
          error
        );

        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // -----------------------------------------
  // RESET PAGINATION WHEN SEARCH STARTS
  // -----------------------------------------

  useEffect(() => {
    if (searchQuery.trim()) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [searchQuery]);

  // -----------------------------------------
  // INFINITE SCROLL
  // -----------------------------------------

  useEffect(() => {
    if (
      !hasMore ||
      searchQuery.trim()
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

            setPage(
              (prev) => prev + 1
            );
          }
        },
        {
          threshold: 1,
        }
      );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () =>
      observer.disconnect();
  }, [
    loading,
    hasMore,
    searchQuery,
  ]);

  // -----------------------------------------
  // WHAT SHOULD THE GRID SHOW?
  // -----------------------------------------

  const displayedFruits =
    searchQuery.trim()
      ? searchResults
      : fruits;

  return (
    <>
      <Navbar light />

      <main className="discover-page">
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

        <section className="discover-content">
          {searchQuery.trim() &&
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
            <MasonryGrid
              fruits={displayedFruits}
            />
          )}

          {!searchQuery.trim() &&
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