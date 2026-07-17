import "./Hero.css";
import { motion } from "framer-motion";

import heroImage from "../../assets/images/pomona-hero.png";

function Hero() {
  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="hero-content">

        <div className="hero-left">

          <motion.h1
            className="hero-title"
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
            className="hero-subtitle"
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
            Nature's encyclopedia, beautifully reimagined.
          </motion.p>

          <motion.button
            className="hero-btn"
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

       <div className="hero-right"></div>

      </div>
    </section>
  );
}

export default Hero;