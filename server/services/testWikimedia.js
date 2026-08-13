require("dotenv").config();

const {
  searchWikimediaImages,
} = require("./wikimediaService");

(async () => {
  try {
    const images =
      await searchWikimediaImages(
        "Ackee",
        8
      );

    console.dir(images, {
      depth: null,
    });

  } catch (error) {
    console.error(error);
  }
})();