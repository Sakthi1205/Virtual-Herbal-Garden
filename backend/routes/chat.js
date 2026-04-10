import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Plant from "../models/Plant.js";

dotenv.config();

const router = express.Router();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

/*
  🧠 Simple In-Memory Conversation Store
  (For production use Redis or DB)
*/
const conversationStore = new Map();

/*
  🔹 Helper: Format Plant Context
*/
const formatPlantContext = (plant) => {
  if (!plant) return "";

  return `
Plant Database Information:

Name: ${plant.plantName}
Scientific Name: ${plant.scientificName || ""}
Family: ${plant?.taxonomy?.family || ""}
Geographic Distribution: ${plant?.geographicDistribution || ""}
Primary Uses: ${plant?.medicinalProperties
    ?.map((p) => p.property)
    .join(", ") || ""}
Ayurvedic Actions: ${plant?.ayurvedicProfile?.ayurvedicActions?.join(", ") || ""}
Key Phytochemicals: ${plant?.phytochemistry?.join(", ") || ""}
Climate: ${plant?.growingConditions?.climate || ""}
Soil Type: ${plant?.growingConditions?.soilType || ""}
Water Needs: ${plant?.growingConditions?.waterNeeds || ""}
`;
};

/*
  🔹 Detect plant question
*/
const isPlantQuestion = (message, plantMatch) => {
  if (plantMatch) return true;

  const plantKeywords = [
    "plant",
    "herb",
    "medicinal",
    "uses",
    "benefits",
    "growing",
    "ayurveda",
    "phytochemistry",
    "taxonomy",
  ];

  return plantKeywords.some((word) =>
    message.toLowerCase().includes(word)
  );
};

router.post("/", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // 🧠 Create session if not exists
    const userSession = sessionId || "default-user";

    if (!conversationStore.has(userSession)) {
      conversationStore.set(userSession, []);
    }

    const conversationHistory = conversationStore.get(userSession);

    console.log("💬 User:", message);

    /*
      🌿 Detect plant mention
    */
    const plantMatch = await Plant.findOne({
      $or: [
        { plantName: { $regex: message, $options: "i" } },
        { commonName: { $regex: message, $options: "i" } },
      ],
    });

    const plantContext = formatPlantContext(plantMatch);
    const plantRelated = isPlantQuestion(message, plantMatch);

    /*
      🌿 Structured prompt
    */
    const structuredSystemPrompt = `
You are an expert medicinal plant assistant for a Herbal Garden web application.

FORMAT RULES:
- Use Markdown format.
- Use "##" for headings.
- Use bullet points.
- Avoid long paragraphs.
- Add "## ⚠️ Safety Disclaimer" if medical advice is given.
`;

    /*
      💬 Normal prompt
    */
    const normalSystemPrompt = `
You are a helpful AI assistant for a Herbal Garden web app.
Respond naturally and conversationally.
Do not force structured sections unless needed.
`;

    const systemPrompt = plantRelated
      ? structuredSystemPrompt
      : normalSystemPrompt;

    /*
      🧠 Build message array with memory
    */
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      {
        role: "user",
        content: `
${message}
${plantRelated ? plantContext : ""}
`
      }
    ];

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.3,
        max_tokens: 800
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    const aiReply = response.data?.choices?.[0]?.message?.content;

    /*
      🧠 Save conversation
    */
    conversationHistory.push(
      { role: "user", content: message },
      { role: "assistant", content: aiReply }
    );

    // Keep only last 10 exchanges (20 messages)
    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, conversationHistory.length - 20);
    }

    conversationStore.set(userSession, conversationHistory);

    return res.json({
      success: true,
      reply: aiReply
    });

  } catch (error) {
    console.error("Chatbot Error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "AI assistant failed"
    });
  }
});

export default router;