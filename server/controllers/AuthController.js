const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// =========================================
// CREATE JWT
// =========================================

const createToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// =========================================
// SIGNUP
// =========================================

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // -----------------------------
    // VALIDATE INPUT
    // -----------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    // -----------------------------
    // CHECK EMAIL
    // -----------------------------

    const existingUser = await User.findOne({
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

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // -----------------------------
    // CREATE USER
    // -----------------------------

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

    // -----------------------------
    // CREATE JWT
    // -----------------------------

    const token = createToken(
      user._id.toString()
    );

    // -----------------------------
    // STORE JWT IN HTTPONLY COOKIE
    // -----------------------------

    res.cookie("token", token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge:
        7 * 24 * 60 * 60 * 1000,
    });

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

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
    const { email, password } = req.body;

    // -----------------------------
    // VALIDATE INPUT
    // -----------------------------

    if (!email || !password) {
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

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
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
        message: "Invalid email or password.",
      });
    }

    // -----------------------------
    // CREATE JWT
    // -----------------------------

    const token = createToken(
      user._id.toString()
    );

    // -----------------------------
    // STORE JWT
    // -----------------------------

    res.cookie("token", token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge:
        7 * 24 * 60 * 60 * 1000,
    });

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong during login.",
    });
  }
};

// =========================================
// LOGOUT
// =========================================

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

// =========================================
// GET CURRENT USER
// =========================================

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
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
      message: "Could not retrieve user.",
    });
  }
};

// =========================================
// EXPORT
// =========================================

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
};