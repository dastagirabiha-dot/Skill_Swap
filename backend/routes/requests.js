// =========================================================
// routes/requests.js
// POST /request/send
// POST /request/accept
// =========================================================
const express = require("express");
const router = express.Router();
const requestsController = require("../controllers/requestsController");

router.post("/send", requestsController.sendRequest);
router.post("/accept", requestsController.acceptRequest);

module.exports = router;
