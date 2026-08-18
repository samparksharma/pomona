const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

const getAllowedOrigin = () => {
  return (
    process.env.CLIENT_URL ||
    "http://localhost:5173"
  ).replace(/\/$/, "");
};

const csrfProtection = (req, res, next) => {
  // Safe requests don't change server state.
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.get("origin");
  const allowedOrigin = getAllowedOrigin();

  // During local development, Postman/curl may not
  // send an Origin header. Allow that for development.
  if (
    !origin &&
    process.env.NODE_ENV !== "production"
  ) {
    return next();
  }

  if (!origin || origin !== allowedOrigin) {
    return res.status(403).json({
      success: false,
      message: "Forbidden request origin.",
      code: "CSRF_ORIGIN_REJECTED",
    });
  }

  return next();
};

module.exports = csrfProtection;