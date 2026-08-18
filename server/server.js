const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const csrfProtection = require(
  "./middleware/csrfMiddleware"
);

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(csrfProtection);

const fruitRoutes = require("./routes/FruitRoutes");
const newsletterRoutes = require("./routes/NewsletterRoutes");
const authRoutes = require("./routes/AuthRoutes");

app.use("/api/fruits", fruitRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Pomona API 🍎");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});