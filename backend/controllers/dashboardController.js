// =========================================================
// controllers/dashboardController.js
// =========================================================
const dashboardService = require("../services/dashboardService");

async function getDashboard(req, res) {
  const { studentID } = req.params;

  try {
    const rows = await dashboardService.getDashboardByStudentID(studentID);

    return res.status(200).json({
      success: true,
      data: rows,
      message: "Dashboard fetched successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch dashboard.",
    });
  }
}

module.exports = { getDashboard };
