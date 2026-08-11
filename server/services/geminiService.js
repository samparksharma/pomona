const { GoogleGenAI } =
  require("@google/genai");

const ai =
  new GoogleGenAI({
    apiKey:
      process.env.GEMINI_API_KEY,
  });

async function generateFruitData(
  fruitName
) {
  const prompt = `
Create a detailed fruit encyclopedia entry.

Fruit: ${fruitName}

Rules:

- Return ONLY valid JSON.
- No markdown.
- No explanations.
- No code blocks.
- Write concise but informative content.
- interestingFacts must contain exactly 5 facts.
- scientificFacts must contain exactly 5 facts.

JSON format:

{
  "originHistory": "",
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
    ""
  ],
  "scientificFacts": [
    "",
    "",
    "",
    "",
    ""
  ]
}
`;

  const response =
    await ai.models.generateContent({
     model: "gemini-3.5-flash",
      contents: prompt,
    });

  return response.text;
}

module.exports = {
  generateFruitData,
};