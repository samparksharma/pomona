import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import About from "./pages/About";
import Login from "./pages/Login";
import FruitDetails from "./pages/FruitDetails";
import Signup from "./pages/Signup";
import Newsletter from "./pages/Newsletter";
import { useEffect } from "react";
import SmoothScroll from "./components/layout/SmoothScroll";

function AppContent() {
  const location = useLocation();

  const backgroundLocation =
    location.state?.backgroundLocation;
useEffect(() => {
  const isHome = location.pathname === "/";

  document.body.classList.toggle(
    "home-route",
    isHome
  );

  return () => {
    document.body.classList.remove(
      "home-route"
    );
  };
}, [location.pathname]);
  return (
    <>
      {/* -----------------------------------------
          BACKGROUND ROUTES
      ----------------------------------------- */}

      <Routes
        location={
          backgroundLocation || location
        }
      >
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/discover"
          element={<Discover />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/fruit/:id"
          element={<FruitDetails />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/newsletter"
          element={<Newsletter />}
        />
      </Routes>

      {/* -----------------------------------------
          OVERLAY ROUTE
      ----------------------------------------- */}

      {backgroundLocation && (
        <Routes>
          <Route
            path="/fruit/:id"
            element={
              <div className="fruit-details-overlay" data-lenis-prevent >
                <FruitDetails />
              </div>
            }
          />
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <AppContent />
      </SmoothScroll>
    </BrowserRouter>
  );
}

export default App;