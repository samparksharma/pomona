const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");

const User = require("../models/User");
const Session = require("../models/Session");

const ACCESS_TOKEN_LIFETIME = "15m";

const REFRESH_TOKEN_LIFETIME =
  15 * 24 * 60 * 60 * 1000;

const EMAIL_VERIFICATION_LIFETIME =
  24 * 60 * 60 * 1000;

const VERIFICATION_WATCHER_LIFETIME =
  30 * 60 * 1000;

const PASSWORD_RESET_LIFETIME =
  15 * 60 * 1000;

const BREVO_API_URL =
  "https://api.brevo.com/v3";

const brevoHeaders = {
  "api-key": process.env.BREVO_API_KEY,
  "Content-Type": "application/json",
  Accept: "application/json",
};

// =========================================
// COOKIE OPTIONS
// =========================================

const getCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction
      ? "none"
      : "lax",
    path: "/",
  };
};

// =========================================
// TOKEN HELPERS
// =========================================

const createAccessToken = (
  userId,
  sessionId
) => {
  return jwt.sign(
    {
      userId,
      sessionId,
      type: "access",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_LIFETIME,
    }
  );
};

const createRandomToken = () => {
  return crypto
    .randomBytes(32)
    .toString("hex");
};

const createRefreshToken = () => {
  return crypto
    .randomBytes(64)
    .toString("hex");
};

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// =========================================
// SESSION
// =========================================

const createSession = async (userId) => {
  const refreshToken =
    createRefreshToken();

  const session =
    await Session.create({
      sessionTokenHash:
        hashToken(refreshToken),

      user: userId,

      expiresAt: new Date(
        Date.now() +
          REFRESH_TOKEN_LIFETIME
      ),
    });

  return {
    session,
    refreshToken,
  };
};

const setAuthCookies = (
  res,
  accessToken,
  refreshToken
) => {
  const options =
    getCookieOptions();

  res.cookie(
    "accessToken",
    accessToken,
    {
      ...options,
      maxAge: 15 * 60 * 1000,
    }
  );

  res.cookie(
    "refreshToken",
    refreshToken,
    {
      ...options,
      maxAge:
        REFRESH_TOKEN_LIFETIME,
    }
  );
};

const clearAuthCookies = (res) => {
  const options =
    getCookieOptions();

  res.clearCookie(
    "accessToken",
    options
  );

  res.clearCookie(
    "refreshToken",
    options
  );
};

// =========================================
// EMAIL
// =========================================

const sendEmail = async ({
  to,
  subject,
  htmlContent,
}) => {
  await axios.post(
    `${BREVO_API_URL}/smtp/email`,
    {
      sender: {
        email:
          process.env.BREVO_SENDER_EMAIL,

        name:
          process.env.BREVO_SENDER_NAME ||
          "Pomona",
      },

      to: [{ email: to }],

      subject,

      htmlContent,
    },
    {
      headers: brevoHeaders,
    }
  );
};

// =========================================
// CREATE VERIFICATION TOKENS
// =========================================

const prepareVerificationTokens = async (
  user
) => {
  const emailToken =
    createRandomToken();

  const watcherToken =
    createRandomToken();

  user.emailVerificationTokenHash =
    hashToken(emailToken);

  user.emailVerificationExpiresAt =
    new Date(
      Date.now() +
        EMAIL_VERIFICATION_LIFETIME
    );

  user.verificationWatcherTokenHash =
    hashToken(watcherToken);

  user.verificationWatcherExpiresAt =
    new Date(
      Date.now() +
        VERIFICATION_WATCHER_LIFETIME
    );

  await user.save();

  return {
    emailToken,
    watcherToken,
  };
};

// =========================================
// SEND VERIFICATION EMAIL
// =========================================

