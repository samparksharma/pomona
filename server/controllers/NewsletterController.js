const axios = require("axios");

const NewsletterSubscriber = require(
  "../models/NewsletterSubscriber"
);

const subscribeToNewsletter = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    // -----------------------------------------
    // VALIDATE
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
        message: "Please enter a valid email address.",
      });
    }

    // -----------------------------------------
    // CHECK MONGODB
    // -----------------------------------------

    const existingSubscriber =
      await NewsletterSubscriber.findOne({
        email,
      });

    if (existingSubscriber) {
      if (
        existingSubscriber.status === "active"
      ) {
        return res.status(409).json({
          success: false,
          message: "You're already subscribed.",
        });
      }

      // Re-subscribe previously unsubscribed user
      existingSubscriber.status = "active";
      await existingSubscriber.save();

      return res.status(200).json({
        success: true,
        message:
          "Welcome back! You're subscribed again.",
      });
    }

    // -----------------------------------------
    // CREATE CONTACT IN BREVO
    // -----------------------------------------

    const emailResponse = await axios.post(
  "https://api.brevo.com/v3/smtp/email",
  {
    sender: {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME || "Pomona",
    },

    to: [
      {
        email,
      },
    ],

    subject: "Thanks for subscribing to Pomona",

    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h1>You're in.</h1>
          <p>
            Thanks for subscribing. I'll let you know
            when something new is ready.
          </p>
        </body>
      </html>
    `,
  },
  {
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }
);

console.log(
  "Brevo email response:",
  emailResponse.data
);

    // -----------------------------------------
    // SAVE IN MONGODB
    // -----------------------------------------

    const subscriber =
      await NewsletterSubscriber.create({
        email,
      });

    return res.status(201).json({
      success: true,
      message: "You're subscribed!",
      subscriberId: subscriber._id,
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

module.exports = {
  subscribeToNewsletter,
};