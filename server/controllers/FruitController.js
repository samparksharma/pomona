const Fruit = require("../models/Fruit");
const axios=require("axios");

const getAllFruits = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const fruits = await Fruit.find()
      .skip(skip)
      .limit(limit);

    const total = await Fruit.countDocuments();

    res.status(200).json({
      fruits,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalFruits: total,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFruitById = async (req, res) => {
  try {
    const fruit = await Fruit.findById(req.params.id);

    if (!fruit) {
      return res.status(404).json({
        message: "Fruit not found",
      });
    }

    res.status(200).json(fruit);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFruitDetails = async (req, res) => {
  try {
    const fruit = await Fruit.findById(req.params.id);

    if (!fruit) {
      return res.status(404).json({
        message: "Fruit not found",
      });
    }

    // detail 

    const wikiResponse = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        fruit.name
      )}`,
      {
        headers: {
          "User-Agent": "Pomona/1.0 (Educational Project)",
          Accept: "application/json",
        },
      }
    );

    // save db

    res.status(200).json({
      fruit,
      wikipedia: wikiResponse.data,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createFruit = async (req, res) => {
  try {

    const fruitData = { ...req.body };

    try {

      const wikiResponse = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          fruitData.name
        )}`,
        {
          headers: {
            "User-Agent": "Pomona/1.0 (Educational Project)",
            Accept: "application/json",
          },
        }
      );

      fruitData.wikipediaTitle = wikiResponse.data.title;

      if (wikiResponse.data.thumbnail?.source) {

        fruitData.heroImage = wikiResponse.data.thumbnail.source;

        fruitData.gallery = [
          wikiResponse.data.thumbnail.source,
        ];

      }

    } catch (wikiError) {

      console.log("Wikipedia image not found.");

    }

    const fruit = await Fruit.create(fruitData);

    res.status(201).json(fruit);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



const searchFruits = async (req, res) => {
  try {
    const { q } = req.query;

    const fruits = await Fruit.find({
      name: {
        $regex: q,
        $options: "i",
      },
    }).limit(8);

    res.json(fruits);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Search failed",
    });
  }
};



module.exports = {
  getAllFruits,
  createFruit,
  getFruitById,
  searchFruits,
  getFruitDetails,
};