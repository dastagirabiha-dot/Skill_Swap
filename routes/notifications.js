// =========================================================
// routes/notifications.js
// GET /notifications/:userID
// =========================================================
const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:userID", async (req, res) => {
  const { userID } = req.params;

  if (!userID) {
    return res.status(400).json({
      success: false,
      message: "UserID parameter is required",
    });
  }

  try {
    const [result] = await db.query(
      "CALL GetNotifications(?)",
      [userID]
    );

    return res.status(200).json({
      success: true,
      data: result[0],
      message: "Notifications fetched successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch notifications.",
    });
  }
});

module.exports = router;
