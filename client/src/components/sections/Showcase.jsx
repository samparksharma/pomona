import "./Showcase.css";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import fruitBowl from "../../assets/images/fruit-bowl.png";

import orange from "../../assets/images/showcase/orange.png";
import strawberry from "../../assets/images/showcase/strawberry.png";
import blueberry from "../../assets/images/showcase/blueberry.png";
import mango from "../../assets/images/showcase/mango.png";
import cherry from "../../assets/images/showcase/cherry.png";
import fig from "../../assets/images/showcase/fig.png";
import pomegranate from "../../assets/images/showcase/pomegranate.png";
import grape from "../../assets/images/showcase/grape.png";

gsap.registerPlugin(ScrollTrigger);

const fruitCards = [
  {
    name: "Orange",
    latin: "Citrus sinensis",
    image: orange,
    className: "card-1",
  },
  {
    name: "Strawberry",
    latin: "Fragaria × ananassa",
    image: strawberry,
    className: "card-2",
  },
  {
    name: "Blueberry",
    latin: "Vaccinium corymbosum",
    image: blueberry,
    className: "card-3",
  },
  {
    name: "Mango",
    latin: "Mangifera indica",
    image: mango,
    className: "card-4",
  },
  {
    name: "Cherry",
    latin: "Prunus avium",
    image: cherry,
    className: "card-5",
  },
  {
    name: "Fig",
    latin: "Ficus carica",
    image: fig,
    className: "card-6",
  },
  {
    name: "Pomegranate",
    latin: "Punica granatum",
    image: pomegranate,
    className: "card-7",
  },
  {
    name: "Grape",
    latin: "Vitis vinifera",
    image: grape,
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
      gsap.set(heading, {
        y:480,
      });

      gsap.set(cards, {
        x: 0,
        y: 170,
        scale: 0.72,
        rotation: 0,
        opacity: 0,
      });

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

      // TITLE REVEAL
      timeline.to(heading, {
        y: -200,
        duration: 1.5,
        ease: "none",
      });

      // FIRST WAVE
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

      // SECOND WAVE
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

      // STORM
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

      // FINAL SCATTER
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
                <div className="showcase-card-image">
                  <img
                    src={fruit.image}
                    alt={fruit.name}
                    draggable="false"
                  />
                </div>

                <div className="showcase-card-info">
                  <span className="showcase-card-label">
                    Discover
                  </span>

                  <h3>
                    {fruit.name}
                  </h3>

                  <p>
                    {fruit.latin}
                  </p>
                </div>

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
            draggable="false"
          />
        </div>

      </div>
    </section>
  );
}

export default Showcase;