const mongoose = require("mongoose");

const fruitSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // BASIC IDENTITY
    // --------------------------------------------------

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    latinName: {
      type: String,
      trim: true,
      default: "",
    },

    family: {
      type: String,
      default: "",
    },

    genus: {
      type: String,
      default: "",
    },

    species: {
      type: String,
      default: "",
    },

    // --------------------------------------------------
    // OVERVIEW
    // --------------------------------------------------

    origin: {
      type: String,
      default: "",
    },

    overview: {
      type: String,
      default: "",
    },

    // --------------------------------------------------
    // ORIGIN & HISTORY
    // --------------------------------------------------

    originHistory: {
      summary: {
        type: String,
        default: "",
      },

      detailedHistory: {
        type: String,
        default: "",
      },

      originRegion: {
        type: String,
        default: "",
      },

      historicalSpread: {
        type: String,
        default: "",
      },

      culturalImportance: {
        type: String,
        default: "",
      },
    },

    // --------------------------------------------------
    // MEDIA
    // --------------------------------------------------

    heroImage: {
      type: String,
      default: "",
    },

    gallery: {
      type: [String],
      default: [],
    },

    originImages: {
      type: [String],
      default: [],
    },

    historicalImages: {
      type: [String],
      default: [],
    },

    mapImage: {
      type: String,
      default: "",
    },

    // --------------------------------------------------
    // DETAILED CONTENT
    // --------------------------------------------------

    nutrition: {
      type: String,
      default: "",
    },

    growingConditions: {
      type: String,
      default: "",
    },

    harvest: {
  description: {
    type: String,
    default: "",
  },

  seasons: {
    type: [String],
    default: [],
  },

  months: {
    type: [String],
    default: [],
  },
},

    diseases: {
      type: String,
      default: "",
    },

    companionPlants: {
      type: String,
      default: "",
    },

    cultivars: {
      type: String,
      default: "",
    },

    // --------------------------------------------------
    // FACTS
    // --------------------------------------------------

    interestingFacts: {
      type: [String],
      default: [],
    },

    scientificFacts: {
      type: [String],
      default: [],
    },

    // --------------------------------------------------
    // OPTIONAL / FUTURE DATA
    // --------------------------------------------------

    healthBenefits: {
      type: [String],
      default: [],
    },

    storage: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    wikipediaTitle: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Fruit", fruitSchema);