require("dotenv").config();

const axios = require("axios");

const connectDB = require("./config/db");
const Fruit = require("./models/Fruit");

const {
  generateFruitData,
} = require("./services/geminiService");

const {
  searchWikimediaImages,
} = require("./services/wikimediaService");

// =====================================================
// CONFIG
// =====================================================

// Gemini free-tier limit that we hit.
// We intentionally stop after 20 successful Gemini calls.
const MAX_GEMINI_REPAIRS_PER_RUN = 20;

// Small delay between fruits.
// Helps reduce pressure on Wikipedia/Wikimedia.
const DELAY_BETWEEN_FRUITS = 4000;

// Retry non-quota Gemini errors a couple of times.
const MAX_NON_QUOTA_RETRIES = 2;

// =====================================================
// WIKIPEDIA
// =====================================================

const WIKIPEDIA_API =
  "https://en.wikipedia.org";

const WIKI_HEADERS = {
  "User-Agent":
    "Pomona/1.0 (Educational Project; contact: samparksharmaa@gmail.com)",
  Accept: "application/json",
};

// =====================================================
// HELPERS
// =====================================================

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

// -----------------------------------------
// GET WIKIPEDIA SUMMARY
// -----------------------------------------

const getWikipediaSummary = async (
  title
) => {
  const response = await axios.get(
    `${WIKIPEDIA_API}/api/rest_v1/page/summary/${encodeURIComponent(
      title
    )}`,
    {
      headers: WIKI_HEADERS,
      timeout: 10000,
    }
  );

  return response.data;
};

// -----------------------------------------
// WIKIPEDIA SEARCH
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

      headers: WIKI_HEADERS,

      timeout: 10000,
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
// GET BEST WIKIPEDIA DATA
// -----------------------------------------

const findWikipediaData = async ({
  commonName,
  scientificName,
}) => {
  const attempts = [];

  // Scientific name FIRST.
  if (
    scientificName &&
    scientificName.trim()
  ) {
    attempts.push(
      scientificName.trim()
    );
  }

  // Common name second.
  if (
    commonName &&
    commonName.trim()
  ) {
    attempts.push(
      commonName.trim()
    );
  }

  // ---------------------------------------
  // DIRECT LOOKUPS
  // ---------------------------------------

  for (const attempt of attempts) {
    try {
      const wiki =
        await getWikipediaSummary(
          attempt
        );

      if (wiki?.title) {
        return {
          data: wiki,
          matchedAs: attempt,
        };
      }
    } catch (error) {
      console.log(
        `⚠ Wikipedia direct lookup failed: ${attempt}`
      );
    }
  }

  // ---------------------------------------
  // SEARCH FALLBACK
  // ---------------------------------------

  for (const attempt of attempts) {
    try {
      const title =
        await searchWikipediaTitle(
          attempt
        );

      if (!title) {
        continue;
      }

      const wiki =
        await getWikipediaSummary(
          title
        );

      if (wiki?.title) {
        return {
          data: wiki,
          matchedAs: title,
        };
      }
    } catch (error) {
      console.log(
        `⚠ Wikipedia search failed: ${attempt}`
      );
    }
  }

  return {
    data: {},
    matchedAs:
      scientificName ||
      commonName,
  };
};

// =====================================================
// GEMINI ERROR DETECTION
// =====================================================

const isGeminiQuotaError = (
  error
) => {
  const status =
    error?.status ||
    error?.response?.status;

  const message =
    error?.message ||
    JSON.stringify(error);

  return (
    status === 429 ||
    message.includes(
      "RESOURCE_EXHAUSTED"
    ) ||
    message.includes(
      "Quota exceeded"
    ) ||
    message.includes(
      "quota exceeded"
    )
  );
};

// =====================================================
// MERGE AI DATA INTO EXISTING DOCUMENT
// =====================================================

