const axios = require("axios");

function cleanText(value = "") {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()
    .toLowerCase();
}

async function searchWikimediaImages(
  fruitName,
  scientificName = "",
  limit = 10
) {
  try {
    const searches = [];

    // Scientific name gets highest priority.
    if (scientificName?.trim()) {
      searches.push(`"${scientificName.trim()}"`);
    }

    // Fruit-specific fallback.
    searches.push(`"${fruitName.trim()}" fruit`);

    const allPages = [];

    for (const searchTerm of searches) {
      const response = await axios.get(
        "https://commons.wikimedia.org/w/api.php",
        {
          params: {
            action: "query",
            generator: "search",

            gsrsearch: searchTerm,
            gsrnamespace: 6,
            gsrlimit: limit,

            prop: "imageinfo",
            iiprop: "url|extmetadata",
            iiurlwidth: 1200,

            format: "json",
            formatversion: 2,
          },

          headers: {
            "User-Agent":
              "Pomona/1.0 (Educational Project)",
          },
        }
      );

      const pages =
        response.data.query?.pages || [];

      allPages.push(...pages);
    }

    // -----------------------------------------
    // REMOVE DUPLICATES
    // -----------------------------------------

    const uniquePages = Array.from(
      new Map(
        allPages.map((page) => [
          page.pageid,
          page,
        ])
      ).values()
    );

    // -----------------------------------------
    // SCORE / FILTER RESULTS
    // -----------------------------------------

    const fruitNameLower =
      fruitName.trim().toLowerCase();

    const scientificNameLower =
      scientificName?.trim().toLowerCase() || "";

    const irrelevantTerms = [
      "city",
      "district",
      "road",
      "street",
      "building",
      "office",
      "school",
      "mosque",
      "church",
      "temple",
      "station",
      "airport",
      "bridge",
      "highway",
      "park",
      "museum",
      "people",
      "portrait",
      "wedding",
      "festival",
    ];

    const scored = uniquePages
      .filter(
        (page) =>
          page.imageinfo?.length > 0
      )
      .map((page) => {
        const imageInfo =
          page.imageinfo[0];

        const title = cleanText(
          page.title
        );

        const description = cleanText(
          imageInfo.extmetadata?.ImageDescription
            ?.value || ""
        );

        const categories = cleanText(
          imageInfo.extmetadata?.Categories
            ?.value || ""
        );

        const searchableText =
          `${title} ${description} ${categories}`;

        let score = 0;

        // Scientific name = strongest signal.
        if (
          scientificNameLower &&
          searchableText.includes(
            scientificNameLower
          )
        ) {
          score += 100;
        }

        // Exact fruit name.
        if (
          searchableText.includes(
            fruitNameLower
          )
        ) {
          score += 60;
        }

        // Fruit-related words.
        const positiveTerms = [
          "fruit",
          "plant",
          "tree",
          "leaf",
          "flower",
          "seed",
          "ripe",
          "botanical",
          "botany",
        ];

        positiveTerms.forEach((term) => {
          if (searchableText.includes(term)) {
            score += 5;
          }
        });

        // Penalize obviously irrelevant results.
        irrelevantTerms.forEach((term) => {
          if (title.includes(term)) {
            score -= 50;
          }
        });

        return {
          page,
          imageInfo,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort(
        (a, b) => b.score - a.score
      );

    // -----------------------------------------
    // RETURN CLEAN IMAGE DATA
    // -----------------------------------------

    return scored.slice(0, limit).map(
      ({ page, imageInfo }) => ({
        title: page.title,

        url:
          imageInfo.thumburl ||
          imageInfo.url,

        originalUrl:
          imageInfo.url,

        descriptionUrl:
          imageInfo.descriptionurl || "",

        artist:
          imageInfo.extmetadata?.Artist
            ?.value || "",

        license:
          imageInfo.extmetadata
            ?.LicenseShortName
            ?.value || "",
      })
    );
  } catch (error) {
    console.error(
      "Wikimedia image search failed:",
      error.message
    );

    return [];
  }
}

module.exports = {
  searchWikimediaImages,
};