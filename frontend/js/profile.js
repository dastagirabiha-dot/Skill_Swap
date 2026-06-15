// =========================================================
// profile.js — Handles displaying student profile info and skill updates
// =========================================================

let skillsList = [];

document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return; // Protected by checkAuth in common.js

  // Load master skills first, then load the student's profile
  await loadMasterSkills();
  await loadProfile(currentUser.studentID);
  setupFormHandler(currentUser.studentID);
});

// Show temporary validation warning on profile page
const profileAlert = document.getElementById("profile-alert");
function showProfileAlert(message, isError = true) {
  if (!profileAlert) return;
  profileAlert.textContent = message;
  profileAlert.className = `alert-banner ${isError ? 'alert-banner-error' : 'alert-banner-success'}`;
  profileAlert.style.display = "block";
}

async function loadMasterSkills() {
  try {
    const response = await fetch(`${API_BASE_URL}/skills/all`);
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      skillsList = result.data;
    } else {
      console.error("Failed to load skills from server, using fallback");
      skillsList = getFallbackSkills();
    }
  } catch (err) {
    console.error("Error fetching skills list:", err);
    skillsList = getFallbackSkills();
  }

  renderCheckboxGrid();
}

function getFallbackSkills() {
  return [
    { skillID: 1, skill_name: "Python" },
    { skillID: 2, skill_name: "Java" },
    { skillID: 3, skill_name: "JavaScript" },
    { skillID: 4, skill_name: "HTML" },
    { skillID: 5, skill_name: "CSS" },
    { skillID: 6, skill_name: "SQL" },
    { skillID: 7, skill_name: "C++" },
    { skillID: 8, skill_name: "Data Structures" },
    { skillID: 9, skill_name: "Algorithms" },
    { skillID: 10, skill_name: "Git" },
    { skillID: 11, skill_name: "React" },
    { skillID: 12, skill_name: "Node.js" }
  ];
}

function renderCheckboxGrid() {
  const teachContainer = document.getElementById("profile-teach-skills");
  const learnContainer = document.getElementById("profile-learn-skills");

  if (!teachContainer || !learnContainer) return;

  teachContainer.innerHTML = skillsList.map(s => `
    <label class="custom-checkbox-label" for="teach-cb-${s.skillID}">
      <input type="checkbox" class="custom-checkbox-input teach-checkbox" value="${s.skillID}" id="teach-cb-${s.skillID}">
      <span>${escapeHTML(s.skill_name)}</span>
    </label>
  `).join("");

  learnContainer.innerHTML = skillsList.map(s => `
    <label class="custom-checkbox-label" for="learn-cb-${s.skillID}">
      <input type="checkbox" class="custom-checkbox-input learn-checkbox" value="${s.skillID}" id="learn-cb-${s.skillID}">
      <span>${escapeHTML(s.skill_name)}</span>
    </label>
  `).join("");

  // Setup validation event listeners
  document.querySelectorAll(".teach-checkbox").forEach(cb => {
    cb.addEventListener("change", (e) => {
      if (e.target.checked) {
        const id = e.target.value;
        const matchingLearnCb = document.getElementById(`learn-cb-${id}`);
        if (matchingLearnCb && matchingLearnCb.checked) {
          matchingLearnCb.checked = false;
          const skillName = e.target.nextElementSibling.textContent;
          showProfileAlert(`⚠️ ${skillName} auto-removed from 'Want to Learn' to prevent duplicate selection.`, true);
          setTimeout(() => {
            if (profileAlert && profileAlert.textContent.includes("auto-removed")) {
              profileAlert.style.display = "none";
            }
          }, 3500);
        }
      }
    });
  });

  document.querySelectorAll(".learn-checkbox").forEach(cb => {
    cb.addEventListener("change", (e) => {
      if (e.target.checked) {
        const id = e.target.value;
        const matchingTeachCb = document.getElementById(`teach-cb-${id}`);
        if (matchingTeachCb && matchingTeachCb.checked) {
          matchingTeachCb.checked = false;
          const skillName = e.target.nextElementSibling.textContent;
          showProfileAlert(`⚠️ ${skillName} auto-removed from 'Can Teach' to prevent duplicate selection.`, true);
          setTimeout(() => {
            if (profileAlert && profileAlert.textContent.includes("auto-removed")) {
              profileAlert.style.display = "none";
            }
          }, 3500);
        }
      }
    });
  });
}

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
      document.getElementById("student-phone").textContent = details.phonenumber || "Not Provided";

      // 1. Render Offered Skills Tags
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

      // 2. Render Desired Skills Tags
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

      // 3. Pre-fill Checkboxes
      // Reset all checkboxes first
      document.querySelectorAll(".teach-checkbox, .learn-checkbox").forEach(cb => cb.checked = false);

      // Check the ones the student teaches
      validOffered.forEach(row => {
        const matchingSkill = skillsList.find(s => s.skill_name.toLowerCase() === row.offered_skill.toLowerCase());
        if (matchingSkill) {
          const cb = document.getElementById(`teach-cb-${matchingSkill.skillID}`);
          if (cb) cb.checked = true;
        }
      });

      // Check the ones the student wants to learn
      if (desiredSkills && desiredSkills.length > 0) {
        desiredSkills.forEach(row => {
          const cb = document.getElementById(`learn-cb-${row.skillID}`);
          if (cb) cb.checked = true;
        });
      }

    } else {
      console.error("Profile endpoint returned failure:", result.message);
    }
  } catch (error) {
    console.error("Error fetching profile details:", error);
  }
}

