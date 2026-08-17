const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Welcome to Pomona API 🍎");
});

// -----------------------------------------
// ROUTES
// -----------------------------------------

const fruitRoutes = require(
    "./routes/FruitRoutes"
);

const newsletterRoutes = require(
    "./routes/NewsletterRoutes"
);

app.use(
    "/api/fruits",
    fruitRoutes
);

app.use(
    "/api/newsletter",
    newsletterRoutes
);

// -----------------------------------------
// SERVER
// -----------------------------------------

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server is running on port ${PORT}`
    );
});