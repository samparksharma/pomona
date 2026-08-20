const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");

const User = require("../models/User");
const Session = require("../models/Session");

// =========================================
// CONFIG
// =========================================

const ACCESS_TOKEN_LIFETIME = "15m";

const REFRESH_TOKEN_LIFETIME =
  15 * 24 * 60 * 60 * 1000;

const EMAIL_VERIFICATION_LIFETIME =
  24 * 60 * 60 * 1000; // 24 hours

const PASSWORD_RESET_LIFETIME =
  15 * 60 * 1000; // 15 minutes

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
    sameSite: isProduction ? "none" : "lax",
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

const createRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

const createOneTimeToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

const createSession = async (userId) => {
  const refreshToken =
    createRefreshToken();

  const sessionTokenHash =
    hashToken(refreshToken);

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_LIFETIME
  );

  const session =
    await Session.create({
      sessionTokenHash,
      user: userId,
      expiresAt,
    });

  return {
    session,
    refreshToken,
  };
};

// =========================================
// COOKIE HELPERS
// =========================================

const setAuthCookies = (
  res,
  accessToken,
  refreshToken
) => {
  const options = getCookieOptions();

  res.cookie("accessToken", accessToken, {
    ...options,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...options,
    maxAge: REFRESH_TOKEN_LIFETIME,
  });
};

const clearAuthCookies = (res) => {
  const options = getCookieOptions();

  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
};

// =========================================
// SEND EMAIL
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
        email: process.env.BREVO_SENDER_EMAIL,
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
// EMAIL VERIFICATION
// =========================================

const sendVerificationEmail = async (
  user
) => {
  const rawToken = createOneTimeToken();

  user.emailVerificationTokenHash =
    hashToken(rawToken);

  user.emailVerificationExpiresAt =
    new Date(
      Date.now() +
        EMAIL_VERIFICATION_LIFETIME
    );

  await user.save();

  const clientUrl = (
    process.env.CLIENT_URL ||
    "http://localhost:5173"
  ).replace(/\/$/, "");

  const verificationUrl =
    `${clientUrl}/verify-email?token=${encodeURIComponent(
      rawToken
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
          color: #888;
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
          Click the button below to verify
          your email address.
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
          color: #777;
          font-size: 12px;
          line-height: 1.6;
        ">
          This link expires in 24 hours.
          If you didn't create this account,
          you can ignore this email.
        </p>
      </div>
    `,
  });
};

// =========================================
// SIGNUP
// =========================================

const signup = async (req, res) => {
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

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be at least 2 characters.",
      });
    }

    if (cleanName.length > 50) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be 50 characters or less.",
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
      await bcrypt.hash(password, 12);

    const user =
      await User.create({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        lastLoginAt: null,
        emailVerified: false,
      });

    // Send verification email.
    // If email delivery fails, remove the
    // newly-created account so we don't leave
    // a broken account behind.
    try {
      await sendVerificationEmail(user);
    } catch (emailError) {
      await User.findByIdAndDelete(user._id);

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
        "Account created. Please check your email to verify your account.",
      requiresEmailVerification: true,
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
// LOGIN
// =========================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      !email ||
      !password
    ) {
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

    // New accounts must verify email.
    // Existing legacy accounts without the
    // field remain compatible.
    

    user.lastLoginAt =
      new Date();

    await user.save();

    const {
      session,
      refreshToken,
    } = await createSession(
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

    const tokenHash =
      hashToken(token);

    const user =
      await User.findOne({
        email: cleanEmail,
        emailVerificationTokenHash:
          tokenHash,
        emailVerificationExpiresAt: {
          $gt: new Date(),
        },
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This verification link is invalid or expired.",
      });
    }

    // ---------------------------------------
    // VERIFY EMAIL
    // ---------------------------------------

    user.emailVerified = true;

    user.emailVerificationTokenHash =
      null;

    user.emailVerificationExpiresAt =
      null;

    user.lastLoginAt = new Date();

    await user.save();

    // ---------------------------------------
    // CREATE AUTH SESSION
    // ---------------------------------------

    const {
      session,
      refreshToken,
    } = await createSession(
      user._id
    );

    const accessToken =
      createAccessToken(
        user._id.toString(),
        session._id.toString()
      );

    // ---------------------------------------
    // LOG USER IN AUTOMATICALLY
    // ---------------------------------------

    setAuthCookies(
      res,
      accessToken,
      refreshToken
    );

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully. You're now logged in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
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
// RESEND VERIFICATION EMAIL
// =========================================

const resendVerification = async (
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
        message:
          "Email is required.",
      });
    }

    const user =
      await User.findOne({
        email,
      });

    // Don't reveal whether an account exists.
    if (
      !user ||
      user.emailVerified
    ) {
      return res.status(200).json({
        success: true,
        message:
          "If the account exists and requires verification, a verification email has been sent.",
      });
    }

    await sendVerificationEmail(user);

    return res.status(200).json({
      success: true,
      message:
        "If the account exists and requires verification, a verification email has been sent.",
    });
  } catch (error) {
    console.error(
      "Resend verification error:",
      error
    );

    return res.status(200).json({
      success: true,
      message:
        "If the account exists and requires verification, a verification email has been sent.",
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
    const email = req.body.email
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

    // Always return the same response.
    // This prevents account enumeration.
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for that email, a password reset email has been sent.",
      });
    }

    const rawToken =
      createOneTimeToken();

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
          <div style="
            font-size: 11px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #888;
            margin-bottom: 18px;
          ">
            Pomona
          </div>

          <h1 style="
            font-weight: 400;
            margin: 0 0 20px;
            font-size: 38px;
          ">
            Reset your password.
          </h1>

          <p style="
            color: #c8c8c8;
            line-height: 1.7;
            font-size: 15px;
          ">
            We received a request to reset
            your Pomona password.
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
            color: #777;
            font-size: 12px;
          ">
            This link expires in 15 minutes.
            If you didn't request this,
            you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "If an account exists for that email, a password reset email has been sent.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    // Still return generic response.
    return res.status(200).json({
      success: true,
      message:
        "If an account exists for that email, a password reset email has been sent.",
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

    const tokenHash =
      hashToken(token);

    const user =
      await User.findOne({
        email: cleanEmail,
        passwordResetTokenHash:
          tokenHash,
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
      await bcrypt.hash(password, 12);

    user.passwordChangedAt =
      new Date();

    user.passwordResetTokenHash =
      null;

    user.passwordResetExpiresAt =
      null;

    await user.save();

    // Revoke every existing session.
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
        "Could not reset password.",
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

    // Revoke all sessions first.
    await Session.updateMany(
      {
        user: user._id,
        revokedAt: null,
      },
      {
        revokedAt: new Date(),
      }
    );

    // Remove account.
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

    const sessionTokenHash =
      hashToken(refreshToken);

    const session =
      await Session.findOne({
        sessionTokenHash,
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
      session.expiresAt <= new Date() ||
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
            hashToken(refreshToken),
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
// GET CURRENT USER
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
    console.error(
      "Get current user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not retrieve user.",
    });
  }
};

// =========================================
// EXPORT
// =========================================

module.exports = {
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
};