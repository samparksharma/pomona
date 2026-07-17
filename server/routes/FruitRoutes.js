const express = require("express");

const router = express.Router();

const {
  getAllFruits,
  createFruit,
} = require("../controllers/FruitController");

router.get("/", getAllFruits);
router.post("/", createFruit);

module.exports = router;