require("dotenv").config();

const {
  generateFruitData,
} = require(
  "./geminiService"
);

(async () => {
  try {

    const result =
      await generateFruitData(
        "Mango"
      );

    console.log(result);

  } catch (error) {

    console.log(error);

  }
})();