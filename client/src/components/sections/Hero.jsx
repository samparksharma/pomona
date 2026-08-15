import "./Hero.css";
import { motion } from "framer-motion";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import heroImage from "../../assets/images/pomona-hero.png";

gsap.registerPlugin(ScrollTrigger);

function Hero() {
  const heroRef = useRef(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const content = contentRef.current;

    if (!hero || !content) return;

    const ctx = gsap.context(() => {
      const background = hero.querySelector(
        ".home-hero-background"
      );

      // ---------------------------------------------
      // Background parallax
      // ---------------------------------------------

      if (background) {
        gsap.to(background, {
          yPercent: 10,
          scale: 1.04,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // ---------------------------------------------
      // Content parallax
      // ---------------------------------------------

      gsap.to(content, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // ---------------------------------------------
      // Soft hero exit
      // ---------------------------------------------

      gsap.to(hero, {
        scale: 0.97,
        opacity: 0.94,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "55% top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, hero);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="home-hero"
    >
      {/* -----------------------------------------
          BACKGROUND
      ----------------------------------------- */}

      <div
        className="home-hero-background"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />

      {/* -----------------------------------------
          CONTENT
      ----------------------------------------- */}

      <div
        ref={contentRef}
        className="home-hero-content"
      >
        <div className="home-hero-left">

          <motion.h1
            className="home-hero-title"
            initial={{
              opacity: 0,
              y: 50,
              rotateX: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: 0,
            }}
            transition={{
              delay: 0.35,
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Discover <br />
            Every Fruit.
          </motion.h1>

          <motion.p
            className="home-hero-subtitle"
            initial={{
              opacity: 0,
              x: -40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.6,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Nature's encyclopedia,
            beautifully reimagined.
          </motion.p>

          <motion.button
            className="home-hero-btn"
            initial={{
              opacity: 0,
              y: 15,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.9,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Discover →
          </motion.button>

        </div>

        <div className="home-hero-right" />
      </div>
    </section>
  );
}

export default Hero;