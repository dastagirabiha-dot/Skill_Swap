// =========================================================
// search.js — Skill search, card rendering, and exchange modal
// =========================================================

let masterSkills = [];
let currentUserOfferedSkills = [];
let selectedRequestData = null; // Holds the details for the request modal

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return; // Protected by checkAuth

  const searchForm = document.getElementById("search-form");
  const requestForm = document.getElementById("request-swap-form");
  const modalOverlay = document.getElementById("request-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const cancelModalBtn = document.getElementById("cancel-modal-btn");
  const alertBanner = document.getElementById("alert-banner");

  function showAlert(message, isError = true) {
    if (!alertBanner) return;
    alertBanner.textContent = message;
    alertBanner.className = `alert-banner ${isError ? 'alert-banner-error' : 'alert-banner-success'}`;
    alertBanner.style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      alertBanner.style.display = "none";
    }, 6000);
  }

  // 1. Fetch master skills and user's profile on load
  initializeSearchPage(currentUser.studentID);

  // 2. Handle Search Form Submit
  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const query = document.getElementById("search-input").value.trim();
      if (!query) return;

      const resultsGrid = document.getElementById("results-grid");
      resultsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem 0;">
          Searching...
        </div>
      `;

      try {
        const response = await fetch(`${API_BASE_URL}/skills/search?query=${encodeURIComponent(query)}`);
        const result = await response.json();

        if (result.success && result.data) {
          renderSearchResults(result.data, currentUser.studentID);
        } else {
          resultsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--danger); padding: 3rem 0;">
              ${escapeHTML(result.message || "Failed to search skills.")}
            </div>
          `;
        }
      } catch (error) {
        console.error("Search error:", error);
        resultsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--danger); padding: 3rem 0;">
            Connection error. Please try again.
          </div>
        `;
      }
    });
  }

  // 3. Handle Swap Request Form Submission
  if (requestForm) {
    requestForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const offeredSkillID = parseInt(document.getElementById("modal-offered-skill-select").value);
      
      if (!selectedRequestData) return;
      if (isNaN(offeredSkillID)) {
        alert("Please select a skill you want to offer.");
        return;
      }

      const payload = {
        senderID: currentUser.studentID,
        receiverID: selectedRequestData.receiverID,
        skillID: selectedRequestData.requestedSkillID,
        offeredSkillID: offeredSkillID
      };

      // Close modal
      modalOverlay.classList.remove("active");

      try {
        const response = await fetch(`${API_BASE_URL}/request/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showAlert("Swap request sent successfully!", false);
          // Reload notifications feed on the right panel
          const notificationsList = document.getElementById("notifications-list");
          if (notificationsList) {
            loadNotifications(currentUser.studentID, notificationsList);
          }
        } else {
          showAlert(result.message || "Failed to send swap request.");
        }
      } catch (error) {
        console.error("Request send error:", error);
        showAlert("Connection failed. Could not send request.");
      }
    });
  }

  // Modal close listeners
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => modalOverlay.classList.remove("active"));
  }
  if (cancelModalBtn) {
    cancelModalBtn.addEventListener("click", () => modalOverlay.classList.remove("active"));
  }
});

// Load resources on page initialize
async function initializeSearchPage(studentID) {
  try {
    // 1. Fetch master skills list
    const skillsResponse = await fetch(`${API_BASE_URL}/skills/all`);
    const skillsResult = await skillsResponse.json();
    if (skillsResult.success && skillsResult.data) {
      masterSkills = skillsResult.data;
    }

    // 2. Fetch logged-in user profile to find their offered skills
    const profileResponse = await fetch(`${API_BASE_URL}/profile/${studentID}`);
    const profileResult = await profileResponse.json();
    
    if (profileResult.success && profileResult.data) {
      const { profile } = profileResult.data;
      
      // Filter valid offered skills (excluding null values)
      currentUserOfferedSkills = profile
        .filter(row => row.offered_skill !== null)
        .map(row => {
          // Find matching skillID from master list
          const match = masterSkills.find(s => s.skill_name.toLowerCase() === row.offered_skill.toLowerCase());
          return {
            skillID: match ? match.skillID : null,
            skillName: row.offered_skill,
            proficiency: row.proficiency
          };
        })
        .filter(item => item.skillID !== null);
      
      // Populate select dropdown in the modal
      const selectDropdown = document.getElementById("modal-offered-skill-select");
      if (selectDropdown) {
        selectDropdown.innerHTML = `
          <option value="" disabled selected>Select an offered skill...</option>
          ${currentUserOfferedSkills.map(s => `
            <option value="${s.skillID}">${escapeHTML(s.skillName)} (${escapeHTML(s.proficiency)})</option>
          `).join("")}
        `;
      }
    }
  } catch (error) {
    console.error("Initializing page failed:", error);
  }
}

// Render student search results
function renderSearchResults(students, currentUserID) {
  const resultsGrid = document.getElementById("results-grid");
  
  // Exclude current logged in user from search results
  const otherStudents = students.filter(student => student.studentID !== currentUserID);

  if (otherStudents.length === 0) {
    resultsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem 0;">
        No other students offer this skill.
      </div>
    `;
    return;
  }

  resultsGrid.innerHTML = otherStudents.map(student => {
    return `
      <div class="card student-card">
        <div class="student-card-header">
          <span class="student-card-dept">${escapeHTML(student.department)}</span>
          <h3 class="serif-title">${escapeHTML(student.name)}</h3>
        </div>
        <div class="student-card-body">
          <p class="student-card-skills-title">Offers:</p>
          <span class="skill-tag" style="border-color: var(--accent); background-color: var(--accent-light);">
            ${escapeHTML(student.skill_name)}
            ${renderStars(student.proficiency)}
          </span>
        </div>
        <div style="margin-top: auto;">
          <button 
            class="btn btn-primary btn-sm request-btn" 
            style="width: 100%;"
            data-receiver-id="${student.studentID}"
            data-receiver-name="${escapeHTML(student.name)}"
            data-skill-id="${student.skillID}"
            data-skill-name="${escapeHTML(student.skill_name)}"
          >
            Request Exchange
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Add event listener to all "Request Exchange" buttons
  const requestButtons = document.querySelectorAll(".request-btn");
  requestButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const receiverID = parseInt(e.currentTarget.getAttribute("data-receiver-id"));
      const receiverName = e.currentTarget.getAttribute("data-receiver-name");
      const skillID = parseInt(e.currentTarget.getAttribute("data-skill-id"));
      const skillName = e.currentTarget.getAttribute("data-skill-name");

      // Save selection details
      selectedRequestData = {
        receiverID,
        receiverName,
        requestedSkillID: skillID,
        requestedSkillName: skillName
      };

      // Open Modal and set titles
      document.getElementById("modal-receiver-name").textContent = receiverName;
      document.getElementById("modal-requested-skill").textContent = skillName;
      
      const modalOverlay = document.getElementById("request-modal");
      modalOverlay.classList.add("active");
    });
  });
}
