const Fruit = require("../models/Fruit");
const axios = require("axios");

const {
  generateFruitData,
} = require("../services/geminiService");

const {
  searchWikimediaImages,
} = require("../services/wikimediaService");

const WIKIPEDIA_API =
  "https://en.wikipedia.org";

// =====================================================
// WIKIPEDIA HELPERS
// =====================================================

const wikiHeaders = {
  "User-Agent":
    "Pomona/1.0 (Educational Project)",
  Accept: "application/json",
};

// -----------------------------------------
// NORMALIZE USER SEARCH
// -----------------------------------------

const normalizeFruitQuery = (
  value = ""
) => {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /\b(fruit|fruits)\b/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
};

// -----------------------------------------
// GET WIKIPEDIA SUMMARY BY TITLE
// -----------------------------------------

const getWikipediaSummary = async (
  title
) => {
  const response = await axios.get(
    `${WIKIPEDIA_API}/api/rest_v1/page/summary/${encodeURIComponent(
      title
    )}`,
    {
      headers: wikiHeaders,
      timeout: 8000,
    }
  );

  return response.data;
};

// -----------------------------------------
// SEARCH WIKIPEDIA FOR BEST MATCH
// -----------------------------------------

const searchWikipediaTitle = async (
  query
) => {
  const response = await axios.get(
    `${WIKIPEDIA_API}/w/api.php`,
    {
      params: {
        action: "query",
        list: "search",
        srsearch: query,
        srlimit: 5,
        format: "json",
        formatversion: 2,
      },

      headers: wikiHeaders,

      timeout: 8000,
    }
  );

  const results =
    response.data?.query?.search ||
    [];

  if (!results.length) {
    return null;
  }

  return results[0].title;
};

// -----------------------------------------
// SMART WIKIPEDIA LOOKUP
// -----------------------------------------

const findWikipediaFruit = async (
  originalQuery
) => {
  const original =
    originalQuery.trim();

  const normalized =
    normalizeFruitQuery(original);

  const attempts = [];

  // 1. Exact user query
  if (original) {
    attempts.push(original);
  }

  // 2. Remove generic "fruit/fruits"
  if (
    normalized &&
    normalized !== original.toLowerCase()
  ) {
    attempts.push(normalized);
  }

  // ---------------------------------------
  // DIRECT PAGE LOOKUPS
  // ---------------------------------------

  for (const attempt of attempts) {
    try {
      const data =
        await getWikipediaSummary(
          attempt
        );

      if (data?.title) {
        return {
          data,
          searchedAs: attempt,
          exact: attempt === original,
        };
      }
    } catch (error) {
      // Continue to next fallback.
    }
  }

  // ---------------------------------------
  // WIKIPEDIA SEARCH FALLBACK
  // ---------------------------------------

  const searchQueries = [];

  if (normalized) {
    searchQueries.push(normalized);
  }

  if (original) {
    searchQueries.push(
      `${original} fruit`
    );
  }

  for (
    const searchQuery of searchQueries
  ) {
    try {
      const title =
        await searchWikipediaTitle(
          searchQuery
        );

      if (!title) {
        continue;
      }

      const data =
        await getWikipediaSummary(
          title
        );

      if (data?.title) {
        return {
          data,
          searchedAs: title,
          exact: false,
        };
      }
    } catch (error) {
      // Continue to next fallback.
    }
  }

  return null;
};

// =====================================================
// GET ALL FRUITS - SEEDED RANDOM ORDER
// =====================================================

