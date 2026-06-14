// =========================================================
// routes/skills.js
// GET /skills/search?query=...
// GET /skills/all
// =========================================================
const express = require("express");
const router = express.Router();
const skillsController = require("../controllers/skillsController");

router.get("/search", skillsController.searchSkills);
router.get("/all", skillsController.getAllSkills);

module.exports = router;
