// =========================================================
// routes/auth.js
// POST /register
// POST /login
// =========================================================
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ---------------- REGISTER ----------------
router.post("/register", async (req, res) => {
  const { name, email, password, phonenumber, teachSkills, learnSkills } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    // 1. Call RegisterStudent (which returns user profile row without department)
    const [result] = await db.query(
      "CALL RegisterStudent(?,?,?,?)",
      [name, email, password, phonenumber || null]
    );

    const user = result[0][0];
    const studentID = user.studentID;

    // 2. Loop & call AddOfferedSkill for teachSkills
    if (Array.isArray(teachSkills)) {
      for (const skillID of teachSkills) {
        await db.query(
          "CALL AddOfferedSkill(?,?)",
          [studentID, parseInt(skillID)]
        );
      }
    }

    // 3. Loop & call AddDesiredSkill for learnSkills
    if (Array.isArray(learnSkills)) {
      for (const skillID of learnSkills) {
        await db.query(
          "CALL AddDesiredSkill(?,?)",
          [studentID, parseInt(skillID)]
        );
      }
    }

    return res.status(201).json({
      success: true,
      data: user,
    });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || "Server error",
    });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing credentials",
    });
  }

  try {
    const [result] = await db.query(
      "CALL LoginStudent(?,?)",
      [email, password]
    );

    const user = result[0][0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

module.exports = router;
