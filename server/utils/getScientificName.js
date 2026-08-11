const axios = require("axios");

console.log("🚀 getScientificName.js loaded");

const getScientificName = async (fruitName) => {
  console.log("🔥 FUNCTION CALLED FOR:", fruitName);

  try {
    const wikiRes = await axios.get(
  `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    fruitName
  )}&prop=pageprops&format=json`,
  {
    headers: {
      "User-Agent": "Pomona/1.0 (Educational Project)",
      Accept: "application/json",
    },
  }
);

    const pages = wikiRes.data.query.pages;
    const page = Object.values(pages)[0];

    console.log("PAGE:", page);

    const wikidataId = page?.pageprops?.wikibase_item;

    console.log("WIKIDATA ID:", wikidataId);

    if (!wikidataId) return null;

   const wikidataRes = await axios.get(
  `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`,
  {
    headers: {
      "User-Agent": "Pomona/1.0 (Educational Project)",
      Accept: "application/json",
    },
  }
);

    const entity = wikidataRes.data.entities[wikidataId];

    console.log("ENTITY FOUND:", !!entity);

    const scientificName =
      entity?.claims?.P225?.[0]?.mainsnak?.datavalue?.value;

    console.log("SCIENTIFIC NAME:", scientificName);

    return scientificName || null;
  } catch (error) {
     if (error.response?.status === 429) {
    console.log("⏳ Rate limited. Waiting 5 seconds...");

    await new Promise((resolve) =>
      setTimeout(resolve, 5000)
    );

    return getScientificName(fruitName);
  }
    console.log("ERROR:", error.message);
    return null;
  }
};

module.exports = getScientificName;