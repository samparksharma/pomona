import "./Discover.css";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../components/layout/Navbar";
import SearchBar from "../components/discover/SearchBar";
import MasonryGrid from "../components/discover/MasonryGrid";

function Discover() {
  //state
  const [fruits, setFruits] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loader = useRef(null);


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
  response.data.fruits.map(f => f.name)
);

    setFruits((prev) => [
      ...prev,
      ...response.data.fruits,
    ]);

    if (page >= response.data.totalPages) {
      setHasMore(false);
    }

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
  //fetch fruits when page load
  useEffect(() => {
  fetchFruits();
}, [page]);

useEffect(() => {
  if (!hasMore) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
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

  return () => observer.disconnect();
}, [loading, hasMore]);


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
  Search through nature's most beautiful collection.
</motion.p>
          <SearchBar />

        </section>

       <section className="discover-content">
  <MasonryGrid fruits={fruits} />

  {hasMore && (
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