// =========================================================
// services/authService.js — Raw DB calls for auth
// No business logic. MySQL is the source of truth.
// =========================================================
const db = require("../config/db");

/**
 * Insert a new student into the Students table.
 * Returns the newly inserted row's ID.
 */
async function registerStudent({ name, email, password, department, phonenumber }) {
  const [result] = await db.execute(
    `INSERT INTO Students (name, email, password, department, phonenumber)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, password, department, phonenumber || null]
  );
  return result.insertId;
}

/**
 * Fetch a single student by email for login validation.
 * Password comparison stays in the DB query — Node just checks the row exists.
 */
async function findStudentByEmailAndPassword(email, password) {
  const [rows] = await db.execute(
    `SELECT studentID, name, email, department, phonenumber
     FROM Students
     WHERE email = ? AND password = ?`,
    [email, password]
  );
  return rows[0] || null;
}

module.exports = { registerStudent, findStudentByEmailAndPassword };
