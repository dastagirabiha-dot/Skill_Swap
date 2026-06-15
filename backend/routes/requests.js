// =========================================================
// routes/requests.js
// POST /request/send
// POST /request/accept
// =========================================================
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ---------------- SEND REQUEST ----------------
router.post("/send", async (req, res) => {
  const { senderID, receiverID, skillID, offeredSkillID } = req.body;

  if (!senderID || !receiverID || !skillID || !offeredSkillID) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    await db.query(
      "CALL SendRequest(?,?,?,?)",
      [senderID, receiverID, skillID, offeredSkillID]
    );

    return res.status(201).json({
      success: true,
      message: "Swap request sent successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to send request",
    });
  }
});

// ---------------- ACCEPT REQUEST ----------------
router.post("/accept", async (req, res) => {
  const { requestID } = req.body;

  if (!requestID) {
    return res.status(400).json({
      success: false,
      message: "requestID required",
    });
  }

  try {
    await db.query(
      "CALL AcceptRequest(?)",
      [requestID]
    );

    return res.status(200).json({
      success: true,
      message: "Request accepted and exchange recorded",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to accept request",
    });
  }
});

module.exports = router;
