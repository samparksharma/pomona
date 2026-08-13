const Fruit = require("../models/Fruit");
const axios = require("axios");

const {
  generateFruitData,
} = require("../services/geminiService");

const {
  searchWikimediaImages,
} = require("../services/wikimediaService");

// =====================================================
// GET ALL FRUITS
// =====================================================

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


// =====================================================
// GET FRUIT BY ID
// =====================================================

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


// =====================================================
// GET FRUIT DETAILS
// =====================================================

const getFruitDetails = async (req, res) => {
  try {
    const fruit = await Fruit.findById(req.params.id);

    if (!fruit) {
      return res.status(404).json({
        message: "Fruit not found",
      });
    }

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

    res.status(200).json({
      fruit,
      wikipedia: wikiResponse.data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// =====================================================
// CREATE FRUIT MANUALLY
// =====================================================

const createFruit = async (req, res) => {
  try {
    const fruitData = {
      ...req.body,
    };

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

      fruitData.wikipediaTitle =
        wikiResponse.data.title;

      if (wikiResponse.data.extract) {
        fruitData.overview =
          wikiResponse.data.extract;
      }

      if (wikiResponse.data.thumbnail?.source) {
        fruitData.heroImage =
          wikiResponse.data.thumbnail.source;

        fruitData.gallery = [
          wikiResponse.data.thumbnail.source,
        ];
      }
    } catch (wikiError) {
      console.log(
        "Wikipedia data could not be fetched."
      );
    }

    const fruit = await Fruit.create(fruitData);

    res.status(201).json(fruit);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// =====================================================
// SEARCH EXISTING FRUITS
// =====================================================

const searchFruits = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.json([]);
    }

    const query = q.trim();

    const fruits = await Fruit.find({
      name: {
        $regex: query,
        $options: "i",
      },
    }).limit(20);

    // Prefix matches first, then partial matches
    const lowerQuery = query.toLowerCase();

    fruits.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const aStarts = aName.startsWith(lowerQuery);
      const bStarts = bName.startsWith(lowerQuery);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return aName.localeCompare(bName);
    });

    res.status(200).json(fruits.slice(0, 8));
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Search failed",
    });
  }
};


// =====================================================
// FIND OR CREATE FRUIT
// =====================================================

const findOrCreateFruit = async (req, res) => {
  try {
    const { name } = req.body;

    // -----------------------------------------------
    // Validate input
    // -----------------------------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Fruit name is required",
      });
    }

    const fruitName = name.trim();

    // -----------------------------------------------
    // 1. CHECK MONGODB FIRST
    // -----------------------------------------------

    const existingFruit = await Fruit.findOne({
      name: {
        $regex: `^${fruitName}$`,
        $options: "i",
      },
    });

    if (existingFruit) {
      console.log(
        `Fruit found in database: ${existingFruit.name}`
      );

      return res.status(200).json({
        source: "database",
        fruit: existingFruit,
      });
    }

    // -----------------------------------------------
    // 2. FETCH FROM WIKIPEDIA
    // -----------------------------------------------

    let wikiData;

    try {
      const wikiResponse = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          fruitName
        )}`,
        {
          headers: {
            "User-Agent":
              "Pomona/1.0 (Educational Project)",
            Accept: "application/json",
          },
        }
      );

      wikiData = wikiResponse.data;

    } catch (wikiError) {
      console.log(
        "Wikipedia could not find this fruit:",
        fruitName
      );

      return res.status(404).json({
        message:
          "Fruit not found in Wikipedia",
      });
    }

    // -----------------------------------------------
// 2.5 FETCH WIKIMEDIA IMAGES
// -----------------------------------------------

const wikiImages =
  await searchWikimediaImages(
    fruitName,
    8
  );

    // -----------------------------------------------
    // 3. ASK GEMINI TO GENERATE POMONA CONTENT
    // -----------------------------------------------

    let aiData;

    try {
      const aiResponse =
        await generateFruitData(fruitName);

      // Gemini should return JSON.
      // Parse it if it comes back as a string.
      aiData =
        typeof aiResponse === "string"
          ? JSON.parse(aiResponse)
          : aiResponse;

    } catch (aiError) {
  console.error(
    "========== GEMINI ERROR =========="
  );

  console.error(aiError);

  console.error(
    "=================================="
  );

  return res.status(500).json({
    message:
      "Fruit found, but AI information generation failed",
  });
}

    // -----------------------------------------------
    // 4. BUILD DATABASE DOCUMENT
    // -----------------------------------------------

    const fruitData = {
      // Basic information
      name: fruitName,

      latinName:
  aiData.latinName || "",

family:
  aiData.family || "",

genus:
  aiData.genus || "",

species:
  aiData.species || "",

      origin:
        aiData.originHistory?.originRegion || "",

      // Wikipedia overview
      overview:
        wikiData.extract || "",

      wikipediaTitle:
        wikiData.title || fruitName,

      // ---------------------------------------------
      // ORIGIN & HISTORY
      // ---------------------------------------------

      originHistory: {
        summary:
          aiData.originHistory?.summary || "",

        detailedHistory:
          aiData.originHistory?.detailedHistory || "",

        originRegion:
          aiData.originHistory?.originRegion || "",

        historicalSpread:
          aiData.originHistory?.historicalSpread || "",

        culturalImportance:
          aiData.originHistory?.culturalImportance || "",
      },

      // ---------------------------------------------
      // IMAGES
      // ---------------------------------------------

     heroImage:
  wikiData.thumbnail?.source || "",

gallery: [
  ...(wikiData.thumbnail?.source
    ? [wikiData.thumbnail.source]
    : []),

  ...wikiImages
    .map((image) => image.url)
    .slice(0, 7),
],

originImages: wikiImages
  .slice(1, 4)
  .map((image) => image.url),

historicalImages: wikiImages
  .slice(4, 7)
  .map((image) => image.url),

mapImage: "",

      // ---------------------------------------------
      // DETAILED CONTENT
      // ---------------------------------------------

      nutrition:
        aiData.nutrition || "",

      growingConditions:
        aiData.growingConditions || "",

      harvest:
        aiData.harvest || "",

      diseases:
        aiData.diseases || "",

      companionPlants:
        aiData.companionPlants || "",

      cultivars:
        aiData.cultivars || "",

      // ---------------------------------------------
      // FACTS
      // ---------------------------------------------

      interestingFacts:
        Array.isArray(
          aiData.interestingFacts
        )
          ? aiData.interestingFacts
          : [],

      scientificFacts:
        Array.isArray(
          aiData.scientificFacts
        )
          ? aiData.scientificFacts
          : [],

      // ---------------------------------------------
      // FUTURE / OPTIONAL
      // ---------------------------------------------

      healthBenefits: [],

      storage: "",

      tags: [],
    };

    // -----------------------------------------------
    // 5. SAVE TO MONGODB
    // -----------------------------------------------

    const newFruit =
      await Fruit.create(fruitData);

    console.log(
      `New fruit created: ${newFruit.name}`
    );

    // -----------------------------------------------
    // 6. RETURN NEW FRUIT
    // -----------------------------------------------

    return res.status(201).json({
      source: "created",
      fruit: newFruit,
    });

  } catch (error) {
    console.log(
      "findOrCreateFruit error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getAllFruits,
  createFruit,
  getFruitById,
  searchFruits,
  getFruitDetails,
  findOrCreateFruit,
};