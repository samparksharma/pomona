import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { useEffect } from "react";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import About from "./pages/About";
import FruitDetails from "./pages/FruitDetails";
import Newsletter from "./pages/Newsletter";

import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";

import SmoothScroll from "./components/layout/SmoothScroll";

import NewsletterConfirmed from "./pages/NewsletterConfirmed";

function AppContent() {
  const location = useLocation();

  const backgroundLocation =
    location.state?.backgroundLocation;

  useEffect(() => {
    const isHome =
      location.pathname === "/";

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
      <Routes
        location={
          backgroundLocation ||
          location
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
          path="/fruit/:id"
          element={<FruitDetails />}
        />

        <Route
          path="/newsletter"
          element={<Newsletter />}
        />

        {/* EMAIL VERIFICATION */}

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        {/* PASSWORD RESET */}

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
      </Routes>

       <Route
  path="/newsletter/confirmed"
  element={<NewsletterConfirmed />}
/>

      {backgroundLocation && (
        <Routes>
          <Route
            path="/fruit/:id"
            element={
              <div
                className="fruit-details-overlay"
                data-lenis-prevent
              >
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