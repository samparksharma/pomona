const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateFruitData(fruitName) {
  const prompt = `
You are writing content for Pomona, a detailed digital fruit encyclopedia.

Fruit: ${fruitName}

Your job is to create rich, accurate, readable encyclopedia content.

IMPORTANT RULES:
- Return ONLY valid JSON.
- Do NOT return markdown.
- Do NOT use code fences.
- Do NOT add explanations before or after the JSON.
- Write substantial content rather than short one-line answers.
- Avoid repetition between sections.
- Prefer well-established factual information.
- Do not invent specific dates, measurements, scientific claims, cultivar characteristics, or historical events when you are uncertain.
- When a fact is uncertain or varies by cultivar/region, use careful wording such as "some cultivars", "typically", or "can".
- Do not make medical claims or claim that a fruit treats or cures diseases.
- Nutrition should describe commonly recognized nutritional characteristics without inventing precise laboratory values.
- The writing should feel like a high-quality encyclopedia, not an AI chatbot response.

CONTENT LENGTH:
- Provide the accepted scientific/binomial name when one exists.
- Provide the botanical family and genus.
- For species, provide the full species name, including genus, when appropriate.
- Do not invent taxonomy. If the common name refers to multiple species, clearly indicate that in the response rather than pretending there is one exact species.
- originHistory.summary: about 80-120 words.
- originHistory.detailedHistory: about 250-400 words.
- originHistory.originRegion: about 50-100 words.
- originHistory.historicalSpread: about 150-250 words.
- originHistory.culturalImportance: about 100-200 words.
- nutrition: about 200-300 words.
- growingConditions: about 250-350 words.
- harvest: about 180-250 words.
- diseases: about 200-300 words.
- companionPlants: about 150-220 words.
- cultivars: about 200-300 words.
- interestingFacts: exactly 8 useful and genuinely interesting facts.
- scientificFacts: exactly 8 scientifically relevant facts.

Return JSON using exactly this structure:

{

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

  "harvest": "",

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
    "",
    ""
  ]
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  return response.text;
}

module.exports = {
  generateFruitData,
};