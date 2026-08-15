import "./Explore.css";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";

import skullBase from "../../assets/images/explore/skull-base.png";
import skullBotanical from "../../assets/images/explore/skull-botanical.png";

function Explore() {
  const skullStageRef = useRef(null);

  // ===================================================
  // CURSOR REVEAL
  // ===================================================

  const handleMouseMove = (event) => {
    const stage = skullStageRef.current;

    if (!stage) return;

    const rect = stage.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    stage.style.setProperty(
      "--reveal-x",
      `${x}px`
    );

    stage.style.setProperty(
      "--reveal-y",
      `${y}px`
    );
  };

  const handleMouseEnter = () => {
    skullStageRef.current?.style.setProperty(
      "--reveal-opacity",
      "1"
    );
  };

  const handleMouseLeave = () => {
    skullStageRef.current?.style.setProperty(
      "--reveal-opacity",
      "0"
    );
  };

  // ===================================================
  // LEVITATION
  // ===================================================

  useEffect(() => {
    const skull = skullStageRef.current;

    if (!skull) return;

    const float = gsap.to(skull, {
      y: -30,
      rotation: 1,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      float.kill();
    };
  }, []);

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <section className="explore">

      {/* =========================================
          SKULL / INTERACTIVE ART
      ========================================= */}

      <div className="explore-left">

        {/* Entrance animation */}
        <motion.div
          className="explore-skull-reveal"
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.35,
          }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
        >

          {/* Floating skull */}
          <div
            ref={skullStageRef}
            className="explore-skull-stage"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >

            {/* Base skull */}
            <img
              className="explore-skull explore-skull-base"
              src={skullBase}
              alt=""
              draggable="false"
            />

            {/* Botanical skull */}
            <img
              className="explore-skull explore-skull-botanical"
              src={skullBotanical}
              alt=""
              draggable="false"
            />

            {/* Hover hint */}
            <div className="explore-skull-hint">
              Move your cursor
            </div>

          </div>

        </motion.div>

      </div>

      {/* =========================================
          TEXT
      ========================================= */}

      <div className="explore-right">

        <motion.h2
          className="explore-title"
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.8,
          }}
        >
          Everything <br />
          about every fruit.
        </motion.h2>

        <motion.p
          className="explore-text"
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.2,
            duration: 0.8,
          }}
        >
          Discover nutrition, origins, seasons,
          history, scientific names, cultivation,
          and beautiful imagery— all thoughtfully
          organized in one place.
        </motion.p>

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.4,
            duration: 0.6,
          }}
        >
          <Link
            to="/about"
            className="explore-btn"
          >
            Our Story →
          </Link>
        </motion.div>

      </div>

    </section>
  );
}

export default Explore;