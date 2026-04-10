import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Plant from "../models/Plant.js";

dotenv.config();

const router = express.Router();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

/*
  ✅ Improved Safe Getter
  - Formats arrays properly
  - Converts objects (like morphology) into readable text
  - Prevents raw JSON output
*/
const safeGet = (obj, path, defaultValue = "") => {
  try {
    const keys = path.split(".");
    let value = obj;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) return defaultValue;
    }

    // ✅ If Array
    if (Array.isArray(value)) {
      return value
        .slice(0, 5)
        .map((item) =>
          typeof item === "object"
            ? item.property ||
              item.name ||
              item.description ||
              ""
            : item
        )
        .join(", ");
    }

    // ✅ If Object (Fix for Morphology & similar fields)
    if (typeof value === "object") {
      return Object.entries(value)
        .map(
          ([key, val]) =>
            `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`
        )
        .join("; ");
    }

    return String(value || defaultValue);
  } catch {
    return defaultValue;
  }
};

/*
  ✅ Safe JSON Parser (prevents crash if AI adds trailing commas)
*/
const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");

    try {
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
};

router.post("/", async (req, res) => {
  try {
    const { plant1Name, plant2Name } = req.body;

    if (!plant1Name || !plant2Name) {
      return res.status(400).json({
        success: false,
        message: "Both plant names are required",
      });
    }

    // 🔍 Fetch plants from MongoDB
    const p1 = await Plant.findOne({
      $or: [
        { plantName: { $regex: plant1Name.trim(), $options: "i" } },
        { name: { $regex: plant1Name.trim(), $options: "i" } },
        { commonName: { $regex: plant1Name.trim(), $options: "i" } },
      ],
    });

    const p2 = await Plant.findOne({
      $or: [
        { plantName: { $regex: plant2Name.trim(), $options: "i" } },
        { name: { $regex: plant2Name.trim(), $options: "i" } },
        { commonName: { $regex: plant2Name.trim(), $options: "i" } },
      ],
    });

    if (!p1 || !p2) {
      return res.status(404).json({
        success: false,
        message: "One or both plants not found in database",
      });
    }

    console.log(`🌿 AI Comparing: ${p1.plantName} vs ${p2.plantName}`);
    console.log("🤖 Calling Groq API...");

    /*
      🧠 AI Prompt
      IMPORTANT:
      - Forces readable text
      - Prevents nested JSON in fields
    */
    const prompt = `
You are an expert botanist.

Compare the following two medicinal plants.

IMPORTANT:
- Return ONLY valid JSON.
- Do NOT include nested JSON inside plant1 or plant2 values.
- Use clear readable sentences or bullet-style text for each field.

Plant 1:
Name: ${p1.plantName}
Scientific Name: ${safeGet(p1, "scientificName")}
Family: ${safeGet(p1, "taxonomy.family")}
Morphology: ${safeGet(p1, "morphology")}
Geographic Distribution: ${safeGet(p1, "geographicDistribution")}
Primary Uses: ${safeGet(p1, "medicinalProperties")}
Ayurvedic Actions: ${safeGet(p1, "ayurvedicProfile.ayurvedicActions")}
Key Phytochemicals: ${safeGet(p1, "phytochemistry")}
Climate: ${safeGet(p1, "growingConditions.climate")}
Soil Type: ${safeGet(p1, "growingConditions.soilType")}
Water Needs: ${safeGet(p1, "growingConditions.waterNeeds")}

Plant 2:
Name: ${p2.plantName}
Scientific Name: ${safeGet(p2, "scientificName")}
Family: ${safeGet(p2, "taxonomy.family")}
Morphology: ${safeGet(p2, "morphology")}
Geographic Distribution: ${safeGet(p2, "geographicDistribution")}
Primary Uses: ${safeGet(p2, "medicinalProperties")}
Ayurvedic Actions: ${safeGet(p2, "ayurvedicProfile.ayurvedicActions")}
Key Phytochemicals: ${safeGet(p2, "phytochemistry")}
Climate: ${safeGet(p2, "growingConditions.climate")}
Soil Type: ${safeGet(p2, "growingConditions.soilType")}
Water Needs: ${safeGet(p2, "growingConditions.waterNeeds")}

Return EXACT format:

{
  "success": true,
  "summary": "",
  "comparison": [
    {"feature": "Scientific Name", "plant1": "", "plant2": ""},
    {"feature": "Family", "plant1": "", "plant2": ""},
    {"feature": "Morphology", "plant1": "", "plant2": ""},
    {"feature": "Geographic Distribution", "plant1": "", "plant2": ""},
    {"feature": "Primary Uses", "plant1": "", "plant2": ""},
    {"feature": "Ayurvedic Actions", "plant1": "", "plant2": ""},
    {"feature": "Key Phytochemicals", "plant1": "", "plant2": ""},
    {"feature": "Climate", "plant1": "", "plant2": ""},
    {"feature": "Soil Type", "plant1": "", "plant2": ""},
    {"feature": "Water Needs", "plant1": "", "plant2": ""}
  ]
}
`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 700,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const rawText =
      response.data?.choices?.[0]?.message?.content || "";

    if (!rawText) {
      throw new Error("Empty AI response");
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("AI did not return JSON");
    }

    const parsed = safeJsonParse(jsonMatch[0]);

    if (!parsed) {
      console.error("⚠️ Malformed AI JSON:", jsonMatch[0]);
      return res.status(500).json({
        success: false,
        message: "AI returned malformed JSON",
      });
    }

    return res.json(parsed);

  } catch (error) {
    console.error("Groq Error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "AI comparison failed",
    });
  }
});

export default router;