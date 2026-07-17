const Fruit = require("../models/Fruit");

const getAllFruits = async (req, res) => {
  try {
    const fruits = await Fruit.find();

    res.status(200).json(fruits);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createFruit = async (req, res) => {
  try {
    const fruit = await Fruit.create(req.body);

    res.status(201).json(fruit);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAllFruits,
  createFruit,
};