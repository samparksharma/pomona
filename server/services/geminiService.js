const { GoogleGenAI } = require("@google/genai");

// =====================================================
// GEMINI API KEYS
// =====================================================

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean);

// -----------------------------------------------------
// VALIDATION
// -----------------------------------------------------

if (!GEMINI_KEYS.length) {
  throw new Error(
    "No Gemini API keys were found in the environment."
  );
}

console.log(
  `🤖 Gemini configured with ${GEMINI_KEYS.length} API key(s)`
);

// One Gemini client per key.
const clients = GEMINI_KEYS.map(
  (apiKey) =>
    new GoogleGenAI({
      apiKey,
    })
);

// Current key pointer.
let currentKeyIndex = 0;

// Keys that have already hit quota.
// They are skipped for the rest of the current server process.
const exhaustedKeys = new Set();

// =====================================================
// HELPERS
// =====================================================

// -----------------------------------------
// DETECT QUOTA ERROR
// -----------------------------------------

function isQuotaError(error) {
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
}

// -----------------------------------------
// GET NEXT AVAILABLE KEY
// -----------------------------------------

function getNextAvailableKey() {
  if (
    exhaustedKeys.size >=
    clients.length
  ) {
    return -1;
  }

  for (
    let offset = 0;
    offset < clients.length;
    offset++
  ) {
    const index =
      (currentKeyIndex + offset) %
      clients.length;

    if (
      !exhaustedKeys.has(index)
    ) {
      return index;
    }
  }

  return -1;
}

// -----------------------------------------
// MARK QUOTA EXHAUSTED
// -----------------------------------------

function markKeyExhausted(
  keyIndex
) {
  exhaustedKeys.add(
    keyIndex
  );

  currentKeyIndex =
    (keyIndex + 1) %
    clients.length;
}

// -----------------------------------------
// CLEAN GEMINI JSON
// -----------------------------------------

