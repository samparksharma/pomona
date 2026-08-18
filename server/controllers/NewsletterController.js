const axios = require("axios");

const NewsletterSubscriber = require(
  "../models/NewsletterSubscriber"
);

const BREVO_API_URL = "https://api.brevo.com/v3";

const brevoHeaders = {
  "api-key": process.env.BREVO_API_KEY,
  "Content-Type": "application/json",
  Accept: "application/json",
};

// =========================================
// SUBSCRIBE — DOUBLE OPT-IN
// =========================================

const subscribeToNewsletter = async (
  req,
  res
) => {
  try {
    const email = req.body.email
      ?.trim()
      .toLowerCase();

    // -----------------------------------------
    // VALIDATE EMAIL
    // -----------------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    // -----------------------------------------
    // CHECK MONGODB
    // -----------------------------------------

    let subscriber =
      await NewsletterSubscriber.findOne({
        email,
      });

    // Already confirmed
    if (
      subscriber &&
      subscriber.status === "active"
    ) {
      return res.status(409).json({
        success: false,
        message: "You're already subscribed.",
      });
    }

    // -----------------------------------------
    // REQUEST BREVO DOUBLE OPT-IN
    // -----------------------------------------

    await axios.post(
      `${BREVO_API_URL}/contacts/doubleOptinConfirmation`,
      {
        email,

        includeListIds: [
          Number(process.env.BREVO_LIST_ID),
        ],

        templateId: Number(
          process.env.BREVO_DOI_TEMPLATE_ID
        ),

        redirectionUrl:
          process.env.BREVO_DOI_REDIRECT_URL,
      },
      {
        headers: brevoHeaders,
      }
    );

    // -----------------------------------------
    // CREATE / UPDATE LOCAL RECORD
    // -----------------------------------------

    if (!subscriber) {
      subscriber =
        await NewsletterSubscriber.create({
          email,
          status: "pending",
        });
    } else {
      subscriber.status = "pending";

      await subscriber.save();
    }

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------

    return res.status(201).json({
      success: true,
      status: "pending",
      message:
        "Check your email to confirm your subscription.",
    });
  } catch (error) {
    console.error(
      "Newsletter subscription error:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong. Please try again.",
    });
  }
};

// =========================================
// CHECK NEWSLETTER STATUS
// =========================================

const getNewsletterStatus = async (
  req,
  res
) => {
  try {
    const email = req.query.email
      ?.trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // -----------------------------------------
    // ASK BREVO FOR THE REAL CONTACT STATUS
    // -----------------------------------------

    try {
      const response = await axios.get(
        `${BREVO_API_URL}/contacts/${encodeURIComponent(
          email
        )}`,
        {
          headers: brevoHeaders,
        }
      );

      const listIds =
        response.data.listIds || [];

      const isSubscribed =
        listIds.includes(
          Number(process.env.BREVO_LIST_ID)
        );

      // Keep local database synchronized
      const subscriber =
        await NewsletterSubscriber.findOne({
          email,
        });

      if (subscriber) {
        subscriber.status =
          isSubscribed
            ? "active"
            : "unsubscribed";

        await subscriber.save();
      }

      return res.status(200).json({
        success: true,
        subscribed: isSubscribed,
      });
    } catch (brevoError) {
      // Brevo returns 404 when the contact doesn't exist.
      if (
        brevoError.response?.status === 404
      ) {
        return res.status(200).json({
          success: true,
          subscribed: false,
        });
      }

      throw brevoError;
    }
  } catch (error) {
    console.error(
      "Newsletter status error:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not check newsletter status.",
    });
  }
};

// =========================================
// UNSUBSCRIBE
// =========================================

const unsubscribeFromNewsletter = async (
  req,
  res
) => {
  try {
    const email = req.body.email
      ?.trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // -----------------------------------------
    // REMOVE FROM BREVO LIST
    // -----------------------------------------

    await axios.post(
      `${BREVO_API_URL}/contacts/lists/${
        process.env.BREVO_LIST_ID
      }/contacts/remove`,
      {
        emails: [email],
      },
      {
        headers: brevoHeaders,
      }
    );

    // -----------------------------------------
    // UPDATE LOCAL DATABASE
    // -----------------------------------------

    const subscriber =
      await NewsletterSubscriber.findOne({
        email,
      });

    if (subscriber) {
      subscriber.status = "unsubscribed";

      await subscriber.save();
    }

    return res.status(200).json({
      success: true,
      message:
        "You have been unsubscribed.",
    });
  } catch (error) {
    console.error(
      "Newsletter unsubscribe error:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while unsubscribing.",
    });
  }
};

// =========================================
// EXPORT
// =========================================

module.exports = {
  subscribeToNewsletter,
  getNewsletterStatus,
  unsubscribeFromNewsletter,
};