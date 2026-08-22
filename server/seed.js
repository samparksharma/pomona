require("dotenv").config();

const axios = require("axios");

const connectDB = require("./config/db");
const Fruit = require("./models/Fruit");
const fruits = require("./data/fruits");

const {
  generateFruitData,
} = require("./services/geminiService");

const {
  searchWikimediaImages,
} = require("./services/wikimediaService");

// =====================================================
// CONFIG
// =====================================================

const WIKIPEDIA_API =
  "https://en.wikipedia.org";

const WIKI_HEADERS = {
  "User-Agent":
    "Pomona/1.0 (Educational Project)",
  Accept: "application/json",
};

const DELAY_BETWEEN_FRUITS = 3000;

// =====================================================
// HELPERS
// =====================================================

// -----------------------------------------
// SLEEP
// -----------------------------------------

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
  const response =
    await axios.get(
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
// SEARCH WIKIPEDIA
// -----------------------------------------

const searchWikipediaTitle = async (
  query
) => {
  const response =
    await axios.get(
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
// SMART WIKIPEDIA LOOKUP
// -----------------------------------------

const findWikipediaData = async (
  fruitName,
  scientificName
) => {
  const attempts = [];

  // ---------------------------------------
  // 1. SCIENTIFIC NAME FIRST
  // ---------------------------------------

  if (
    scientificName &&
    scientificName.trim()
  ) {
    attempts.push(
      scientificName.trim()
    );
  }

  // ---------------------------------------
  // 2. COMMON NAME
  // ---------------------------------------

  if (fruitName?.trim()) {
    attempts.push(
      fruitName.trim()
    );
  }

  // ---------------------------------------
  // DIRECT PAGE LOOKUPS
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
        `⚠ Wikipedia page not found for "${attempt}"`
      );
    }
  }

  // ---------------------------------------
  // 3. WIKIPEDIA SEARCH FALLBACK
  // ---------------------------------------

  const searchQueries = [];

  if (
    scientificName &&
    scientificName.trim()
  ) {
    searchQueries.push(
      scientificName.trim()
    );
  }

  if (fruitName?.trim()) {
    searchQueries.push(
      fruitName.trim()
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
        `⚠ Wikipedia search failed for "${searchQuery}"`
      );
    }
  }

  return {
    data: {},
    matchedAs:
      scientificName ||
      fruitName,
  };
};

