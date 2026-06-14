// =========================================================
// routes/dashboard.js
// GET /dashboard/:studentID
// =========================================================
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/:studentID", dashboardController.getDashboard);

module.exports = router;
