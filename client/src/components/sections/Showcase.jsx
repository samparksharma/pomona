import "./Showcase.css";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import fruitBowl from "../../assets/images/fruit-bowl.png";

gsap.registerPlugin(ScrollTrigger);

const fruitCards = [
  {
    name: "Orange",
    latin: "Citrus sinensis",
    className: "card-1",
  },
  {
    name: "Strawberry",
    latin: "Fragaria × ananassa",
    className: "card-2",
  },
  {
    name: "Blueberry",
    latin: "Vaccinium corymbosum",
    className: "card-3",
  },
  {
    name: "Mango",
    latin: "Mangifera indica",
    className: "card-4",
  },
  {
    name: "Cherry",
    latin: "Prunus avium",
    className: "card-5",
  },
  {
    name: "Fig",
    latin: "Ficus carica",
    className: "card-6",
  },
  {
    name: "Pomegranate",
    latin: "Punica granatum",
    className: "card-7",
  },
  {
    name: "Grape",
    latin: "Vitis vinifera",
    className: "card-8",
  },
];

function Showcase() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const bowlRef = useRef(null);
  const cardsRef = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const bowl = bowlRef.current;
    const cards = cardsRef.current.filter(Boolean);

    if (!section || !heading || !bowl) {
      return;
    }

    const ctx = gsap.context(() => {
      // ---------------------------------------------
      // INITIAL STATES
      // ---------------------------------------------

      gsap.set(heading, {
        y: 420,
      });

      gsap.set(cards, {
        x: 0,
        y: 170,
        scale: 0.72,
        rotation: 0,
        opacity: 0,
      });

      // ---------------------------------------------
      // MASTER SCROLL TIMELINE
      // ---------------------------------------------

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=1800",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // ---------------------------------------------
      // PHASE 1
      // TITLE EMERGES
      // ---------------------------------------------

      timeline.to(
        heading,
        {
          y: -280,
          duration: 1.5,
          ease: "none",
        }
      );

      // ---------------------------------------------
      // PHASE 2
      // FIRST WAVE OF CARDS
      // ---------------------------------------------

      timeline.to(
        cards[0],
        {
          x: -430,
          y: -40,
          rotation: -10,
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.55"
      );

      timeline.to(
        cards[1],
        {
          x: 420,
          y: -20,
          rotation: 9,
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.45"
      );

      timeline.to(
        cards[2],
        {
          x: -350,
          y: -260,
          rotation: -7,
          scale: 0.95,
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
        },
        "-=0.5"
      );

      // ---------------------------------------------
      // PHASE 3
      // SECOND WAVE
      // ---------------------------------------------

      timeline.to(
        cards[3],
        {
          x: 365,
          y: -250,
          rotation: 8,
          scale: 0.95,
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
        },
        "-=0.35"
      );

      timeline.to(
        cards[4],
        {
          x: -500,
          y: 160,
          rotation: 11,
          scale: 0.9,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.35"
      );

      timeline.to(
        cards[5],
        {
          x: 500,
          y: 140,
          rotation: -12,
          scale: 0.9,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.4"
      );

      // ---------------------------------------------
      // PHASE 4
      // STORM
      // ---------------------------------------------

      timeline.to(
        cards[6],
        {
          x: -250,
          y: -340,
          rotation: -15,
          scale: 0.82,
          opacity: 0.9,
          duration: 0.45,
          ease: "power2.out",
        },
        "-=0.25"
      );

      timeline.to(
        cards[7],
        {
          x: 260,
          y: -360,
          rotation: 14,
          scale: 0.82,
          opacity: 0.9,
          duration: 0.45,
          ease: "power2.out",
        },
        "-=0.4"
      );

      // ---------------------------------------------
      // PHASE 5
      // CARDS FLY AWAY
      // ---------------------------------------------

      timeline.to(
        cards,
        {
          x: (index) =>
            index % 2 === 0
              ? -700 - index * 20
              : 700 + index * 20,

          y: (index) =>
            index % 2 === 0
              ? -250 - index * 25
              : 240 + index * 20,

          rotation: (index) =>
            index % 2 === 0
              ? -20 - index * 2
              : 20 + index * 2,

          scale: 0.72,

          opacity: 0,

          duration: 1.25,

          ease: "power2.inOut",
        },
        "+=0.15"
      );

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

        {/* ======================================
            TITLE
        ====================================== */}

        <div
          ref={headingRef}
          className="showcase-title"
        >
          Discover Beyond
          <br />
          The Ordinary.
        </div>

        {/* ======================================
            FRUIT CARDS
        ====================================== */}

        <div className="showcase-card-layer">
          {fruitCards.map(
            (fruit, index) => (
              <div
                key={fruit.name}
                ref={(element) => {
                  cardsRef.current[index] =
                    element;
                }}
                className={`showcase-card ${fruit.className}`}
              >
                <span className="showcase-card-label">
                  Explore
                </span>

                <h3>
                  {fruit.name}
                </h3>

                <p>
                  {fruit.latin}
                </p>

                <span className="showcase-card-arrow">
                  →
                </span>
              </div>
            )
          )}
        </div>

        {/* ======================================
            BOWL
        ====================================== */}

        <div
          ref={bowlRef}
          className="showcase-bowl"
        >
          <img
            src={fruitBowl}
            alt="Ancient Greek fruit bowl"
          />
        </div>

      </div>
    </section>
  );
}

export default Showcase;