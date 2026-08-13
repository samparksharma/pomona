const axios = require("axios");

async function searchWikimediaImages(
  fruitName,
  limit = 8
) {
  try {
    const response = await axios.get(
      "https://commons.wikimedia.org/w/api.php",
      {
        params: {
          action: "query",
          generator: "search",
          gsrsearch: fruitName,
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

    const pages = response.data.query?.pages || [];

    return pages
      .filter(
        (page) =>
          page.imageinfo?.length > 0
      )
      .map((page) => {
        const imageInfo =
          page.imageinfo[0];

        return {
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
            imageInfo.extmetadata?.LicenseShortName
              ?.value || "",
        };
      });

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