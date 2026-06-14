// =========================================================
// controllers/requestsController.js
// =========================================================
const requestsService = require("../services/requestsService");

async function sendRequest(req, res) {
  const { senderID, receiverID, skillID, offeredSkillID } = req.body;

  if (!senderID || !receiverID || !skillID || !offeredSkillID) {
    return res.status(400).json({
      success: false,
      data: null,
      message:
        "senderID, receiverID, skillID, and offeredSkillID are required.",
    });
  }

  try {
    await requestsService.sendRequest({
      senderID,
      receiverID,
      skillID,
      offeredSkillID,
    });

    return res.status(201).json({
      success: true,
      data: null,
      message: "Swap request sent successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to send request.",
    });
  }
}

async function acceptRequest(req, res) {
  const { requestID } = req.body;

  if (!requestID) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "requestID is required.",
    });
  }

  try {
    await requestsService.acceptRequest(requestID);

    return res.status(200).json({
      success: true,
      data: null,
      message: "Request accepted and exchange recorded.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to accept request.",
    });
  }
}

module.exports = { sendRequest, acceptRequest };
