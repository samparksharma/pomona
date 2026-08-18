const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const Session = require("../models/Session");

// =========================================
// CONFIG
// =========================================

const ACCESS_TOKEN_LIFETIME = "15m";

const REFRESH_TOKEN_LIFETIME =
  15 * 24 * 60 * 60 * 1000;

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
// CREATE ACCESS JWT
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

// =========================================
// CREATE RANDOM REFRESH TOKEN
// =========================================

const createRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

// =========================================
// HASH SESSION TOKEN
// =========================================

const hashSessionToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// =========================================
// CREATE SESSION
// =========================================

const createSession = async (userId) => {
  const refreshToken =
    createRefreshToken();

  const sessionTokenHash =
    hashSessionToken(refreshToken);

  const expiresAt = new Date(
    Date.now() +
      REFRESH_TOKEN_LIFETIME
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
// SET AUTH COOKIES
// =========================================

const setAuthCookies = (
  res,
  accessToken,
  refreshToken
) => {
  const options = getCookieOptions();

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

// =========================================
// CLEAR AUTH COOKIES
// =========================================

const clearAuthCookies = (res) => {
  const options = getCookieOptions();

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
// SIGNUP
// =========================================

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // -----------------------------
    // VALIDATE INPUT
    // -----------------------------

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

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters.",
      });
    }

    // -----------------------------
    // CHECK EMAIL
    // -----------------------------

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

    // -----------------------------
    // HASH PASSWORD
    // -----------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    // -----------------------------
    // CREATE USER
    // -----------------------------

    const user =
      await User.create({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        lastLoginAt: new Date(),
      });

    // -----------------------------
    // CREATE SESSION
    // -----------------------------

    const {
      session,
      refreshToken,
    } = await createSession(
      user._id
    );

    // -----------------------------
    // CREATE ACCESS TOKEN
    // -----------------------------

    const accessToken =
      createAccessToken(
        user._id.toString(),
        session._id.toString()
      );

    // -----------------------------
    // SET COOKIES
    // -----------------------------

    setAuthCookies(
      res,
      accessToken,
      refreshToken
    );

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully.",
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

    // -----------------------------
    // VALIDATE
    // -----------------------------

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

    // -----------------------------
    // FIND USER
    // -----------------------------

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

    // -----------------------------
    // COMPARE PASSWORD
    // -----------------------------

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

    // -----------------------------
    // UPDATE LOGIN TIME
    // -----------------------------

    user.lastLoginAt =
      new Date();

    await user.save();

    // -----------------------------
    // CREATE SESSION
    // -----------------------------

    const {
      session,
      refreshToken,
    } = await createSession(
      user._id
    );

    // -----------------------------
    // CREATE ACCESS TOKEN
    // -----------------------------

    const accessToken =
      createAccessToken(
        user._id.toString(),
        session._id.toString()
      );

    // -----------------------------
    // SET COOKIES
    // -----------------------------

    setAuthCookies(
      res,
      accessToken,
      refreshToken
    );

    // -----------------------------
    // RESPONSE
    // -----------------------------

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
      hashSessionToken(
        refreshToken
      );

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

    // -----------------------------
    // CHECK SESSION
    // -----------------------------

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

    // -----------------------------
    // ROTATE REFRESH TOKEN
    // -----------------------------

    const newRefreshToken =
      createRefreshToken();

    const newHash =
      hashSessionToken(
        newRefreshToken
      );

    session.sessionTokenHash =
      newHash;

    session.expiresAt =
      new Date(
        Date.now() +
          REFRESH_TOKEN_LIFETIME
      );

    await session.save();

    // -----------------------------
    // CREATE NEW ACCESS TOKEN
    // -----------------------------

    const newAccessToken =
      createAccessToken(
        session.user._id.toString(),
        session._id.toString()
      );

    // -----------------------------
    // SET NEW COOKIES
    // -----------------------------

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
      const sessionTokenHash =
        hashSessionToken(
          refreshToken
        );

      await Session.findOneAndUpdate(
        {
          sessionTokenHash,
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
    console.error(
      "Logout error:",
      error
    );

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
  refreshSession,
  logout,
  getCurrentUser,
};