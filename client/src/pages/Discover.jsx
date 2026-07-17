import "./Discover.css";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import SearchBar from "../components/discover/SearchBar";
import MasonryGrid from "../components/discover/MasonryGrid";

function Discover() {
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

          <MasonryGrid />

        </section>

      </main>
    </>
  );
}

export default Discover;