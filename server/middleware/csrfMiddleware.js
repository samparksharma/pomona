const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

const getAllowedOrigins = () => {
  return (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) =>
      origin.trim().replace(/\/$/, "")
    )
    .filter(Boolean);
};

const csrfProtection = (req, res, next) => {
  // Safe requests don't change server state.
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req
    .get("origin")
    ?.replace(/\/$/, "");

  const allowedOrigins = getAllowedOrigins();

  // During local development, tools like
  // Postman/curl may not send an Origin header.
  if (
    !origin &&
    process.env.NODE_ENV !== "production"
  ) {
    return next();
  }

  // Reject requests whose origin isn't allowed.
  if (
    !origin ||
    !allowedOrigins.includes(origin)
  ) {
    return res.status(403).json({
      success: false,
      message: "Forbidden request origin.",
      code: "CSRF_ORIGIN_REJECTED",
    });
  }

  return next();
};

module.exports = csrfProtection;