const sendVerificationEmail = async (
  user
) => {
  const {
    emailToken,
  } =
    await prepareVerificationTokens(
      user
    );

  const clientUrl = (
    process.env.CLIENT_URL ||
    "http://localhost:5173"
  ).replace(/\/$/, "");

  const verificationUrl =
    `${clientUrl}/verify-email?token=${encodeURIComponent(
      emailToken
    )}&email=${encodeURIComponent(
      user.email
    )}`;

  await sendEmail({
    to: user.email,

    subject:
      "Verify your Pomona account",

    htmlContent: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 560px;
        margin: 40px auto;
        padding: 40px;
        background: #111111;
        color: #fafaf8;
        border-radius: 20px;
      ">
        <div style="
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #888888;
          margin-bottom: 18px;
        ">
          Pomona
        </div>

        <h1 style="
          font-weight: 400;
          margin: 0 0 20px;
          font-size: 38px;
        ">
          Verify your email.
        </h1>

        <p style="
          color: #c8c8c8;
          line-height: 1.7;
          font-size: 15px;
        ">
          Thanks for joining Pomona.
          Click below to verify your email
          address.
        </p>

        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            margin-top: 20px;
            padding: 14px 24px;
            background: #fafaf8;
            color: #111111;
            border-radius: 999px;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
          "
        >
          Verify my email
        </a>

        <p style="
          margin-top: 30px;
          color: #777777;
          font-size: 12px;
          line-height: 1.6;
        ">
          This link expires in 24 hours.
          If you didn't create this account,
          you can safely ignore this email.
        </p>
      </div>
    `,
  });

  return {
    watcherToken:
      await getWatcherToken(user),
  };
};

// =========================================
// GET WATCHER TOKEN
// =========================================

const getWatcherToken = async (
  user
) => {
  /*
   * We don't store the raw watcher token.
   * To return it immediately after signup,
   * we generate a fresh token and replace the
   * previous hash.
   *
   * This helper is only used when resending.
   */

  const watcherToken =
    createRandomToken();

  user.verificationWatcherTokenHash =
    hashToken(watcherToken);

  user.verificationWatcherExpiresAt =
    new Date(
      Date.now() +
        VERIFICATION_WATCHER_LIFETIME
    );

  await user.save();

  return watcherToken;
};

// =========================================
// SIGNUP
// =========================================

const signup = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required.",
      });
    }

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    if (
      cleanName.length < 2 ||
      cleanName.length > 50
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be between 2 and 50 characters.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters.",
      });
    }

    const existingUser =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    const user =
      await User.create({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        emailVerified: false,
        lastLoginAt: null,
      });

    /*
     * Generate BOTH tokens here so the raw
     * watcher token can be returned to the
     * original signup tab.
     */

    const emailToken =
      createRandomToken();

    const watcherToken =
      createRandomToken();

    user.emailVerificationTokenHash =
      hashToken(emailToken);

    user.emailVerificationExpiresAt =
      new Date(
        Date.now() +
          EMAIL_VERIFICATION_LIFETIME
      );

    user.verificationWatcherTokenHash =
      hashToken(watcherToken);

    user.verificationWatcherExpiresAt =
      new Date(
        Date.now() +
          VERIFICATION_WATCHER_LIFETIME
      );

    await user.save();

    try {
      const clientUrl = (
        process.env.CLIENT_URL ||
        "http://localhost:5173"
      ).replace(/\/$/, "");

      const verificationUrl =
        `${clientUrl}/verify-email?token=${encodeURIComponent(
          emailToken
        )}&email=${encodeURIComponent(
          user.email
        )}`;

      await sendEmail({
        to: user.email,

        subject:
          "Verify your Pomona account",

        htmlContent: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: 40px auto;
            padding: 40px;
            background: #111111;
            color: #fafaf8;
            border-radius: 20px;
          ">
            <div style="
              font-size: 11px;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #888888;
              margin-bottom: 18px;
            ">
              Pomona
            </div>

            <h1 style="
              font-weight: 400;
              margin: 0 0 20px;
              font-size: 38px;
            ">
              Verify your email.
            </h1>

            <p style="
              color: #c8c8c8;
              line-height: 1.7;
              font-size: 15px;
            ">
              Thanks for joining Pomona.
              Click below to verify your
              email address.
            </p>

            <a
              href="${verificationUrl}"
              style="
                display: inline-block;
                margin-top: 20px;
                padding: 14px 24px;
                background: #fafaf8;
                color: #111111;
                border-radius: 999px;
                text-decoration: none;
                font-size: 13px;
                font-weight: 600;
              "
            >
              Verify my email
            </a>

            <p style="
              margin-top: 30px;
              color: #777777;
              font-size: 12px;
            ">
              This link expires in 24 hours.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      await User.findByIdAndDelete(
        user._id
      );

      console.error(
        "Verification email error:",
        emailError.response?.data ||
          emailError.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Account could not be created. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,

      message:
        "Account created. Check your email to verify your account.",

      requiresEmailVerification: true,

      verificationWatcherToken:
        watcherToken,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Signup error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong during signup.",
    });
  }
};

// =========================================
// VERIFICATION STATUS
// =========================================
// Called by the ORIGINAL signup tab.
// This endpoint does not require the normal
// auth cookies because the user doesn't have
// an authenticated session yet.

const getVerificationStatus =
  async (req, res) => {
    try {
      const token =
        req.query.token;

      if (!token) {
        return res.status(400).json({
          success: false,
          message:
            "Verification watcher token is required.",
        });
      }

      const user =
        await User.findOne({
          verificationWatcherTokenHash:
            hashToken(token),

          verificationWatcherExpiresAt: {
            $gt: new Date(),
          },
        });

      if (!user) {
        return res.status(410).json({
          success: false,
          status: "expired",
          message:
            "Verification session expired.",
        });
      }

      if (!user.emailVerified) {
        return res.status(200).json({
          success: true,
          status: "pending",
        });
      }

      /*
       * Verification completed.
       * Exchange the watcher token for a
       * normal authenticated Pomona session.
       */

      const {
        session,
        refreshToken,
      } =
        await createSession(
          user._id
        );

      const accessToken =
        createAccessToken(
          user._id.toString(),
          session._id.toString()
        );

      setAuthCookies(
        res,
        accessToken,
        refreshToken
      );

      // Single-use watcher token.
      user.verificationWatcherTokenHash =
        null;

      user.verificationWatcherExpiresAt =
        null;

      user.lastLoginAt =
        new Date();

      await user.save();

      return res.status(200).json({
        success: true,
        status: "verified",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(
        "Verification status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Could not check verification status.",
      });
    }
  };

// =========================================
// VERIFY EMAIL
// =========================================

const verifyEmail = async (
  req,
  res
) => {
  try {
    const {
      token,
      email,
    } = req.query;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid verification link.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: cleanEmail,
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This verification link is invalid or expired.",
      });
    }

    // Already verified.
    // This is useful if the user refreshes
    // or clicks the same link again.
    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        alreadyVerified: true,
        message:
          "Your email is already verified. You can close this tab.",
      });
    }

    const tokenHash =
      hashToken(token);

    const matchingUser =
      await User.findOne({
        _id: user._id,

        emailVerificationTokenHash:
          tokenHash,

        emailVerificationExpiresAt: {
          $gt: new Date(),
        },
      });

    if (!matchingUser) {
      return res.status(400).json({
        success: false,
        message:
          "This verification link is invalid or expired.",
      });
    }

    matchingUser.emailVerified =
      true;

    matchingUser.emailVerificationTokenHash =
      null;

    matchingUser.emailVerificationExpiresAt =
      null;

    await matchingUser.save();

    /*
     * IMPORTANT:
     * Do NOT create the auth session here.
     * The original signup tab will detect the
     * verification and create the session.
     */

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully. You can close this tab.",
    });
  } catch (error) {
    console.error(
      "Verify email error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not verify your email.",
    });
  }
};

// =========================================
// RESEND VERIFICATION
// =========================================

const resendVerification =
  async (req, res) => {
    try {
      const email =
        req.body.email
          ?.trim()
          .toLowerCase();

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required.",
        });
      }

      const user =
        await User.findOne({
          email,
        });

      if (
        !user ||
        user.emailVerified
      ) {
        return res.status(200).json({
          success: true,
          message:
            "If verification is required, a new email has been sent.",
        });
      }

      const emailToken =
        createRandomToken();

      const watcherToken =
        createRandomToken();

      user.emailVerificationTokenHash =
        hashToken(emailToken);

      user.emailVerificationExpiresAt =
        new Date(
          Date.now() +
            EMAIL_VERIFICATION_LIFETIME
        );

      user.verificationWatcherTokenHash =
        hashToken(watcherToken);

      user.verificationWatcherExpiresAt =
        new Date(
          Date.now() +
            VERIFICATION_WATCHER_LIFETIME
        );

      await user.save();

      const clientUrl = (
        process.env.CLIENT_URL ||
        "http://localhost:5173"
      ).replace(/\/$/, "");

      const verificationUrl =
        `${clientUrl}/verify-email?token=${encodeURIComponent(
          emailToken
        )}&email=${encodeURIComponent(
          user.email
        )}`;

      await sendEmail({
        to: user.email,

        subject:
          "Verify your Pomona account",

        htmlContent: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: 40px auto;
            padding: 40px;
            background: #111111;
            color: #fafaf8;
            border-radius: 20px;
          ">
            <h1 style="
              font-weight: 400;
              font-size: 38px;
            ">
              Verify your email.
            </h1>

            <p style="
              color: #c8c8c8;
              line-height: 1.7;
            ">
              Click below to verify your
              Pomona account.
            </p>

            <a
              href="${verificationUrl}"
              style="
                display: inline-block;
                margin-top: 20px;
                padding: 14px 24px;
                background: #fafaf8;
                color: #111111;
                border-radius: 999px;
                text-decoration: none;
                font-size: 13px;
                font-weight: 600;
              "
            >
              Verify my email
            </a>
          </div>
        `,
      });

      return res.status(200).json({
        success: true,
        verificationWatcherToken:
          watcherToken,
        message:
          "A new verification email has been sent.",
      });
    } catch (error) {
      console.error(
        "Resend verification error:",
        error
      );

      return res.status(200).json({
        success: true,
        message:
          "If verification is required, a new email has been sent.",
      });
    }
  };

