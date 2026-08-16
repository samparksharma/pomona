import Navbar from "../components/layout/Navbar";
import Explore from "../components/sections/Explore";
import Hero from "../components/sections/Hero";
import Showcase from "../components/sections/Showcase";
import Footer from "../components/sections/Footer";
import FloatingBowl from "../components/3d/FloatingBowl";
import PomonaSection from "../components/sections/PomonaSection";
function Home() {
  return (
    <>
      <Navbar />

      {/* <FloatingBowl /> */}

      <Hero />
      <Explore />
      <PomonaSection/>
      <Showcase />
      <Footer/>
    </>
  );
}

export default Home;