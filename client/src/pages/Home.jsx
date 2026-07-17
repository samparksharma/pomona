import Navbar from "../components/layout/Navbar";
import Explore from "../components/sections/Explore";
import Hero from "../components/sections/Hero";
import Showcase from "../components/sections/Showcase";
import FloatingBowl from "../components/3d/FloatingBowl";

function Home() {
  return (
    <>
      <Navbar />

      <FloatingBowl />

      <Hero />
      <Explore />
      <Showcase />
    </>
  );
}

export default Home;