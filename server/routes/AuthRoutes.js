const express = require("express");

const router = express.Router();



const {
  signup,
  login,
  logout,
  getCurrentUser,
} = require("../controllers/AuthController");

const protect = require(
  "../middleware/authMiddleware"
);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.get(  "/me",  protect, getCurrentUser);

module.exports = router;