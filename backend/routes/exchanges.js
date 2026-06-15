// =========================================================
// routes/exchanges.js
// GET /exchanges/:studentID
// =========================================================
const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:studentID", async (req, res) => {
  const { studentID } = req.params;

  if (!studentID) {
    return res.status(400).json({
      success: false,
      message: "StudentID parameter is required",
    });
  }

  try {
    const [result] = await db.query(
      "CALL GetExchanges(?)",
      [studentID]
    );

    return res.status(200).json({
      success: true,
      data: result[0],
      message: "Exchange history fetched successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch exchange history.",
    });
  }
});

module.exports = router;
