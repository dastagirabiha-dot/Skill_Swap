// =========================================================
// routes/profile.js
// GET /profile/:studentID
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
      "CALL GetProfile(?)",
      [studentID]
    );

    const profile = result[0];
    const desiredSkills = result[1];

    if (!profile.length) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Student not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        profile,
        desiredSkills
      },
      message: "Profile fetched successfully."
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch profile."
    });
  }
});

router.put("/:studentID", async (req, res) => {
  const { studentID } = req.params;
  const { teachSkills, learnSkills } = req.body;

  if (!studentID) {
    return res.status(400).json({
      success: false,
      message: "StudentID parameter is required",
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Manage Offered Skills (Teach Skills)
    const [currentOfferedRows] = await connection.query(
      "SELECT skillID FROM Offered_skills WHERE studentID = ?",
      [studentID]
    );
    const currentOfferedIds = currentOfferedRows.map(row => row.skillID);

    // Skills to delete: in current, but not in teachSkills
    const offeredToDelete = currentOfferedIds.filter(id => !teachSkills.includes(id));
    if (offeredToDelete.length > 0) {
      await connection.query(
        "DELETE FROM Offered_skills WHERE studentID = ? AND skillID IN (?)",
        [studentID, offeredToDelete]
      );
    }

    // Skills to add: in teachSkills, but not in current
    const offeredToAdd = teachSkills.filter(id => !currentOfferedIds.includes(id));
    for (const skillID of offeredToAdd) {
      await connection.query("CALL AddOfferedSkill(?,?)", [studentID, parseInt(skillID)]);
    }

    // 2. Manage Desired Skills (Learn Skills)
    const [currentDesiredRows] = await connection.query(
      "SELECT skillID FROM Desired_skills WHERE studentID = ?",
      [studentID]
    );
    const currentDesiredIds = currentDesiredRows.map(row => row.skillID);

    // Skills to delete: in current, but not in learnSkills
    const desiredToDelete = currentDesiredIds.filter(id => !learnSkills.includes(id));
    if (desiredToDelete.length > 0) {
      await connection.query(
        "DELETE FROM Desired_skills WHERE studentID = ? AND skillID IN (?)",
        [studentID, desiredToDelete]
      );
    }

    // Skills to add: in learnSkills, but not in current
    const desiredToAdd = learnSkills.filter(id => !currentDesiredIds.includes(id));
    for (const skillID of desiredToAdd) {
      await connection.query("CALL AddDesiredSkill(?,?)", [studentID, parseInt(skillID)]);
    }

    await connection.commit();
    return res.status(200).json({
      success: true,
      message: "Skills updated successfully",
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error updating profile skills:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile skills: " + err.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;
