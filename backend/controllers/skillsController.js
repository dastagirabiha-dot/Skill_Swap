// =========================================================
// controllers/skillsController.js
// =========================================================
const skillsService = require("../services/skillsService");

async function searchSkills(req, res) {
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({
      success: false,
      data: null,
      message: "query parameter is required.",
    });
  }

  try {
    const results = await skillsService.searchStudentsBySkill(query.trim());

    return res.status(200).json({
      success: true,
      data: results,
      message: `Found ${results.length} result(s) for "${query}".`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Skill search failed.",
    });
  }
}

async function getAllSkills(req, res) {
  try {
    const skills = await skillsService.getAllSkills();

    return res.status(200).json({
      success: true,
      data: skills,
      message: "Skills fetched successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch skills.",
    });
  }
}

module.exports = { searchSkills, getAllSkills };