const buildUpdatedFruitData = ({
  fruit,
  aiData,
  wikiData,
  wikiImages,
}) => {
  const wikiHeroImage =
    wikiData.thumbnail?.source ||
    wikiData.originalimage?.source ||
    "";

  const fallbackHeroImage =
    wikiImages[0]?.url ||
    "";

  const heroImage =
    wikiHeroImage ||
    fallbackHeroImage ||
    fruit.heroImage ||
    "";

  const existingGallery =
    Array.isArray(
      fruit.gallery
    )
      ? fruit.gallery
      : [];

  const newGallery = [
    ...(heroImage
      ? [heroImage]
      : []),

    ...wikiImages
      .map(
        (image) =>
          image.url
      )
      .filter(Boolean),
  ];

  const mergedGallery =
    Array.from(
      new Set([
        ...existingGallery,
        ...newGallery,
      ])
    ).slice(0, 8);

  return {
    // ---------------------------------------
    // BASIC
    // ---------------------------------------

    name:
      fruit.name,

    latinName:
      aiData.latinName ||
      fruit.latinName ||
      "",

    family:
      aiData.family ||
      fruit.family ||
      "",

    genus:
      aiData.genus ||
      fruit.genus ||
      "",

    species:
      aiData.species ||
      fruit.species ||
      "",

    origin:
      aiData.originHistory
        ?.originRegion ||
      fruit.origin ||
      "",

    overview:
      wikiData.extract ||
      fruit.overview ||
      "",

    wikipediaTitle:
      wikiData.title ||
      fruit.wikipediaTitle ||
      fruit.name,

    // ---------------------------------------
    // ORIGIN / HISTORY
    // ---------------------------------------

    originHistory: {
      summary:
        aiData.originHistory
          ?.summary ||
        fruit.originHistory
          ?.summary ||
        "",

      detailedHistory:
        aiData.originHistory
          ?.detailedHistory ||
        fruit.originHistory
          ?.detailedHistory ||
        "",

      originRegion:
        aiData.originHistory
          ?.originRegion ||
        fruit.originHistory
          ?.originRegion ||
        "",

      historicalSpread:
        aiData.originHistory
          ?.historicalSpread ||
        fruit.originHistory
          ?.historicalSpread ||
        "",

      culturalImportance:
        aiData.originHistory
          ?.culturalImportance ||
        fruit.originHistory
          ?.culturalImportance ||
        "",
    },

    // ---------------------------------------
    // IMAGES
    // ---------------------------------------

    heroImage,

    gallery:
      mergedGallery,

    originImages:
      wikiImages.length > 0
        ? wikiImages
            .slice(1, 4)
            .map(
              (image) =>
                image.url
            )
        : fruit.originImages ||
          [],

    historicalImages:
      wikiImages.length > 0
        ? wikiImages
            .slice(4, 7)
            .map(
              (image) =>
                image.url
            )
        : fruit.historicalImages ||
          [],

    mapImage:
      fruit.mapImage ||
      "",

    // ---------------------------------------
    // DETAILED CONTENT
    // ---------------------------------------

    nutrition:
      aiData.nutrition ||
      fruit.nutrition ||
      "",

    growingConditions:
      aiData.growingConditions ||
      fruit.growingConditions ||
      "",

    harvest: {
      description:
        aiData.harvest
          ?.description ||
        fruit.harvest
          ?.description ||
        "",

      seasons:
        Array.isArray(
          aiData.harvest
            ?.seasons
        )
          ? aiData.harvest.seasons
          : Array.isArray(
              fruit.harvest
                ?.seasons
            )
          ? fruit.harvest.seasons
          : [],

      months:
        Array.isArray(
          aiData.harvest
            ?.months
        )
          ? aiData.harvest.months
          : Array.isArray(
              fruit.harvest
                ?.months
            )
          ? fruit.harvest.months
          : [],
    },

    diseases:
      aiData.diseases ||
      fruit.diseases ||
      "",

    companionPlants:
      aiData.companionPlants ||
      fruit.companionPlants ||
      "",

    cultivars:
      aiData.cultivars ||
      fruit.cultivars ||
      "",

    // ---------------------------------------
    // FACTS
    // ---------------------------------------

    interestingFacts:
      Array.isArray(
        aiData.interestingFacts
      )
        ? aiData.interestingFacts
        : Array.isArray(
            fruit.interestingFacts
          )
        ? fruit.interestingFacts
        : [],

    scientificFacts:
      Array.isArray(
        aiData.scientificFacts
      )
        ? aiData.scientificFacts
        : Array.isArray(
            fruit.scientificFacts
          )
        ? fruit.scientificFacts
        : [],

    // ---------------------------------------
    // KEEP EXISTING OPTIONAL DATA
    // ---------------------------------------

    healthBenefits:
      fruit.healthBenefits ||
      [],

    storage:
      fruit.storage ||
      "",

    tags:
      fruit.tags ||
      [],
  };
};

