const Fruit = require("../models/Fruit");
const axios = require("axios");

const {
  generateFruitData,
} = require("../services/geminiService");

const {
  searchWikimediaImages,
} = require("../services/wikimediaService");


// =====================================================
// GET ALL FRUITS - SEEDED RANDOM ORDER
// =====================================================

const getAllFruits = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const seed =
      String(req.query.seed || "default");

    const skip = (page - 1) * limit;

    const total =
      await Fruit.countDocuments();

    const fruits =
      await Fruit.find().lean();

    // -----------------------------------------
    // DETERMINISTIC SEEDED SHUFFLE
    // -----------------------------------------

    const hashString = (value) => {
      let hash = 0;

      for (let i = 0; i < value.length; i++) {
        hash =
          (hash << 5) -
          hash +
          value.charCodeAt(i);

        hash |= 0;
      }

      return Math.abs(hash);
    };

    fruits.sort((a, b) => {
      const aHash = hashString(
        `${seed}-${a._id}`
      );

      const bHash = hashString(
        `${seed}-${b._id}`
      );

      return aHash - bHash;
    });

    const paginatedFruits =
      fruits.slice(
        skip,
        skip + limit
      );

    res.status(200).json({
      fruits: paginatedFruits,
      currentPage: page,
      totalPages: Math.ceil(
        total / limit
      ),
      totalFruits: total,
    });
  } catch (error) {
    console.error(
      "Failed to fetch fruits:",
      error
    );

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
          "User-Agent":
            "Pomona/1.0 (Educational Project)",
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
            "User-Agent":
              "Pomona/1.0 (Educational Project)",
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

      const aStarts =
        aName.startsWith(lowerQuery);

      const bStarts =
        bName.startsWith(lowerQuery);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return aName.localeCompare(bName);
    });

    res.status(200).json(
      fruits.slice(0, 8)
    );
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
    // VALIDATE INPUT
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

    // Escape regex characters so an unusual fruit name
    // cannot accidentally behave like a regex pattern.
    const escapedFruitName =
      fruitName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const existingFruit =
      await Fruit.findOne({
        name: {
          $regex: `^${escapedFruitName}$`,
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
    // 3. ASK GEMINI TO GENERATE POMONA CONTENT
    // -----------------------------------------------

    let aiData;

    try {
      aiData =
        await generateFruitData(fruitName);

      console.log(
        `Gemini generated content for: ${fruitName}`
      );
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
    // 4. FETCH WIKIMEDIA USING SCIENTIFIC NAME
    // -----------------------------------------------

    let wikiImages = [];

    try {
      wikiImages =
        await searchWikimediaImages(
          fruitName,
          aiData.latinName ||
            wikiData.title ||
            "",
          10
        );

      console.log(
        `Wikimedia returned ${wikiImages.length} images for ${fruitName}`
      );
    } catch (imageError) {
      console.error(
        "Wikimedia image search failed:",
        imageError.message
      );

      // Image failure should NOT prevent the fruit
      // from being created.
      wikiImages = [];
    }

    // -----------------------------------------------
    // 5. BUILD DATABASE DOCUMENT
    // -----------------------------------------------

    const wikiHeroImage =
      wikiData.thumbnail?.source || "";

    const fallbackHeroImage =
      wikiImages[0]?.url || "";

    const heroImage =
      wikiHeroImage || fallbackHeroImage;

    const galleryImages = [
      ...(heroImage ? [heroImage] : []),

      ...wikiImages
        .map((image) => image.url)
        .filter(
          (url) => url && url !== heroImage
        )
        .slice(0, 7),
    ];

    const fruitData = {
      // ---------------------------------------------
      // BASIC INFORMATION
      // ---------------------------------------------

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
        aiData.originHistory?.originRegion ||
        "",

      overview:
        wikiData.extract || "",

      wikipediaTitle:
        wikiData.title || fruitName,

      // ---------------------------------------------
      // ORIGIN & HISTORY
      // ---------------------------------------------

      originHistory: {
        summary:
          aiData.originHistory?.summary ||
          "",

        detailedHistory:
          aiData.originHistory
            ?.detailedHistory || "",

        originRegion:
          aiData.originHistory
            ?.originRegion || "",

        historicalSpread:
          aiData.originHistory
            ?.historicalSpread || "",

        culturalImportance:
          aiData.originHistory
            ?.culturalImportance || "",
      },

      // ---------------------------------------------
      // IMAGES
      // ---------------------------------------------

      heroImage,

      gallery: galleryImages,

      // For now these are selected from the
      // best Wikimedia results. Later we can make
      // dedicated searches for historical/maps.
      originImages:
        wikiImages
          .slice(1, 4)
          .map((image) => image.url),

      historicalImages:
        wikiImages
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

      harvest: {
      description:
      aiData.harvest?.description || "",

      seasons:
       Array.isArray(aiData.harvest?.seasons)
       ? aiData.harvest.seasons
       : [],

      months:
       Array.isArray(aiData.harvest?.months)
       ? aiData.harvest.months
       : [],
},

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
      // OPTIONAL / FUTURE
      // ---------------------------------------------

      healthBenefits: [],

      storage: "",

      tags: [],
    };

    // -----------------------------------------------
    // 6. SAVE TO MONGODB
    // -----------------------------------------------

    const newFruit =
      await Fruit.create(fruitData);

    console.log(
      `New fruit created: ${newFruit.name}`
    );

    // -----------------------------------------------
    // 7. RETURN NEW FRUIT
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