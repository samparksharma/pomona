const axios = require("axios");

const NewsletterSubscriber = require(
  "../models/NewsletterSubscriber"
);

const User = require("../models/User");

const BREVO_API_URL =
  "https://api.brevo.com/v3";

const brevoHeaders = {
  "api-key": process.env.BREVO_API_KEY,
  "Content-Type": "application/json",
  Accept: "application/json",
};

// =========================================
// SUBSCRIBE — PUBLIC + DOUBLE OPT-IN
// =========================================

const subscribeToNewsletter = async (
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
    // FIND LOCAL RECORD
    // -----------------------------------------

    let subscriber =
      await NewsletterSubscriber.findOne({
        email,
      });

    // -----------------------------------------
    // CHECK BREVO ACTUAL LIST MEMBERSHIP
    // -----------------------------------------

    let actuallySubscribed = false;

    try {
      const brevoResponse = await axios.get(
        `${BREVO_API_URL}/contacts/${encodeURIComponent(
          email
        )}`,
        {
          headers: brevoHeaders,
        }
      );

      const listIds =
        brevoResponse.data.listIds || [];

      actuallySubscribed =
        listIds.includes(
          Number(process.env.BREVO_LIST_ID)
        );
    } catch (brevoError) {
      if (
        brevoError.response?.status !== 404
      ) {
        throw brevoError;
      }
    }

    // -----------------------------------------
    // REALLY SUBSCRIBED?
    // -----------------------------------------

    if (actuallySubscribed) {
      if (subscriber) {
        subscriber.status = "active";
        await subscriber.save();
      }

      return res.status(409).json({
        success: false,
        subscribed: true,
        message:
          "You're already subscribed.",
      });
    }

    // -----------------------------------------
    // SEND DOUBLE OPT-IN EMAIL
    // -----------------------------------------

    await axios.post(
      `${BREVO_API_URL}/contacts/doubleOptinConfirmation`,
      {
        email,

        includeListIds: [
          Number(
            process.env.BREVO_LIST_ID
          ),
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
    // SAVE PENDING STATE
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

    return res.status(201).json({
      success: true,
      subscribed: false,
      pending: true,
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
// CHECK CURRENT USER NEWSLETTER STATUS
// =========================================

const getNewsletterStatus = async (
  req,
  res
) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("_id email");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User is not authenticated.",
      });
    }

    const email = user.email;

    const subscriber =
      await NewsletterSubscriber.findOne({
        email,
      });

    let isSubscribed = false;

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

      isSubscribed =
        listIds.includes(
          Number(process.env.BREVO_LIST_ID)
        );
    } catch (brevoError) {
      if (
        brevoError.response?.status !== 404
      ) {
        throw brevoError;
      }
    }

    // -----------------------------------------
    // SYNC LOCAL DATABASE
    // -----------------------------------------

    if (subscriber) {
      if (isSubscribed) {
        subscriber.status = "active";
      } else if (
        subscriber.status !== "pending"
      ) {
        subscriber.status = "unsubscribed";
      }

      await subscriber.save();
    }

    return res.status(200).json({
      success: true,
      subscribed: isSubscribed,
      pending:
        !isSubscribed &&
        subscriber?.status === "pending",
    });
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
// UNSUBSCRIBE — AUTHENTICATED USER ONLY
// =========================================

const unsubscribeFromNewsletter =
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user.userId
      ).select("_id email");

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "User is not authenticated.",
        });
      }

      const email = user.email;

      // ---------------------------------------
      // REMOVE FROM BREVO LIST
      // ---------------------------------------

      await axios.post(
        `${BREVO_API_URL}/contacts/lists/${process.env.BREVO_LIST_ID}/contacts/remove`,
        {
          emails: [email],
        },
        {
          headers: brevoHeaders,
        }
      );

      // ---------------------------------------
      // UPDATE LOCAL DATABASE
      // ---------------------------------------

      const subscriber =
        await NewsletterSubscriber.findOne({
          email,
        });

      if (subscriber) {
        subscriber.status =
          "unsubscribed";

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

module.exports = {
  subscribeToNewsletter,
  getNewsletterStatus,
  unsubscribeFromNewsletter,
};