import express from "express";
import Plant from "../models/Plant.js";

const router = express.Router();

/* =====================================
   🌿 CREATE NEW PLANT
===================================== */
router.post("/plants", async (req, res) => {
  try {
    const data = req.body;

    if (!data.plantName) {
      return res.status(400).json({
        success: false,
        message: "Plant name is required",
      });
    }

    data.normalizedPlantName = data.plantName
      .toLowerCase()
      .replace(/\s+/g, "");

    data.lastUpdated = new Date();

    const plant = await Plant.create(data);

    res.status(201).json({
      success: true,
      plant,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

/* =====================================
   🌿 GET ALL PLANTS (WITH SEARCH)
===================================== */
router.get("/plants", async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};

    if (search) {
      filter = {
        $or: [
          { plantName: { $regex: search, $options: "i" } },
          { scientificName: { $regex: search, $options: "i" } },
        ],
      };
    }

    const plants = await Plant.find(filter).sort({ lastUpdated: -1 });

    // 🔥 IMPORTANT: return plain array for frontend
    res.status(200).json(plants);

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* =====================================
   🌿 GET SINGLE PLANT
===================================== */
router.get("/plants/:id", async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: "Plant not found",
      });
    }

    res.status(200).json(plant);

  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

/* =====================================
   🌿 UPDATE PLANT
===================================== */
router.put("/plants/:id", async (req, res) => {
  try {
    const data = req.body;

    if (data.plantName) {
      data.normalizedPlantName = data.plantName
        .toLowerCase()
        .replace(/\s+/g, "");
    }

    data.lastUpdated = new Date();

    const updatedPlant = await Plant.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedPlant) {
      return res.status(404).json({
        success: false,
        message: "Plant not found",
      });
    }

    res.status(200).json(updatedPlant);

  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

/* =====================================
   🌿 DELETE PLANT
===================================== */
router.delete("/plants/:id", async (req, res) => {
  try {
    const deletedPlant = await Plant.findByIdAndDelete(req.params.id);

    if (!deletedPlant) {
      return res.status(404).json({
        success: false,
        message: "Plant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Plant deleted successfully",
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;