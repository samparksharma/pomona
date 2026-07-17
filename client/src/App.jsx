import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import About from "./pages/About";
import Login from "./pages/Login";
import FruitDetails from "./pages/FruitDetails";
import Signup from "./pages/Signup";
import Newsletter from "./pages/Newsletter";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/fruit/:name" element={<FruitDetails />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/newsletter" element={<Newsletter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;