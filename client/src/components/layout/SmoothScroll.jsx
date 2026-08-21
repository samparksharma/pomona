import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      duration: 0.8,
      smoothWheel: true,
      syncTouch: false,
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

    // Let GSAP handle temporary frame drops
    // instead of forcing every frame through.
    gsap.ticker.lagSmoothing(500, 33);

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