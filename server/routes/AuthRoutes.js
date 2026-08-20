const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  deleteAccount,
  refreshSession,
  logout,
  getCurrentUser,
} = require("../controllers/AuthController");

const protect = require(
  "../middleware/authMiddleware"
);

const {
  authLimiter,
  refreshLimiter,
} = require(
  "../middleware/rateLimitMiddleware"
);

router.post(
  "/signup",
  authLimiter,
  signup
);

router.post(
  "/login",
  authLimiter,
  login
);

router.get(
  "/verify-email",
  verifyEmail
);

router.post(
  "/resend-verification",
  authLimiter,
  resendVerification
);

router.post(
  "/forgot-password",
  authLimiter,
  forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  resetPassword
);

router.post(
  "/refresh",
  refreshLimiter,
  refreshSession
);

router.post(
  "/logout",
  logout
);

router.delete(
  "/account",
  protect,
  deleteAccount
);

router.get(
  "/me",
  protect,
  getCurrentUser
);

module.exports = router;