function setupFormHandler(studentID) {
  const form = document.getElementById("profile-skills-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect checked skills
    const teachSkills = Array.from(document.querySelectorAll(".teach-checkbox:checked")).map(cb => parseInt(cb.value));
    const learnSkills = Array.from(document.querySelectorAll(".learn-checkbox:checked")).map(cb => parseInt(cb.value));

    try {
      const response = await fetch(`${API_BASE_URL}/profile/${studentID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ teachSkills, learnSkills })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showProfileAlert("🎉 Skills updated successfully!", false);

        // Instantly update Offered Skills tags from checked teach checkboxes
        const offeredContainer = document.getElementById("offered-skills-list");
        const checkedTeach = Array.from(document.querySelectorAll(".teach-checkbox:checked"));
        if (offeredContainer) {
          if (checkedTeach.length === 0) {
            offeredContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">No offered skills registered.</span>`;
          } else {
            offeredContainer.innerHTML = checkedTeach.map(cb => {
              const skill = skillsList.find(s => s.skillID == cb.value);
              return skill ? `<span class="skill-tag">${escapeHTML(skill.skill_name)}</span>` : "";
            }).join("");
          }
        }

        // Instantly update Desired Skills tags from checked learn checkboxes
        const desiredContainer = document.getElementById("desired-skills-list");
        const checkedLearn = Array.from(document.querySelectorAll(".learn-checkbox:checked"));
        if (desiredContainer) {
          if (checkedLearn.length === 0) {
            desiredContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">No desired skills registered.</span>`;
          } else {
            desiredContainer.innerHTML = checkedLearn.map(cb => {
              const skill = skillsList.find(s => s.skillID == cb.value);
              return skill ? `<span class="skill-tag">${escapeHTML(skill.skill_name)}</span>` : "";
            }).join("");
          }
        }

        // Also do a full API refresh to sync server-side data (proficiency stars etc.)
        await loadProfile(studentID);

        // Auto-dismiss alert banner after 3.5s
        setTimeout(() => {
          if (profileAlert && profileAlert.textContent.includes("successfully")) {
            profileAlert.style.display = "none";
          }
        }, 3500);
      } else {
        showProfileAlert(result.message || "Failed to save skill changes.", true);
      }
    } catch (err) {
      console.error("Error saving profile changes:", err);
      showProfileAlert("Failed to connect to the backend. Please verify it is running.", true);
    }
  });
}