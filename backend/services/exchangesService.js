// =========================================================
// services/exchangesService.js — DB calls for exchange history
// Reads from the ExchangeHistory VIEW.
// =========================================================
const db = require("../config/db");

/**
 * Fetch all completed exchanges where this student was
 * the sender or receiver, using the ExchangeHistory view.
 */
async function getExchangesByStudentID(studentID) {
  const [rows] = await db.execute(
    `SELECT eh.*
     FROM ExchangeHistory eh
     JOIN Requests r ON eh.request_ID = r.request_ID
     WHERE r.senderID = ? OR r.receiverID = ?
     ORDER BY eh.completed_at DESC`,
    [studentID, studentID]
  );
  return rows;
}

module.exports = { getExchangesByStudentID };
