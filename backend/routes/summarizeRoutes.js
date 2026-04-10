import express from "express";
import axios from "axios";

console.log("🔥 summarizeRoutes file LOADED");

const router = express.Router();

// ✅ Use STABLE inference endpoint (NOT router)
const HF_API_URL =
  "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";

router.post("/", async (req, res) => {
  console.log("📥 POST /api/summarize HIT");

  try {
    const { text } = req.body;

    // ✅ Validate input
    if (!text || text.length < 100) {
      return res.status(400).json({
        success: false,
        message: "Text must be at least 100 characters",
      });
    }

    // ✅ Check token
    if (!process.env.HF_TOKEN) {
      return res.status(500).json({
        success: false,
        message: "HF_TOKEN missing in .env",
      });
    }

    // ✅ Prevent extremely large payload
    const safeText = text.slice(0, 8000);

    const prompt = `
You are a botanical research expert.

Generate a comprehensive academic-style article from the following plant database information.

Expand all sections clearly with proper headings including:
- Botanical classification
- Morphology
- Geographic distribution
- Phytochemistry
- Medicinal properties
- Ayurvedic significance
- Traditional uses
- Pharmacological studies
- Safety and precautions
- Cultivation methods

Write in structured paragraphs with headings.
Avoid repetition.
Be detailed and educational.

Plant Data:
${safeText}
`;

    console.log("🚀 Sending request to HuggingFace...");
    console.log("📄 Input length:", safeText.length);

    const response = await axios.post(
      HF_API_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.15,
          return_full_text: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 180000,
      }
    );

    console.log("📦 HF Raw Response Type:", typeof response.data);

    let generatedText = null;

    // ✅ Handle multiple HF response formats
    if (Array.isArray(response.data)) {
      generatedText = response.data[0]?.generated_text;
    } else if (response.data?.generated_text) {
      generatedText = response.data.generated_text;
    } else if (typeof response.data === "string") {
      generatedText = response.data;
    }

    if (!generatedText) {
      console.log("⚠️ Unexpected HF Response:", response.data);
      throw new Error("Invalid response structure from HuggingFace");
    }

    console.log("✅ Article generated successfully");
    console.log("📄 Output length:", generatedText.length);

    return res.json({
      success: true,
      summary: generatedText.trim(),
    });

  } catch (error) {
    console.error("🔥 HUGGINGFACE ERROR");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.error ||
        JSON.stringify(error.response?.data) ||
        error.message ||
        "AI article generation failed",
    });
  }
});

export default router;