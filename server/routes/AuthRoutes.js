const express = require("express");

const router = express.Router();

const {
  signup,
  getVerificationStatus,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  resetPassword,
  deleteAccount,
  refreshSession,
  logout,
  getCurrentUser,
} = require(
  "../controllers/AuthController"
);

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

router.get(
  "/verification-status",
   getVerificationStatus
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
  "/login",
  authLimiter,
  login
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