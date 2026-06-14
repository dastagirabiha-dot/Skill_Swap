// =========================================================
// controllers/authController.js
// Thin layer: validate input → call service → return JSON.
// =========================================================
const authService = require("../services/authService");

async function register(req, res) {
  const { name, email, password, department, phonenumber } = req.body;

  if (!name || !email || !password || !department) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "name, email, password, and department are required.",
    });
  }

  try {
    const insertedID = await authService.registerStudent({
      name,
      email,
      password,
      department,
      phonenumber,
    });

    return res.status(201).json({
      success: true,
      data: { studentID: insertedID },
      message: "Student registered successfully.",
    });
  } catch (err) {
    // Duplicate email → MySQL error 1062
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        data: null,
        message: "An account with this email already exists.",
      });
    }
    return res.status(500).json({
      success: false,
      data: null,
      message: "Registration failed. Please try again.",
    });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "email and password are required.",
    });
  }

  try {
    const student = await authService.findStudentByEmailAndPassword(
      email,
      password
    );

    if (!student) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
      message: "Login successful.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Login failed. Please try again.",
    });
  }
}

module.exports = { register, login };
