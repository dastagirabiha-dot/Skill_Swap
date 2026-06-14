// =========================================================
// services/requestsService.js — DB calls for swap requests
//
// ARCHITECTURE NOTE:
//   send_request   → calls MySQL stored procedure
//   accept_request → calls AcceptRequestTransaction procedure
//
// Node.js does NOT touch Requests table directly.
// Triggers handle notifications + exchange creation inside MySQL.
// =========================================================
const db = require("../config/db");

/**
 * Call the send_request stored procedure.
 * Trigger trig__request_notification fires automatically in MySQL.
 */
async function sendRequest({ senderID, receiverID, skillID, offeredSkillID }) {
  await db.execute(`CALL send_request(?, ?, ?, ?)`, [
    senderID,
    receiverID,
    skillID,
    offeredSkillID,
  ]);
}

/**
 * Call the AcceptRequestTransaction stored procedure.
 * This procedure atomically:
 *   1. Sets request status = 'accepted'
 *   2. Inserts an Exchanges record
 * Triggers then fire for notifications.
 */
async function acceptRequest(requestID) {
  await db.execute(`CALL AcceptRequestTransaction(?)`, [requestID]);
}

module.exports = { sendRequest, acceptRequest };
