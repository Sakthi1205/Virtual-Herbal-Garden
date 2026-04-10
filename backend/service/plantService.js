import axios from "axios";
import * as cheerio from "cheerio";
import groq from "./groqservice.js";


// 🌿 1. FETCH CLEAN HTML FROM WIKIPEDIA
const fetchWikiHTML = async (plantName) => {
  const res = await axios.get(
    "https://en.wikipedia.org/w/api.php",
    {
      params: {
        action: "parse",
        page: plantName,
        format: "json",
        prop: "text"
      }
    }
  );

  return res.data.parse.text["*"];
};


// 🌿 2. EXTRACT IMPORTANT CONTENT
const extractContent = (html) => {
  const $ = cheerio.load(html);

  let paragraphs = [];

  $(".mw-parser-output > p").each((i, el) => {
    const text = $(el).text().trim();
    if (text) paragraphs.push(text);
  });

  // 🔥 Take first few meaningful paragraphs
  const description = paragraphs.slice(0, 5).join("\n");

  // 🔥 Extract headings + content
  let sections = {};
  let current = "";

  $(".mw-parser-output > h2, .mw-parser-output > p").each((i, el) => {
    const tag = $(el).prop("tagName");

    if (tag === "H2") {
      current = $(el).text().replace("[edit]", "").trim();
      sections[current] = "";
    } else if (tag === "P" && current) {
      sections[current] += $(el).text() + "\n";
    }
  });

  return {
    description,
    sections
  };
};


// 🌿 3. AI STRUCTURING (STRONG PROMPT)
const structureWithAI = async (content) => {
  const prompt = `
You are a plant biology expert.

Extract COMPLETE plant data from the given content.

STRICT RULES:
- Do NOT leave arrays empty
- If data exists → extract it
- If not → write "Not Available"
- Fill ALL fields properly

Return JSON:

{
  "scientificName": "",
  "description": "",
  "taxonomy": {
    "kingdom": "",
    "family": "",
    "genus": "",
    "species": ""
  },
  "medicinalProperties": [
    {
      "property": "",
      "description": ""
    }
  ],
  "phytochemistry": [],
  "traditionalUses": [],
  "geographicDistribution": ""
}

CONTENT:
${JSON.stringify(content)}
`;

  const response = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });

  let text = response.choices[0].message.content;

  // 🔥 Clean JSON
  text = text.replace(/```json|```/g, "").trim();

  return JSON.parse(text);
};


// 🌿 4. MAIN FUNCTION (USED BY CONTROLLER)
export const getCompletePlantData = async (plantName) => {
  try {
    console.log("🌐 Fetching from Wikipedia...");

    const html = await fetchWikiHTML(plantName);

    const extracted = extractContent(html);

    console.log("🤖 Sending to AI...");

    const structured = await structureWithAI(extracted);

    return {
      ...structured,
      rawContent: extracted,
      aiStructured: structured,
      images: [],
      model3D: "default.glb"
    };

  } catch (err) {
    console.error("❌ Service Error:", err.message);
    return null;
  }
};