require("dotenv").config();

const axios = require("axios");

const connectDB = require("./config/db");
const Fruit = require("./models/Fruit");
const fruits = require("./data/fruits");

const getScientificName = require("./utils/getScientificName");

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("🍎 Connected to MongoDB");

    await Fruit.deleteMany();

    console.log("🗑 Old fruits deleted.\n");

    for (const fruit of fruits) {
      console.log(`🌍 Fetching ${fruit.name}...`);

      let wiki = {};

      try {
        const wikiResponse = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            fruit.name
          )}`,
          {
            headers: {
              "User-Agent": "Pomona/1.0",
            },
          }
        );

        wiki = wikiResponse.data;
      } catch (error) {
        console.log("⚠ Wikipedia data not found.");
      }

      const scientificName =
        await getScientificName(fruit.name);

      try {
        const fruitData = {
          name: fruit.name,

          latinName:
            scientificName || fruit.name,

          family: "",

          genus: "",

          species: "",

          origin: "",

          overview: wiki.extract || "",

          wikipediaTitle:
            wiki.title || fruit.name,

          heroImage:
            wiki.originalimage?.source||wiki.thumbnail?.source || "",

          gallery:
            wiki.originalimage?.source
              ? [wiki.originalimage.source]
              : [],

          tags: [],
        };

        await Fruit.create(fruitData);

        console.log(
          `✅ ${fruit.name} → ${
            scientificName || "No Latin Name"
          }`
        );
        await new Promise((resolve) =>
  setTimeout(resolve, 3000)
);
      } catch (error) {
        console.log(
          `❌ Failed to save ${fruit.name}`
        );
      }
    }

    console.log(
      "\n🎉 Database Seeded Successfully."
    );

    process.exit();
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
};

seedDatabase();