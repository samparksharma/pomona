const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const csrfProtection = require("./middleware/csrfMiddleware");

const app = express();

app.set("trust proxy", 1);

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());

// Read allowed frontend origins from CLIENT_URL.
// Example:
// CLIENT_URL=http://localhost:5173,https://pomonaa.vercel.app

const allowedOrigins = (
  process.env.CLIENT_URL || ""
)
  .split(",")
  .map((origin) =>
    origin.trim().replace(/\/$/, "")
  )
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header
      // such as server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.use(csrfProtection);

// =====================================================
// ROUTES
// =====================================================

const fruitRoutes = require("./routes/FruitRoutes");
const newsletterRoutes = require("./routes/NewsletterRoutes");
const authRoutes = require("./routes/AuthRoutes");

app.use("/api/fruits", fruitRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/auth", authRoutes);

// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  res.send("Welcome to Pomona API 🍎");
});

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server is running on port ${PORT}`
  );
});