// =========================================
// LOGIN
// =========================================

const login = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: cleanEmail,
      });

    if (
      !user ||
      !user.isActive
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    user.lastLoginAt =
      new Date();

    await user.save();

    const {
      session,
      refreshToken,
    } =
      await createSession(
        user._id
      );

    const accessToken =
      createAccessToken(
        user._id.toString(),
        session._id.toString()
      );

    setAuthCookies(
      res,
      accessToken,
      refreshToken
    );

    return res.status(200).json({
      success: true,
      message:
        "Login successful.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong during login.",
    });
  }
};

// =========================================
// FORGOT PASSWORD
// =========================================

const forgotPassword = async (
  req,
  res
) => {
  try {
    const email =
      req.body.email
        ?.trim()
        .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required.",
      });
    }

    const user =
      await User.findOne({
        email,
        isActive: true,
      });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for this email, a reset link has been sent.",
      });
    }

    const rawToken =
      createRandomToken();

    user.passwordResetTokenHash =
      hashToken(rawToken);

    user.passwordResetExpiresAt =
      new Date(
        Date.now() +
          PASSWORD_RESET_LIFETIME
      );

    await user.save();

    const clientUrl = (
      process.env.CLIENT_URL ||
      "http://localhost:5173"
    ).replace(/\/$/, "");

    const resetUrl =
      `${clientUrl}/reset-password?token=${encodeURIComponent(
        rawToken
      )}&email=${encodeURIComponent(
        user.email
      )}`;

    await sendEmail({
      to: user.email,

      subject:
        "Reset your Pomona password",

      htmlContent: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 560px;
          margin: 40px auto;
          padding: 40px;
          background: #111111;
          color: #fafaf8;
          border-radius: 20px;
        ">
          <h1 style="
            font-weight: 400;
            font-size: 38px;
          ">
            Reset your password.
          </h1>

          <p style="
            color: #c8c8c8;
            line-height: 1.7;
          ">
            Click below to choose a new
            password.
          </p>

          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              margin-top: 20px;
              padding: 14px 24px;
              background: #fafaf8;
              color: #111111;
              border-radius: 999px;
              text-decoration: none;
              font-size: 13px;
              font-weight: 600;
            "
          >
            Reset my password
          </a>

          <p style="
            margin-top: 30px;
            color: #777777;
            font-size: 12px;
          ">
            This link expires in 15 minutes.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "If an account exists for this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(200).json({
      success: true,
      message:
        "If an account exists for this email, a reset link has been sent.",
    });
  }
};