// =====================================================
// REPAIR ONE FRUIT
// =====================================================

const repairFruit = async (
  fruit
) => {
  console.log(
    `\n🍓 Repairing: ${fruit.name}`
  );

  // ---------------------------------------
  // 1. GEMINI
  // ---------------------------------------

  let aiData = null;

  for (
    let attempt = 0;
    attempt <= MAX_NON_QUOTA_RETRIES;
    attempt++
  ) {
    try {
      console.log(
        "🤖 Asking Gemini..."
      );

      aiData =
        await generateFruitData(
          fruit.name
        );

      if (!aiData) {
        throw new Error(
          "Gemini returned no data."
        );
      }

      console.log(
        `✅ Gemini success → ${
          aiData.latinName ||
          "No scientific name"
        }`
      );

      break;
    } catch (error) {
      if (
        isGeminiQuotaError(error)
      ) {
        console.log(
          "\n🛑 GEMINI QUOTA REACHED."
        );

        console.log(
          "Stopping safely so the next run can continue tomorrow."
        );

        return {
          quotaReached: true,
          success: false,
        };
      }

      console.error(
        `⚠ Gemini attempt ${
          attempt + 1
        } failed:`,
        error.message
      );

      if (
        attempt <
        MAX_NON_QUOTA_RETRIES
      ) {
        await sleep(
          2000 *
            (attempt + 1)
        );
      }
    }
  }

  if (!aiData) {
    return {
      quotaReached: false,
      success: false,
    };
  }

  // ---------------------------------------
  // 2. SCIENTIFIC NAME
  // ---------------------------------------

  const scientificName =
    aiData.latinName?.trim() ||
    "";

  if (!scientificName) {
    console.log(
      "⚠ Gemini did not return a scientific name."
    );
  }

  // ---------------------------------------
  // 3. WIKIPEDIA
  // ---------------------------------------

  let wikiData = {};
  let wikiMatchedAs =
    fruit.name;

  try {
    console.log(
      "📚 Searching Wikipedia..."
    );

    const wikiResult =
      await findWikipediaData({
        commonName:
          fruit.name,

        scientificName,
      });

    wikiData =
      wikiResult.data ||
      {};

    wikiMatchedAs =
      wikiResult.matchedAs ||
      fruit.name;

    if (wikiData.title) {
      console.log(
        `✅ Wikipedia → ${wikiData.title}`
      );
    } else {
      console.log(
        "⚠ No Wikipedia result."
      );
    }
  } catch (error) {
    console.log(
      "⚠ Wikipedia failed:",
      error.message
    );
  }

  // ---------------------------------------
  // 4. WIKIMEDIA
  // ---------------------------------------

  let wikiImages = [];

  if (scientificName) {
    try {
      console.log(
        "🖼 Searching Wikimedia using scientific name..."
      );

      wikiImages =
        await searchWikimediaImages(
          fruit.name,
          scientificName,
          10
        );

      console.log(
        `✅ Wikimedia → ${wikiImages.length} images`
      );
    } catch (error) {
      console.log(
        "⚠ Wikimedia failed:",
        error.message
      );
    }
  } else {
    console.log(
      "⚠ No scientific name → skipping Wikimedia image search."
    );
  }

  // ---------------------------------------
  // 5. UPDATE DOCUMENT
  // ---------------------------------------

  const updatedData =
    buildUpdatedFruitData({
      fruit,
      aiData,
      wikiData,
      wikiImages,
    });

  await Fruit.findByIdAndUpdate(
    fruit._id,
    {
      $set: updatedData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  console.log(
    `✅ SAVED: ${fruit.name}`
  );

  console.log(
    `   Latin: ${
      updatedData.latinName ||
      "—"
    }`
  );

  console.log(
    `   Hero: ${
      updatedData.heroImage
        ? "✅"
        : "❌"
    }`
  );

  console.log(
    `   Gallery: ${
      updatedData.gallery.length
    }`
  );

  console.log(
    `   Facts: ${
      updatedData.interestingFacts.length
    } interesting / ${
      updatedData.scientificFacts.length
    } scientific`
  );

  return {
    quotaReached: false,
    success: true,
  };
};

// =====================================================
// MAIN
// =====================================================

const repairDatabase = async () => {
  let successfulRepairs = 0;

  try {
    await connectDB();

    console.log(
      "🍎 Connected to MongoDB"
    );

    console.log(
      "\n========================================"
    );

    console.log(
      "POMONA FRUIT REPAIR"
    );

    console.log(
      "========================================"
    );

    console.log(
      `🎯 Maximum Gemini repairs this run: ${MAX_GEMINI_REPAIRS_PER_RUN}`
    );

    // ---------------------------------------
    // ONLY GET INCOMPLETE FRUITS
    // ---------------------------------------

    const incompleteFruits =
      await Fruit.find({
        $or: [
          {
            latinName: {
              $exists: false,
            },
          },
          {
            latinName: "",
          },
          {
            latinName: null,
          },
        ],
      }).sort({
        createdAt: 1,
      });

    console.log(
      `\n🔎 Incomplete fruits found: ${incompleteFruits.length}`
    );

    if (
      incompleteFruits.length === 0
    ) {
      console.log(
        "\n🎉 All fruits already have a scientific name."
      );

      process.exit(0);
    }

    // ---------------------------------------
    // REPAIR
    // ---------------------------------------

    for (
      const fruit of incompleteFruits
    ) {
      if (
        successfulRepairs >=
        MAX_GEMINI_REPAIRS_PER_RUN
      ) {
        console.log(
          "\n🛑 Daily repair limit reached."
        );

        break;
      }

      const result =
        await repairFruit(
          fruit
        );

      // -------------------------------------
      // QUOTA HIT
      // -------------------------------------

      if (
        result.quotaReached
      ) {
        break;
      }

      // -------------------------------------
      // SUCCESS
      // -------------------------------------

      if (result.success) {
        successfulRepairs++;

        console.log(
          `\n📊 Progress: ${successfulRepairs}/${MAX_GEMINI_REPAIRS_PER_RUN}`
        );
      }

      // -------------------------------------
      // DELAY
      // -------------------------------------

      if (
        successfulRepairs <
          MAX_GEMINI_REPAIRS_PER_RUN &&
        incompleteFruits.indexOf(
          fruit
        ) <
          incompleteFruits.length -
            1
      ) {
        console.log(
          `⏳ Waiting ${
            DELAY_BETWEEN_FRUITS /
            1000
          } seconds...`
        );

        await sleep(
          DELAY_BETWEEN_FRUITS
        );
      }
    }

    // ---------------------------------------
    // SUMMARY
    // ---------------------------------------

    const remainingCount =
      await Fruit.countDocuments({
        $or: [
          {
            latinName: {
              $exists: false,
            },
          },
          {
            latinName: "",
          },
          {
            latinName: null,
          },
        ],
      });

    console.log(
      "\n========================================"
    );

    console.log(
      "REPAIR RUN FINISHED"
    );

    console.log(
      "========================================"
    );

    console.log(
      `✅ Successfully repaired: ${successfulRepairs}`
    );

    console.log(
      `⏳ Still incomplete: ${remainingCount}`
    );

    if (
      remainingCount > 0
    ) {
      console.log(
        "\nRun `node repairFruits.js` again after the next Gemini quota reset."
      );
    } else {
      console.log(
        "\n🎉 ALL FRUITS HAVE SCIENTIFIC NAMES."
      );
    }

    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Repair script failed:"
    );

    console.error(error);

    process.exit(1);
  }
};

repairDatabase();