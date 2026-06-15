// =========================================================
// routes/skills.js
// GET /skills/search?query=...
// GET /skills/all
// GET /skills/popularity
// =========================================================
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ---------------- SEARCH SKILLS ----------------
router.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "query parameter is required",
    });
  }

  try {
    const [result] = await db.query(
      "CALL SearchSkills(?)",
      [query.trim()]
    );

    return res.status(200).json({
      success: true,
      data: result[0],
      message: "Search completed",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Skill search failed",
    });
  }
});

// ---------------- GET ALL SKILLS ----------------
router.get("/all", async (req, res) => {
  try {
    const [result] = await db.query(
      "CALL GetAllSkills()"
    );

    return res.status(200).json({
      success: true,
      data: result[0],
      message: "Skills fetched successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch skills",
    });
  }
});

// ---------------- GET SKILLS POPULARITY ----------------
router.get("/popularity", async (req, res) => {
  try {
    const [result] = await db.query(
      "CALL GetSkillsPopularity()"
    );

    return res.status(200).json({
      success: true,
      data: result[0],
      message: "Skills popularity statistics fetched successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch skills popularity statistics",
    });
  }
});

module.exports = router;
