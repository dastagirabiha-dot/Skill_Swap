// =========================================================
// controllers/profileController.js
// =========================================================
const profileService = require("../services/profileService");

async function getProfile(req, res) {
  const { studentID } = req.params;

  try {
    const rows = await profileService.getProfileByStudentID(studentID);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Student not found.",
      });
    }

    const desiredSkills = await profileService.getDesiredSkillsByStudentID(studentID);

    return res.status(200).json({
      success: true,
      data: {
        profile: rows,
        desiredSkills: desiredSkills
      },
      message: "Profile fetched successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch profile.",
    });
  }
}

module.exports = { getProfile };
