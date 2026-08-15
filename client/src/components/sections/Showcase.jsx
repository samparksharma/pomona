import "./Showcase.css";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import fruitBowl from "../../assets/images/fruit-bowl.png";

gsap.registerPlugin(ScrollTrigger);

function Showcase() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const bowlRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const bowl = bowlRef.current;

    if (!section || !heading || !bowl) {
      return;
    }

    const ctx = gsap.context(() => {
      // -------------------------------------------------
      // Initial state
      // -------------------------------------------------

      gsap.set(heading, {
        y: 420,
      });

      // -------------------------------------------------
      // Scroll-scrubbed heading reveal
      // -------------------------------------------------

      gsap.to(heading, {
        y: -280,

        ease: "none",

        scrollTrigger: {
          trigger: section,

          start: "top top",
          end: "+=900",

          scrub: 1,

          pin: true,

          anticipatePin: 1,
        },
      });

      // Bowl stays visually anchored for now.
      gsap.set(bowl, {
        y: 0,
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="showcase"
    >
      <div className="showcase-stage">

        {/* -----------------------------------------
            TITLE
            This begins behind the bowl and travels
            upward with the user's scroll.
        ----------------------------------------- */}

        <div
          ref={headingRef}
          className="showcase-title"
        >
          Discover Beyond
          <br />
          The Ordinary.
        </div>

        {/* -----------------------------------------
            BOWL
        ----------------------------------------- */}

        <div
          ref={bowlRef}
          className="showcase-bowl"
        >
          <img
            src={fruitBowl}
            alt="Fruit bowl"
          />
        </div>

      </div>
    </section>
  );
}

export default Showcase;