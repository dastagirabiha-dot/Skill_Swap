// =========================================================
// profile.js — Handles displaying student profile info
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return; // Protected by checkAuth in common.js

  loadProfile(currentUser.studentID);
});

async function loadProfile(studentID) {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${studentID}`);
    const result = await response.json();

    if (result.success && result.data) {
      const { profile, desiredSkills } = result.data;

      // Extract general details from the first profile row
      const details = profile[0];
      
      document.getElementById("student-name").textContent = details.name;
      document.getElementById("student-email").textContent = details.email;
      document.getElementById("student-dept").textContent = details.department;
      document.getElementById("student-phone").textContent = details.phonenumber || "Not Provided";

      // 1. Render Offered Skills
      const offeredContainer = document.getElementById("offered-skills-list");
      
      // Filter out null rows (occurs if student has no offered skills due to LEFT JOIN)
      const validOffered = profile.filter(row => row.offered_skill !== null);

      if (validOffered.length === 0) {
        offeredContainer.innerHTML = `
          <span style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">
            No offered skills registered.
          </span>
        `;
      } else {
        // Render tags with proficiency stars
        offeredContainer.innerHTML = validOffered.map(row => `
          <span class="skill-tag">
            ${escapeHTML(row.offered_skill)}
            ${renderStars(row.proficiency)}
          </span>
        `).join("");
      }

      // 2. Render Desired Skills
      const desiredContainer = document.getElementById("desired-skills-list");

      if (!desiredSkills || desiredSkills.length === 0) {
        desiredContainer.innerHTML = `
          <span style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">
            No desired skills registered.
          </span>
        `;
      } else {
        desiredContainer.innerHTML = desiredSkills.map(row => `
          <span class="skill-tag">
            ${escapeHTML(row.skill_name)}
          </span>
        `).join("");
      }

    } else {
      console.error("Profile endpoint returned failure:", result.message);
    }
  } catch (error) {
    console.error("Error fetching profile details:", error);
  }
}
