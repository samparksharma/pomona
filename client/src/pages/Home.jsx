import Navbar from "../components/layout/Navbar";
import Explore from "../components/sections/Explore";
import Hero from "../components/sections/Hero";
import Showcase from "../components/sections/Showcase";
import Footer from "../components/sections/Footer";

import PomonaSection from "../components/sections/PomonaSection";
function Home() {
  return (
    <>
      <Navbar />

      

      <Hero />
      <Explore />
      <PomonaSection/>
      <Showcase />
      <Footer/>
    </>
  );
}

export default Home;