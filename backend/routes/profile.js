// =========================================================
// routes/profile.js
// GET /profile/:studentID
// =========================================================
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

router.get("/:studentID", profileController.getProfile);

module.exports = router;
