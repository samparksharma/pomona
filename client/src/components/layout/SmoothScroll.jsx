import { useEffect } from "react";

import Lenis from "lenis";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function SmoothScroll({ children }) {
  useEffect(() => {
    // Respect reduced-motion preferences.
    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: false,

      // Lower duration makes the scroll feel
      // more responsive and less "heavy".
      duration: 0.55,

      smoothWheel: true,

      syncTouch: false,

      // Slightly more responsive interpolation.
      lerp: 0.09,
    });

    const updateScrollTrigger = () => {
      ScrollTrigger.update();
    };

    const update = (time) => {
      lenis.raf(time * 1000);
    };

    lenis.on(
      "scroll",
      updateScrollTrigger
    );

    gsap.ticker.add(update);

    // Don't force large frame jumps to catch up
    // aggressively after a temporary frame drop.
    gsap.ticker.lagSmoothing(1000, 60);

    return () => {
      lenis.off(
        "scroll",
        updateScrollTrigger
      );

      gsap.ticker.remove(update);

      lenis.destroy();
    };
  }, []);

  return children;
}

export default SmoothScroll;