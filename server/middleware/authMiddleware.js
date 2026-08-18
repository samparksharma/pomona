const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Session = require("../models/Session");

const protect = async (req, res, next) => {
  try {
    // =========================================
    // GET ACCESS TOKEN
    // =========================================

    const accessToken =
      req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
        code: "NO_ACCESS_TOKEN",
      });
    }

    // =========================================
    // VERIFY ACCESS JWT
    // =========================================

    let decoded;

    try {
      decoded = jwt.verify(
        accessToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access token expired.",
          code: "ACCESS_TOKEN_EXPIRED",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
        code: "INVALID_ACCESS_TOKEN",
      });
    }

    // =========================================
    // CHECK TOKEN TYPE
    // =========================================

    if (decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
        code: "INVALID_TOKEN_TYPE",
      });
    }

    if (!decoded.userId || !decoded.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
        code: "INVALID_TOKEN_PAYLOAD",
      });
    }

    // =========================================
    // CHECK SERVER-SIDE SESSION
    // =========================================

    const session = await Session.findOne({
      _id: decoded.sessionId,
      user: decoded.userId,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session is no longer valid.",
        code: "SESSION_NOT_FOUND",
      });
    }

    // =========================================
    // CHECK SESSION REVOCATION
    // =========================================

    if (session.revokedAt) {
      return res.status(401).json({
        success: false,
        message: "Session has been revoked.",
        code: "SESSION_REVOKED",
      });
    }

    // =========================================
    // CHECK SESSION EXPIRATION
    // =========================================

    if (
      session.expiresAt <= new Date()
    ) {
      return res.status(401).json({
        success: false,
        message: "Session has expired.",
        code: "SESSION_EXPIRED",
      });
    }

    // =========================================
    // CHECK USER
    // =========================================

    const user = await User.findById(
      decoded.userId
    ).select(
      "_id name email isActive"
    );

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated.",
        code: "USER_INACTIVE",
      });
    }

    // =========================================
    // ATTACH USER TO REQUEST
    // =========================================

    req.user = {
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      name: user.name,
      email: user.email,
    };

    // =========================================
    // CONTINUE
    // =========================================

    next();
  } catch (error) {
    console.error(
      "Auth middleware error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Authentication check failed.",
    });
  }
};

module.exports = protect;