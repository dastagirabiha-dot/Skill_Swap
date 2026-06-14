// =========================================================
// routes/exchanges.js
// GET /exchanges/:studentID
// =========================================================
const express = require("express");
const router = express.Router();
const exchangesController = require("../controllers/exchangesController");

router.get("/:studentID", exchangesController.getExchanges);

module.exports = router;