const getAllFruits = async (
  req,
  res
) => {
  try {
    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 20;

    const seed = String(
      req.query.seed || "default"
    );

    const skip =
      (page - 1) * limit;

    const total =
      await Fruit.countDocuments();

    const fruits =
      await Fruit.find().lean();

    const hashString = (
      value
    ) => {
      let hash = 0;

      for (
        let i = 0;
        i < value.length;
        i++
      ) {
        hash =
          (hash << 5) -
          hash +
          value.charCodeAt(i);

        hash |= 0;
      }

      return Math.abs(hash);
    };

    fruits.sort((a, b) => {
      const aHash =
        hashString(
          `${seed}-${a._id}`
        );

      const bHash =
        hashString(
          `${seed}-${b._id}`
        );

      return aHash - bHash;
    });

    const paginatedFruits =
      fruits.slice(
        skip,
        skip + limit
      );

    return res.status(200).json({
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

    return res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET FRUIT BY ID
// =====================================================

const getFruitById = async (
  req,
  res
) => {
  try {
    const fruit =
      await Fruit.findById(
        req.params.id
      );

    if (!fruit) {
      return res.status(404).json({
        message: "Fruit not found",
      });
    }

    return res.status(200).json(
      fruit
    );
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET FRUIT DETAILS
// =====================================================

const getFruitDetails = async (
  req,
  res
) => {
  try {
    const fruit =
      await Fruit.findById(
        req.params.id
      );

    if (!fruit) {
      return res.status(404).json({
        message: "Fruit not found",
      });
    }

    const wikiResponse =
      await getWikipediaSummary(
        fruit.wikipediaTitle ||
          fruit.name
      );

    return res.status(200).json({
      fruit,
      wikipedia: wikiResponse,
    });
  } catch (error) {
    console.log(
      "Fruit details error:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// CREATE FRUIT MANUALLY
// =====================================================

const createFruit = async (
  req,
  res
) => {
  try {
    const fruitData = {
      ...req.body,
    };

    try {
      const wikiData =
        await findWikipediaFruit(
          fruitData.name
        );

      if (wikiData) {
        const wiki =
          wikiData.data;

        fruitData.wikipediaTitle =
          wiki.title;

        if (wiki.extract) {
          fruitData.overview =
            wiki.extract;
        }

        if (
          wiki.thumbnail?.source
        ) {
          fruitData.heroImage =
            wiki.thumbnail.source;

          fruitData.gallery = [
            wiki.thumbnail.source,
          ];
        }
      }
    } catch (
      wikiError
    ) {
      console.log(
        "Wikipedia data could not be fetched."
      );
    }

    const fruit =
      await Fruit.create(
        fruitData
      );

    return res.status(201).json(
      fruit
    );
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// SEARCH EXISTING FRUITS
// =====================================================

const searchFruits = async (
  req,
  res
) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.json([]);
    }

    const query =
      q.trim();

    const fruits =
      await Fruit.find({
        name: {
          $regex: query,
          $options: "i",
        },
      }).limit(20);

    const lowerQuery =
      query.toLowerCase();

    fruits.sort((a, b) => {
      const aName =
        a.name.toLowerCase();

      const bName =
        b.name.toLowerCase();

      const aStarts =
        aName.startsWith(
          lowerQuery
        );

      const bStarts =
        bName.startsWith(
          lowerQuery
        );

      if (
        aStarts &&
        !bStarts
      ) {
        return -1;
      }

      if (
        !aStarts &&
        bStarts
      ) {
        return 1;
      }

      return aName.localeCompare(
        bName
      );
    });

    return res.status(200).json(
      fruits.slice(0, 8)
    );
  } catch (error) {
    console.log(error);

    return res.status(500).json({
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

    // =================================================
    // 1. VALIDATE INPUT
    // =================================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        code: "EMPTY_FRUIT_NAME",
        message:
          "Please enter a fruit name.",
      });
    }

    const fruitName = name.trim();

    // Prevent obviously useless requests.
    // This saves Gemini calls for garbage input like
    // extremely short strings.
    if (fruitName.length < 2) {
      return res.status(400).json({
        code: "INVALID_FRUIT_NAME",
        message:
          "Please enter a valid fruit name.",
      });
    }

    // =================================================
    // 2. CHECK MONGODB BY COMMON NAME FIRST
    // =================================================

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

    // =================================================
    // 3. GEMINI
    // =================================================

    let aiData;

    try {
      aiData =
        await generateFruitData(
          fruitName
        );

      // -----------------------------------------------
      // NOT A FRUIT
      // -----------------------------------------------

      if (
        aiData.isFruit !== true
      ) {
        console.log(
          `Gemini rejected input as a fruit: ${fruitName}`
        );

        return res.status(404).json({
          code: "NOT_A_FRUIT",
          message:
            "This fruit doesn't seem to exist. Try another fruit name.",
        });
      }

      // -----------------------------------------------
      // SCIENTIFIC NAME REQUIRED
      // -----------------------------------------------

      if (
        !aiData.latinName ||
        !aiData.latinName.trim()
      ) {
        return res.status(422).json({
          code: "SCIENTIFIC_NAME_UNAVAILABLE",
          message:
            "We couldn't identify the scientific name for this fruit right now.",
        });
      }
    } catch (error) {
      // -----------------------------------------------
      // GEMINI QUOTA
      // -----------------------------------------------

      if (
        error.code ===
        "GEMINI_QUOTA_EXHAUSTED"
      ) {
        console.log(
          "Gemini generation quota exhausted."
        );

        return res.status(429).json({
          code:
            "GEMINI_QUOTA_EXHAUSTED",
          message:
            "Fruit generation limit is currently reached. Please try again later.",
        });
      }

      console.error(
        "Gemini generation failed:",
        error
      );

      return res.status(500).json({
        code: "GEMINI_ERROR",
        message:
          "We couldn't generate this fruit right now. Please try again.",
      });
    }

    // =================================================
    // 4. SCIENTIFIC IDENTITY
    // =================================================

    const scientificName =
      aiData.latinName.trim();

    console.log(
      `Gemini identified ${fruitName} as ${scientificName}`
    );

    // =================================================
    // 5. CHECK DATABASE BY SCIENTIFIC NAME
    // =================================================

    const escapedScientificName =
      scientificName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const existingScientificFruit =
      await Fruit.findOne({
        latinName: {
          $regex:
            `^${escapedScientificName}$`,
          $options: "i",
        },
      });

    if (
      existingScientificFruit
    ) {
      console.log(
        `Scientific match already exists: ${existingScientificFruit.name}`
      );

      return res.status(200).json({
        source: "database-scientific-match",
        fruit:
          existingScientificFruit,
      });
    }

    // =================================================
    // 6. WIKIPEDIA — SCIENTIFIC NAME FIRST
    // =================================================

    let wikiData = {};

    try {
      console.log(
        `Searching Wikipedia using scientific name: ${scientificName}`
      );

      const wikiResponse =
        await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            scientificName
          )}`,
          {
            headers: {
              "User-Agent":
                "Pomona/1.0 (Educational Project)",
              Accept:
                "application/json",
            },
          }
        );

      wikiData =
        wikiResponse.data || {};
    } catch (wikiError) {
      console.log(
        `Wikipedia direct lookup failed for scientific name: ${scientificName}`
      );

      // ---------------------------------------------
      // COMMON-NAME FALLBACK
      // ---------------------------------------------

      try {
        const wikiResponse =
          await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
              fruitName
            )}`,
            {
              headers: {
                "User-Agent":
                  "Pomona/1.0 (Educational Project)",
                Accept:
                  "application/json",
              },
            }
          );

        wikiData =
          wikiResponse.data || {};
      } catch {
        console.log(
          `Wikipedia fallback failed for ${fruitName}`
        );
      }
    }

    // =================================================
    // 7. WIKIMEDIA
    // =================================================

    let wikiImages = [];

    try {
      wikiImages =
        await searchWikimediaImages(
          fruitName,
          scientificName,
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

      wikiImages = [];
    }

    // =================================================
    // 8. HERO + GALLERY
    // =================================================

    const wikiHeroImage =
      wikiData.thumbnail?.source ||
      wikiData.originalimage?.source ||
      "";

    const fallbackHeroImage =
      wikiImages[0]?.url || "";

    const heroImage =
      wikiHeroImage ||
      fallbackHeroImage;

    const galleryImages = [
      ...(heroImage
        ? [heroImage]
        : []),

      ...wikiImages
        .map(
          (image) => image.url
        )
        .filter(
          (url) =>
            url &&
            url !== heroImage
        )
        .slice(0, 7),
    ];

    // =================================================
    // 9. BUILD DATABASE DOCUMENT
    // =================================================

    const fruitData = {
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
        aiData.originHistory
          ?.originRegion || "",

      overview:
        wikiData.extract || "",

      wikipediaTitle:
        wikiData.title ||
        fruitName,

      originHistory: {
        summary:
          aiData.originHistory
            ?.summary || "",

        detailedHistory:
          aiData.originHistory
            ?.detailedHistory ||
          "",

        originRegion:
          aiData.originHistory
            ?.originRegion || "",

        historicalSpread:
          aiData.originHistory
            ?.historicalSpread ||
          "",

        culturalImportance:
          aiData.originHistory
            ?.culturalImportance ||
          "",
      },

      heroImage,

      gallery:
        galleryImages,

      originImages:
        wikiImages
          .slice(1, 4)
          .map(
            (image) =>
              image.url
          ),

      historicalImages:
        wikiImages
          .slice(4, 7)
          .map(
            (image) =>
              image.url
          ),

      mapImage: "",

      nutrition:
        aiData.nutrition || "",

      growingConditions:
        aiData.growingConditions ||
        "",

      harvest: {
        description:
          aiData.harvest
            ?.description || "",

        seasons:
          Array.isArray(
            aiData.harvest?.seasons
          )
            ? aiData.harvest
                .seasons
            : [],

        months:
          Array.isArray(
            aiData.harvest?.months
          )
            ? aiData.harvest
                .months
            : [],
      },

      diseases:
        aiData.diseases || "",

      companionPlants:
        aiData.companionPlants ||
        "",

      cultivars:
        aiData.cultivars || "",

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

      healthBenefits: [],

      storage: "",

      tags: [],
    };

    // =================================================
    // 10. SAVE
    // =================================================

    const newFruit =
      await Fruit.create(
        fruitData
      );

    console.log(
      `New fruit created: ${newFruit.name}`
    );

    return res.status(201).json({
      source: "created",
      fruit: newFruit,
    });
  } catch (error) {
    console.error(
      "findOrCreateFruit error:",
      error
    );

    return res.status(500).json({
      code: "FRUIT_GENERATION_ERROR",
      message:
        "Something went wrong while generating this fruit.",
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