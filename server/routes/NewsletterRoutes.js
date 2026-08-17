const express = require("express");

const router = express.Router();

const {
  subscribeToNewsletter,
  getNewsletterStatus,
  unsubscribeFromNewsletter,
} = require("../controllers/NewsletterController");

router.post(
  "/subscribe",
  subscribeToNewsletter
);

router.get(
  "/status",
  getNewsletterStatus
);

router.post(
  "/unsubscribe",
  unsubscribeFromNewsletter
);

module.exports = router;