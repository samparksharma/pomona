import {
  useEffect,
  useState,
} from "react";

import Navbar from "../components/layout/Navbar";
import Explore from "../components/sections/Explore";
import Hero from "../components/sections/Hero";
import Showcase from "../components/sections/Showcase";
import Footer from "../components/sections/Footer";
import PomonaSection from "../components/sections/PomonaSection";

function Home() {
  const [showScrollToast, setShowScrollToast] =
    useState(false);

  useEffect(() => {
    const hasSeenScrollHint =
      sessionStorage.getItem(
        "pomonaScrollHintSeen"
      );

    if (hasSeenScrollHint) {
      return;
    }

    const showTimer = window.setTimeout(() => {
      setShowScrollToast(true);

      sessionStorage.setItem(
        "pomonaScrollHintSeen",
        "true"
      );
    }, 1200);

    const hideTimer = window.setTimeout(() => {
      setShowScrollToast(false);
    }, 6200);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      <Navbar />

      <Hero />
      <Explore />
      <PomonaSection />
      <Showcase />
      <Footer />

      {showScrollToast && (
        <div
          className="pomona-scroll-toast"
          role="status"
          aria-live="polite"
        >
          <span className="pomona-scroll-toast-dot" />

          <span>
            Scroll gently to get the full
            experience :)
          </span>
        </div>
      )}
    </>
  );
}

export default Home;