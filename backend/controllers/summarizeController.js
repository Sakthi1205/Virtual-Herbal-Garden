const axios = require("axios");

// ✅ Free, Router-Compatible Instruction Model
const HF_API_URL =
  "https://router.huggingface.co/hf-inference/models/HuggingFaceH4/zephyr-7b-beta";

exports.summarizeText = async (req, res) => {
  console.log("📥 Request received");

  try {
    let inputText = "";

    // ✅ Accept text or full plantData
    if (req.body.text && req.body.text.length > 50) {
      inputText = req.body.text;
    } else if (req.body.plantData) {
      inputText = JSON.stringify(req.body.plantData, null, 2);
    } else {
      return res.status(400).json({
        success: false,
        message: "Text or plantData required",
      });
    }

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({
        success: false,
        message: "HF_TOKEN missing in environment variables",
      });
    }

    // ✅ Prevent extremely large payloads
    const safeText = inputText.slice(0, 8000);

    console.log("📤 Sending to HuggingFace...");
    console.log("Input size:", safeText.length);

    // 🔥 Instruction-style prompt
    const prompt = `
You are a botanical research expert.

Generate a comprehensive academic-style article from the plant data below.

Structure the output with clear headings:
- Botanical Classification
- Morphology
- Geographic Distribution
- Phytochemistry
- Medicinal Properties
- Ayurvedic Significance
- Traditional Uses
- Pharmacological Studies
- Safety and Precautions
- Cultivation Methods

Expand scientifically. Avoid repetition. Be detailed and educational.

Plant Data:
${safeText}
`;

    const hfResponse = await axios.post(
      HF_API_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 1200,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.15,
          return_full_text: false
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 180000,
      }
    );

    let generatedText = null;

    if (Array.isArray(hfResponse.data)) {
      generatedText = hfResponse.data[0]?.generated_text;
    } else if (hfResponse.data?.generated_text) {
      generatedText = hfResponse.data.generated_text;
    }

    if (!generatedText) {
      console.log("⚠️ HF Raw Response:", hfResponse.data);
      throw new Error("Invalid response structure from HuggingFace");
    }

    console.log("✅ Generation successful");
    console.log("Generated length:", generatedText.length);

    res.json({
      success: true,
      summary: generatedText,
    });

  } catch (error) {
    console.error("🔥 FULL ERROR OBJECT:");
    console.dir(error.response?.data || error, { depth: null });

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.error ||
        error.response?.data ||
        error.message ||
        "Large content generation failed",
    });
  }
};