// =========================================
// RESET PASSWORD
// =========================================

const resetPassword = async (
  req,
  res
) => {
  try {
    const {
      token,
      email,
      password,
    } = req.body;

    if (
      !token ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: cleanEmail,

        passwordResetTokenHash:
          hashToken(token),

        passwordResetExpiresAt: {
          $gt: new Date(),
        },

        isActive: true,
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This password reset link is invalid or expired.",
      });
    }

    user.password =
      await bcrypt.hash(
        password,
        12
      );

    user.passwordChangedAt =
      new Date();

    user.passwordResetTokenHash =
      null;

    user.passwordResetExpiresAt =
      null;

    await user.save();

    await Session.updateMany(
      {
        user: user._id,
        revokedAt: null,
      },
      {
        revokedAt: new Date(),
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please log in again.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not reset your password.",
    });
  }
};

// =========================================
// DELETE ACCOUNT
// =========================================

const deleteAccount = async (
  req,
  res
) => {
  try {
    const {
      password,
    } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message:
          "Password is required to delete your account.",
      });
    }

    const user =
      await User.findById(
        req.user.userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Incorrect password.",
      });
    }

    await Session.updateMany(
      {
        user: user._id,
        revokedAt: null,
      },
      {
        revokedAt: new Date(),
      }
    );

    await User.findByIdAndDelete(
      user._id
    );

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message:
        "Your account has been deleted.",
    });
  } catch (error) {
    console.error(
      "Delete account error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not delete your account.",
    });
  }
};

