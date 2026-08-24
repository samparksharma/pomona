const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

const getAllowedOrigins = () => {
  const configuredOrigins =
    process.env.CLIENT_URLS || "";

  const origins = configuredOrigins
    .split(",")
    .map((origin) =>
      origin.trim().replace(/\/$/, "")
    )
    .filter(Boolean);

  // Always allow local development.
  if (
    !origins.includes(
      "http://localhost:5173"
    )
  ) {
    origins.push(
      "http://localhost:5173"
    );
  }

  return origins;
};

const csrfProtection = (
  req,
  res,
  next
) => {
  // Safe requests don't change
  // server state.
  if (
    SAFE_METHODS.has(req.method)
  ) {
    return next();
  }

  const origin = req
    .get("origin")
    ?.replace(/\/$/, "");

  const allowedOrigins =
    getAllowedOrigins();

  // During local development,
  // Postman/curl may not send an
  // Origin header.
  if (
    !origin &&
    process.env.NODE_ENV !==
      "production"
  ) {
    return next();
  }

  if (
    !origin ||
    !allowedOrigins.includes(origin)
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Forbidden request origin.",
      code:
        "CSRF_ORIGIN_REJECTED",
    });
  }

  return next();
};

module.exports = csrfProtection;