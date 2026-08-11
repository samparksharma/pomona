const express = require("express");

const router = express.Router();



const {
  getAllFruits,
  createFruit,
  getFruitById,
  searchFruits,
  getFruitDetails,
} = require("../controllers/FruitController");

router.get("/", getAllFruits);
router.get(  "/search",  searchFruits);
router.get("/:id/details", getFruitDetails);
router.get("/:id", getFruitById);
router.post("/", createFruit);
module.exports = router;