// =========================================
// REFRESH SESSION
// =========================================

const refreshSession = async (
  req,
  res
) => {
  try {
    const refreshToken =
      req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message:
          "Refresh session not found.",
      });
    }

    const session =
      await Session.findOne({
        sessionTokenHash:
          hashToken(refreshToken),
      }).populate("user");

    if (!session) {
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        message:
          "Invalid refresh session.",
      });
    }

    if (
      session.revokedAt ||
      session.expiresAt <=
        new Date() ||
      !session.user ||
      !session.user.isActive
    ) {
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        message:
          "Refresh session expired.",
      });
    }

    const newRefreshToken =
      createRefreshToken();

    session.sessionTokenHash =
      hashToken(
        newRefreshToken
      );

    session.expiresAt =
      new Date(
        Date.now() +
          REFRESH_TOKEN_LIFETIME
      );

    await session.save();

    const newAccessToken =
      createAccessToken(
        session.user._id.toString(),
        session._id.toString()
      );

    setAuthCookies(
      res,
      newAccessToken,
      newRefreshToken
    );

    return res.status(200).json({
      success: true,
      message:
        "Session refreshed.",
    });
  } catch (error) {
    console.error(
      "Refresh session error:",
      error
    );

    clearAuthCookies(res);

    return res.status(401).json({
      success: false,
      message:
        "Could not refresh session.",
    });
  }
};

// =========================================
// LOGOUT
// =========================================

const logout = async (
  req,
  res
) => {
  try {
    const refreshToken =
      req.cookies.refreshToken;

    if (refreshToken) {
      await Session.findOneAndUpdate(
        {
          sessionTokenHash:
            hashToken(
              refreshToken
            ),
          revokedAt: null,
        },
        {
          revokedAt: new Date(),
        }
      );
    }

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message:
        "Logged out successfully.",
    });
  } catch (error) {
    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message:
        "Logged out successfully.",
    });
  }
};

// =========================================
// CURRENT USER
// =========================================

const getCurrentUser = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user.userId
      ).select("-password");

    if (
      !user ||
      !user.isActive
    ) {
      return res.status(401).json({
        success: false,
        message:
          "User is not authenticated.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Could not retrieve user.",
    });
  }
};

module.exports = {
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
};