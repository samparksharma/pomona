import "./Navbar.css";
import logoLight from "../../assets/images/logo.svg";
import logoDark from "../../assets/images/logo-dark.svg";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar({ light = false }) {
    
  return (
    <motion.nav
  className={`navbar ${light ? "navbar-light" : ""}`}
  initial={{
    opacity: 0,
    y: -18,
    filter: "blur(8px)",
  }}
  animate={{
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  }}
  transition={{
    delay: 1.0,
    duration: 0.7,
    ease: [0.22, 1, 0.36, 1],
  }}
>
      {/* Left */}
      <div className="navbar__logo">
        
        <Link to="/">
        <img
  src={light ? logoDark : logoLight}
  alt="Pomona Logo"
/>
        </Link>
      </div>

{/* Center */}
<div className="navbar__links">
        <Link to="/">Home</Link>
        <Link to="/discover">Discover</Link>
        <Link to="/about">About</Link>
        <Link to="/newsletter">Newsletter</Link>
      </div>

{/* Right */}
<div className="navbar__auth">
        <Link to="/login" className="login-btn">
          Login
        </Link>

        <Link to="/signup" className="signup-btn">
          Sign Up
        </Link>
      </div>
   
    </motion.nav>
  );
}

export default Navbar;