function cleanGeminiResponse(
  text
) {
  return text
    .replace(
      /^```json\s*/i,
      ""
    )
    .replace(
      /^```\s*/i,
      ""
    )
    .replace(
      /\s*```$/i,
      ""
    )
    .trim();
}

// =====================================================
// FRUIT DATA GENERATOR
// =====================================================

async function generateFruitData(
  fruitName
) {
  // ===================================================
  // PROMPT
  // ===================================================

  const prompt = `
You are writing content for Pomona, a detailed digital fruit encyclopedia.

Fruit requested by the user:
${fruitName}

Your job is to determine whether this input actually refers to a fruit,
and if it does, create rich, accurate, readable encyclopedia content.

IMPORTANT VALIDATION RULES:
- First determine whether the user's input actually refers to a fruit.
- Return "isFruit": false for nonsense, unrelated words, people, places,
  objects, fictional characters, colors, concepts, random text, or things
  that are not fruits.
- Do NOT reinterpret nonsense or unrelated text as a known fruit.
- Do NOT guess that a strange word "probably means" another fruit.
- Only return "isFruit": true when the input can reasonably be identified
  as a real fruit or fruit-producing plant.
- If "isFruit": false, leave all other fields empty and do not invent data.

SCIENTIFIC IDENTITY RULES:
- When isFruit is true, provide the accepted scientific/binomial name
  when one exists.
- Provide the botanical family.
- Provide the genus.
- Provide the species.
- Do not invent taxonomy.
- If the common name refers to multiple species, clearly explain that
  instead of pretending there is one exact species.
- Use careful scientific wording whenever taxonomy varies.

CONTENT RULES:
- Return ONLY valid JSON.
- Do NOT return markdown.
- Do NOT return code fences.
- Do NOT add explanations before or after the JSON.
- Write substantial content rather than short one-line answers.
- Avoid repetition between sections.
- Prefer well-established factual information.
- Do not invent specific dates, measurements, scientific claims,
  cultivar characteristics, or historical events when uncertain.
- When a fact is uncertain or varies by cultivar/region, use careful wording
  such as "some cultivars", "typically", or "can".
- Do not make medical claims or claim that a fruit treats or cures diseases.
- Nutrition should describe commonly recognized nutritional characteristics
  without inventing precise laboratory values.
- The writing should feel like a high-quality encyclopedia, not an AI chatbot.

CONTENT LENGTH:
- originHistory.summary: about 80-120 words.
- originHistory.detailedHistory: about 250-400 words.
- originHistory.originRegion: about 50-100 words.
- originHistory.historicalSpread: about 150-250 words.
- originHistory.culturalImportance: about 100-200 words.
- nutrition: about 200-300 words.
- growingConditions: about 250-350 words.
- harvest.description: about 180-250 words.
- diseases: about 200-300 words.
- companionPlants: about 150-220 words.
- cultivars: about 200-300 words.
- interestingFacts: exactly 8 useful and genuinely interesting facts.
- scientificFacts: exactly 8 scientifically relevant facts.

HARVEST RULES:
- harvest.seasons must contain one or more of:
  "Spring", "Summer", "Autumn", "Winter".
- harvest.months must contain likely harvest months as full month names.

RETURN EXACTLY THIS JSON STRUCTURE:

{
  "isFruit": true,
  "latinName": "",
  "family": "",
  "genus": "",
  "species": "",

  "originHistory": {
    "summary": "",
    "detailedHistory": "",
    "originRegion": "",
    "historicalSpread": "",
    "culturalImportance": ""
  },

  "nutrition": "",

  "growingConditions": "",

  "harvest": {
    "description": "",
    "seasons": [],
    "months": []
  },

  "diseases": "",

  "companionPlants": "",

  "cultivars": "",

  "interestingFacts": [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],

  "scientificFacts": [
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ]
}

For an invalid/non-fruit input, return the same structure with:

"isFruit": false

and leave every other field empty.
`;

  // ===================================================
  // KEY ROTATION LOOP
  // ===================================================

  let keysAttempted = 0;

  while (
    keysAttempted < clients.length
  ) {
    const keyIndex =
      getNextAvailableKey();

    // -----------------------------------------------
    // ALL KEYS EXHAUSTED
    // -----------------------------------------------

    if (keyIndex === -1) {
      const quotaError =
        new Error(
          "Gemini fruit generation quota exhausted."
        );

      quotaError.code =
        "GEMINI_QUOTA_EXHAUSTED";

      quotaError.status = 429;

      throw quotaError;
    }

    currentKeyIndex =
      keyIndex;

    const client =
      clients[keyIndex];

    keysAttempted++;

    console.log(
      `🤖 Gemini key ${keyIndex + 1}/${clients.length} → ${fruitName}`
    );

    // -----------------------------------------------
    // RETRY CURRENT KEY
    // -----------------------------------------------

    const maxRetries = 2;

    for (
      let attempt = 0;
      attempt <= maxRetries;
      attempt++
    ) {
      try {
        const response =
          await client.models.generateContent(
            {
              model:
                "gemini-3.5-flash",

              contents:
                prompt,

              config: {
                responseMimeType:
                  "application/json",
              },
            }
          );

        // -------------------------------------------
        // RESPONSE TEXT
        // -------------------------------------------

        const text =
          response.text;

        if (!text) {
          throw new Error(
            "Gemini returned an empty response."
          );
        }

        // -------------------------------------------
        // CLEAN RESPONSE
        // -------------------------------------------

        const cleaned =
          cleanGeminiResponse(
            text
          );

        // -------------------------------------------
        // PARSE JSON
        // -------------------------------------------

        let parsed;

        try {
          parsed =
            JSON.parse(
              cleaned
            );
        } catch (parseError) {
          console.error(
            "❌ Gemini returned invalid JSON."
          );

          console.error(
            "Response preview:",
            cleaned.slice(0, 500)
          );

          if (
            attempt <
            maxRetries
          ) {
            console.log(
              "🔁 Retrying because JSON parsing failed..."
            );

            await new Promise(
              (resolve) =>
                setTimeout(
                  resolve,
                  1000
                )
            );

            continue;
          }

          throw new Error(
            "Gemini returned invalid JSON."
          );
        }

        // -------------------------------------------
        // BASIC RESPONSE VALIDATION
        // -------------------------------------------

        if (
          typeof parsed.isFruit !==
          "boolean"
        ) {
          console.error(
            "❌ Gemini response is missing isFruit."
          );

          if (
            attempt <
            maxRetries
          ) {
            console.log(
              "🔁 Retrying because response structure is invalid..."
            );

            await new Promise(
              (resolve) =>
                setTimeout(
                  resolve,
                  1000
                )
            );

            continue;
          }

          throw new Error(
            "Gemini response is missing isFruit."
          );
        }

        // -------------------------------------------
        // NON-FRUIT
        // -------------------------------------------

        if (
          parsed.isFruit === false
        ) {
          console.log(
            `🚫 Gemini rejected "${fruitName}" as a fruit.`
          );

          return {
            isFruit: false,

            latinName: "",
            family: "",
            genus: "",
            species: "",

            originHistory: {
              summary: "",
              detailedHistory: "",
              originRegion: "",
              historicalSpread: "",
              culturalImportance:
                "",
            },

            nutrition: "",
            growingConditions:
              "",

            harvest: {
              description: "",
              seasons: [],
              months: [],
            },

            diseases: "",
            companionPlants: "",
            cultivars: "",

            interestingFacts:
              [],

            scientificFacts:
              [],
          };
        }

        // -------------------------------------------
        // SCIENTIFIC NAME CHECK
        // -------------------------------------------

        if (
          !parsed.latinName ||
          typeof parsed.latinName !==
            "string" ||
          !parsed.latinName.trim()
        ) {
          console.error(
            `⚠ Gemini marked "${fruitName}" as a fruit but returned no scientific name.`
          );

          if (
            attempt <
            maxRetries
          ) {
            console.log(
              "🔁 Retrying because scientific identity is missing..."
            );

            await new Promise(
              (resolve) =>
                setTimeout(
                  resolve,
                  1000
                )
            );

            continue;
          }

          throw new Error(
            "Gemini returned a fruit without a scientific name."
          );
        }

        // -------------------------------------------
        // SUCCESS
        // -------------------------------------------

        console.log(
          `✅ Gemini success → ${parsed.latinName}`
        );

        return parsed;
      } catch (error) {
        // -----------------------------------------
        // QUOTA ERROR
        // -----------------------------------------

        if (
          isQuotaError(error)
        ) {
          console.log(
            `🔄 Gemini key ${
              keyIndex + 1
            } reached quota.`
          );

          markKeyExhausted(
            keyIndex
          );

          console.log(
            `➡ Switching to next Gemini key...`
          );

          // Stop retrying this key.
          break;
        }

        // -----------------------------------------
        // TEMPORARY SERVER ERRORS
        // -----------------------------------------

        const status =
          error?.status;

        const retryable =
          status === 500 ||
          status === 503;

        if (
          retryable &&
          attempt <
            maxRetries
        ) {
          const delay =
            Math.pow(
              2,
              attempt
            ) * 1000;

          console.log(
            `⚠ Gemini temporary error (${status}).`
          );

          console.log(
            `🔁 Retrying in ${
              delay / 1000
            } seconds...`
          );

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                delay
              )
          );

          continue;
        }

        // -----------------------------------------
        // JSON / VALIDATION ERRORS
        // -----------------------------------------

        if (
          (
            error.message ===
              "Gemini returned invalid JSON." ||
            error.message ===
              "Gemini response is missing isFruit." ||
            error.message ===
              "Gemini returned a fruit without a scientific name."
          ) &&
          attempt <
            maxRetries
        ) {
          console.log(
            "🔁 Retrying Gemini..."
          );

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                1000
              )
          );

          continue;
        }

        // -----------------------------------------
        // FINAL ERROR FOR CURRENT KEY
        // -----------------------------------------

        throw error;
      }
    }
  }

  // ===================================================
  // SAFETY FALLBACK
  // ===================================================

  const quotaError =
    new Error(
      "All Gemini API keys were exhausted."
    );

  quotaError.code =
    "GEMINI_QUOTA_EXHAUSTED";

  quotaError.status = 429;

  throw quotaError;
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  generateFruitData,
};