// =====================================================
// SEED
// =====================================================

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log(
      "🍎 Connected to MongoDB"
    );

    // -----------------------------------------
    // DELETE OLD FRUITS
    // -----------------------------------------

    await Fruit.deleteMany();

    console.log(
      "🗑 Old fruit documents deleted.\n"
    );

    // -----------------------------------------
    // PROCESS EACH FRUIT
    // -----------------------------------------

    for (
      let index = 0;
      index < fruits.length;
      index++
    ) {
      const fruit =
        fruits[index];

      console.log(
        "\n========================================"
      );

      console.log(
        `🌍 [${index + 1}/${fruits.length}] Processing: ${fruit.name}`
      );

      console.log(
        "========================================"
      );

      // =======================================
      // 1. GEMINI FIRST
      // =======================================

      let aiData = {};

      try {
        console.log(
          "🤖 Asking Gemini for taxonomy + content..."
        );

        aiData =
          await generateFruitData(
            fruit.name
          );

        console.log(
          "✅ Gemini data generated"
        );

        console.log(
          `   Scientific: ${
            aiData.latinName ||
            "Not provided"
          }`
        );

        console.log(
          `   Family: ${
            aiData.family ||
            "Not provided"
          }`
        );

        console.log(
          `   Genus: ${
            aiData.genus ||
            "Not provided"
          }`
        );

        console.log(
          `   Species: ${
            aiData.species ||
            "Not provided"
          }`
        );
      } catch (error) {
        console.error(
          "❌ Gemini failed:",
          error.message
        );

        /*
         * We could skip the fruit here,
         * but it's safer to continue and
         * create the fruit with whatever
         * information we can obtain.
         */
        aiData = {};
      }

      // =======================================
      // 2. SCIENTIFIC NAME
      // =======================================

      const scientificName =
        aiData.latinName?.trim() ||
        "";

      // =======================================
      // 3. WIKIPEDIA
      // =======================================

      let wikiData = {};

      let wikipediaMatchedAs =
        fruit.name;

      try {
        console.log(
          "📚 Searching Wikipedia..."
        );

        const wikiResult =
          await findWikipediaData(
            fruit.name,
            scientificName
          );

        wikiData =
          wikiResult.data ||
          {};

        wikipediaMatchedAs =
          wikiResult.matchedAs ||
          fruit.name;

        if (wikiData.title) {
          console.log(
            `✅ Wikipedia match: ${wikiData.title}`
          );
        } else {
          console.log(
            "⚠ No Wikipedia result found."
          );
        }
      } catch (error) {
        console.log(
          "⚠ Wikipedia lookup failed:",
          error.message
        );
      }

      // =======================================
      // 4. WIKIMEDIA IMAGES
      // =======================================

      let wikiImages = [];

      try {
        console.log(
          "🖼 Searching Wikimedia images..."
        );

        wikiImages =
          await searchWikimediaImages(
            fruit.name,
            scientificName ||
              wikiData.title ||
              "",
            10
          );

        console.log(
          `✅ Wikimedia returned ${wikiImages.length} images`
        );
      } catch (error) {
        console.error(
          "❌ Wikimedia failed:",
          error.message
        );

        wikiImages = [];
      }

      // =======================================
      // 5. IMAGE SELECTION
      // =======================================

      const wikiHeroImage =
        wikiData.thumbnail
          ?.source ||
        wikiData.originalimage
          ?.source ||
        "";

      const fallbackHeroImage =
        wikiImages[0]?.url ||
        "";

      const heroImage =
        wikiHeroImage ||
        fallbackHeroImage;

      const galleryImages = [
        ...(heroImage
          ? [heroImage]
          : []),

        ...wikiImages
          .map(
            (image) =>
              image.url
          )
          .filter(
            (url) =>
              url &&
              url !== heroImage
          )
          .slice(0, 7),
      ];

      // =======================================
      // 6. BUILD COMPLETE FRUIT DOCUMENT
      // =======================================

      const fruitData = {
        // -------------------------------------
        // BASIC
        // -------------------------------------

        name:
          fruit.name,

        latinName:
          aiData.latinName ||
          "",

        family:
          aiData.family ||
          "",

        genus:
          aiData.genus ||
          "",

        species:
          aiData.species ||
          "",

        origin:
          aiData.originHistory
            ?.originRegion ||
          "",

        overview:
          wikiData.extract ||
          "",

        wikipediaTitle:
          wikiData.title ||
          wikipediaMatchedAs ||
          fruit.name,

        // -------------------------------------
        // ORIGIN / HISTORY
        // -------------------------------------

        originHistory: {
          summary:
            aiData.originHistory
              ?.summary ||
            "",

          detailedHistory:
            aiData.originHistory
              ?.detailedHistory ||
            "",

          originRegion:
            aiData.originHistory
              ?.originRegion ||
            "",

          historicalSpread:
            aiData.originHistory
              ?.historicalSpread ||
            "",

          culturalImportance:
            aiData.originHistory
              ?.culturalImportance ||
            "",
        },

        // -------------------------------------
        // IMAGES
        // -------------------------------------

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

        // -------------------------------------
        // DETAILS
        // -------------------------------------

        nutrition:
          aiData.nutrition ||
          "",

        growingConditions:
          aiData.growingConditions ||
          "",

        harvest: {
          description:
            aiData.harvest
              ?.description ||
            "",

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
              ? aiData.harvest.months
              : [],
        },

        diseases:
          aiData.diseases ||
          "",

        companionPlants:
          aiData.companionPlants ||
          "",

        cultivars:
          aiData.cultivars ||
          "",

        // -------------------------------------
        // FACTS
        // -------------------------------------

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

        // -------------------------------------
        // FUTURE
        // -------------------------------------

        healthBenefits: [],

        storage: "",

        tags: [],
      };

      // =======================================
      // 7. SAVE
      // =======================================

      try {
        const createdFruit =
          await Fruit.create(
            fruitData
          );

        console.log(
          `✅ SAVED: ${createdFruit.name}`
        );

        console.log(
          `   Latin: ${
            createdFruit.latinName ||
            "—"
          }`
        );

        console.log(
          `   Hero image: ${
            createdFruit.heroImage
              ? "✅"
              : "❌"
          }`
        );

        console.log(
          `   Gallery: ${
            createdFruit.gallery?.length ||
            0
          } images`
        );

        console.log(
          `   Gemini facts: ${
            createdFruit.interestingFacts?.length ||
            0
          } interesting / ${
            createdFruit.scientificFacts
              ?.length || 0
          } scientific`
        );
      } catch (error) {
        console.error(
          `❌ Failed to save ${fruit.name}:`,
          error.message
        );
      }

      // =======================================
      // 8. DELAY
      // =======================================

      if (
        index <
        fruits.length - 1
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

    console.log(
      "\n========================================"
    );

    console.log(
      "🎉 DATABASE SEEDED SUCCESSFULLY"
    );

    console.log(
      "========================================"
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ SEED FAILED"
    );

    console.error(error);

    process.exit(1);
  }
};

seedDatabase();