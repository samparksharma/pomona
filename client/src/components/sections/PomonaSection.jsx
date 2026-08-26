import "./PomonaSection.css";
import { motion } from "framer-motion";
import { useLayoutEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import pomonaImage from "../../assets/images/pomona-section.webp";

gsap.registerPlugin(ScrollTrigger);

function PomonaSection() {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const leftTextRef = useRef(null);
  const rightTextRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const leftText = leftTextRef.current;
    const rightText = rightTextRef.current;

    if (
      !section ||
      !image ||
      !leftText ||
      !rightText
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      // =================================================
      // TEXT PARALLAX
      // =================================================

      gsap.to(leftText, {
        y: -55,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to(rightText, {
        y: 45,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // =================================================
      // IMAGE SCROLL PARALLAX
      // =================================================
      //
      // The image stays relatively contained so the full
      // artwork remains visible while still moving.
      //

      gsap.fromTo(
        image,
        {
          yPercent: -8,
          scale: 1.04,
        },
        {
          yPercent: 8,
          scale: 1.07,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.65,
          },
        }
      );

      // =================================================
      // MOUSE 3D TILT
      // =================================================

      const xTo = gsap.quickTo(
        image,
        "rotationY",
        {
          duration: 0.45,
          ease: "power3.out",
        }
      );

      const yTo = gsap.quickTo(
        image,
        "rotationX",
        {
          duration: 0.45,
          ease: "power3.out",
        }
      );

      const handleMouseMove = (event) => {
        const rect =
          image.getBoundingClientRect();

        const x =
          (event.clientX - rect.left) /
          rect.width;

        const y =
          (event.clientY - rect.top) /
          rect.height;

        // Keep the tilt noticeable without
        // turning the image into a card.
        const rotateY =
          (x - 0.5) * 8;

        const rotateX =
          (0.5 - y) * 6;

        xTo(rotateY);
        yTo(rotateX);
      };

      const handleMouseLeave = () => {
        xTo(0);
        yTo(0);
      };

      image.addEventListener(
        "mousemove",
        handleMouseMove
      );

      image.addEventListener(
        "mouseleave",
        handleMouseLeave
      );

      return () => {
        image.removeEventListener(
          "mousemove",
          handleMouseMove
        );

        image.removeEventListener(
          "mouseleave",
          handleMouseLeave
        );
      };
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="pomona-section"
    >
      {/* =========================================
          ARTWORK
      ========================================= */}

      <div
        ref={imageRef}
        className="pomona-section-image"
        style={{
          backgroundImage:
            `url(${pomonaImage})`,
        }}
      />

      {/* =========================================
          OVERLAY
      ========================================= */}

      <div className="pomona-section-overlay" />

      {/* =========================================
          LEFT TEXT
      ========================================= */}

      <motion.div
        ref={leftTextRef}
        className="
          pomona-section-text
          pomona-section-text-left
        "
        initial={{
          opacity: 0,
          x: -55,
        }}
        whileInView={{
          opacity: 1,
          x: 0,
        }}
        viewport={{
          once: false,
          amount: 0.35,
        }}
        transition={{
          duration: 0.85,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
      >
        Pomona, goddess
        <br />
        of orchards,
      </motion.div>

      {/* =========================================
          RIGHT TEXT
      ========================================= */}

      <motion.div
        ref={rightTextRef}
        className="
          pomona-section-text
          pomona-section-text-right
        "
        initial={{
          opacity: 0,
          x: 55,
        }}
        whileInView={{
          opacity: 1,
          x: 0,
        }}
        viewport={{
          once: false,
          amount: 0.35,
        }}
        transition={{
          delay: 0.12,
          duration: 0.85,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
      >
        offers you nature's
        <br />
        bloom in abundance.
      </motion.div>
    </section>
  );
}

export default PomonaSection;