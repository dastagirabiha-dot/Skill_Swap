// =========================================================
// services/skillsService.js — DB calls for skill search
// Joins Skills + Offered_skills + Students.
// No ranking or filtering logic in Node — query does the work.
// =========================================================
const db = require("../config/db");

/**
 * Search students who offer a skill matching the query string.
 * Uses LIKE for partial matching — purely a DB operation.
 */
async function searchStudentsBySkill(query) {
  const [rows] = await db.execute(
    `SELECT
       s.studentID,
       s.name,
       s.email,
       s.department,
       sk.skillID,
       sk.skill_name,
       os.proficiency
     FROM Students s
     JOIN Offered_skills os ON s.studentID = os.studentID
     JOIN Skills sk         ON os.skillID  = sk.skillID
     WHERE sk.skill_name LIKE ?`,
    [`%${query}%`]
  );
  return rows;
}

/**
 * Return every skill in the master Skills table.
 */
async function getAllSkills() {
  const [rows] = await db.execute(`SELECT * FROM Skills ORDER BY skill_name`);
  return rows;
}

module.exports = { searchStudentsBySkill, getAllSkills };
