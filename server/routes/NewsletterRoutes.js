const express = require("express");

const router = express.Router();

const {
  subscribeToNewsletter,
  getNewsletterStatus,
  unsubscribeFromNewsletter,
} = require("../controllers/NewsletterController");

const protect = require("../middleware/authMiddleware");

const {
  newsletterLimiter,
} = require("../middleware/rateLimitMiddleware");

// =========================================
// PUBLIC SUBSCRIBE
// =========================================
// Anyone can subscribe to the newsletter.
// Double opt-in is handled by Brevo.

router.post(
  "/subscribe",
  newsletterLimiter,
  subscribeToNewsletter
);

// =========================================
// AUTHENTICATED NEWSLETTER STATUS
// =========================================
// Only the logged-in user can check their own
// newsletter subscription status.

router.get(
  "/status",
  protect,
  getNewsletterStatus
);

// =========================================
// AUTHENTICATED UNSUBSCRIBE
// =========================================
// Only the logged-in user's own subscription
// can be changed.

router.post(
  "/unsubscribe",
  protect,
  newsletterLimiter,
  unsubscribeFromNewsletter
);

module.exports = router;