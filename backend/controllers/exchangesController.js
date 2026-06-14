// =========================================================
// controllers/exchangesController.js
// =========================================================
const exchangesService = require("../services/exchangesService");

async function getExchanges(req, res) {
  const { studentID } = req.params;

  try {
    const rows = await exchangesService.getExchangesByStudentID(studentID);

    return res.status(200).json({
      success: true,
      data: rows,
      message: "Exchange history fetched successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch exchange history.",
    });
  }
}

module.exports = { getExchanges };
