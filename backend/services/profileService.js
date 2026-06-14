// =========================================================
// services/profileService.js — DB calls for student profile
// Reads directly from the Student_profile VIEW.
// =========================================================
const db = require("../config/db");

/**
 * Pull full profile from the Student_profile view.
 * The view already joins Students + Offered_skills + Skills.
 */
async function getProfileByStudentID(studentID) {
  const [rows] = await db.execute(
    `SELECT * FROM Student_profile WHERE studentID = ?`,
    [studentID]
  );
  return rows;
}

/**
 * Pull desired skills for a student from Desired_skills joined with Skills.
 */
async function getDesiredSkillsByStudentID(studentID) {
  const [rows] = await db.execute(
    `SELECT sk.skillID, sk.skill_name
     FROM Desired_skills ds
     JOIN Skills sk ON ds.skillID = sk.skillID
     WHERE ds.studentID = ?`,
    [studentID]
  );
  return rows;
}

module.exports = { getProfileByStudentID, getDesiredSkillsByStudentID };
