const mongoose = require("mongoose");

const fruitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    latinName: {
      type: String,
      required: true,
      trim: true,
    },

    family: String,

    genus: String,

    species: String,

    origin: String,

    overview: String,

    history: String,

    heroImage: String,

    gallery: [String],

    nutrition: {
      calories: Number,
      carbs: Number,
      protein: Number,
      fat: Number,
      fiber: Number,
      vitaminC: Number,
      potassium: Number,
    },

    growingGuide: {
      sunlight: String,
      watering: String,
      soil: String,
      temperature: String,
      humidity: String,
      ph: String,
      fertilizer: String,
      spacing: String,
      hardinessZone: String,
    },

    healthBenefits: [String],

    interestingFacts: [String],

    scientificFacts: [String],

    diseases: [String],

    companionPlants: [String],

    harvest: {
      season: String,
      months: [String],
    },

    storage: {
      roomTemperature: String,
      refrigerator: String,
    },

    wikipediaTitle: String,

    tags: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Fruit", fruitSchema);