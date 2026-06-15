// =========================================================
// auth.js — Handles Login and Register HTTP calls
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const alertBanner = document.getElementById("alert-banner");

  function showAlert(message, isError = true) {
    if (!alertBanner) return;
    alertBanner.textContent = message;
    alertBanner.className = `alert-banner ${isError ? 'alert-banner-error' : 'alert-banner-success'}`;
    alertBanner.style.display = "block";
  }

  // Handle Login Form Submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Store user info in localStorage
          localStorage.setItem("currentUser", JSON.stringify(result.data));
          // Redirect to dashboard
          window.location.href = "dashboard.html";
        } else {
          showAlert(result.message || "Invalid email or password.");
        }
      } catch (error) {
        console.error("Login error:", error);
        showAlert("Connection failed. Please ensure the backend is running.");
      }
    });
  }

  // Handle Register Form Submission & Dynamic Rendering
  if (registerForm) {
    // Shared master skills list in JavaScript (Fallback if fetch fails)
    const FALLBACK_MASTER_SKILLS = [
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

    let skillsList = [...FALLBACK_MASTER_SKILLS];
    let selectedTeachSkills = [];
    let selectedLearnSkills = [];

    const teachSelect = document.getElementById("teach-skills-select");
    const learnSelect = document.getElementById("learn-skills-select");
    const teachBadgeContainer = document.getElementById("teach-skills-badge-container");
    const learnBadgeContainer = document.getElementById("learn-skills-badge-container");

    // Fetch and initialize skills
    async function initSkills() {
      try {
        const response = await fetch(`${API_BASE_URL}/skills/all`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          skillsList = result.data;
        }
      } catch (err) {
        console.error("Failed to load skills from backend, using fallback master list:", err);
      }
      populateDropdowns();
    }

    function populateDropdowns() {
      if (!teachSelect || !learnSelect) return;

      const teachPlaceholder = `<option value="" disabled selected>Select a skill you can teach...</option>`;
      const learnPlaceholder = `<option value="" disabled selected>Select a skill you want to learn...</option>`;

      teachSelect.innerHTML = teachPlaceholder + skillsList
        .map(s => `<option value="${s.skillID}" ${selectedTeachSkills.includes(s.skillID) ? 'disabled style="color:var(--text-muted);"' : ''}>${s.skill_name}</option>`)
        .join("");

      learnSelect.innerHTML = learnPlaceholder + skillsList
        .map(s => `<option value="${s.skillID}" ${selectedLearnSkills.includes(s.skillID) ? 'disabled style="color:var(--text-muted);"' : ''}>${s.skill_name}</option>`)
        .join("");
    }

    function renderBadges() {
      if (!teachBadgeContainer || !learnBadgeContainer) return;

      // Render Teach Badges
      teachBadgeContainer.innerHTML = selectedTeachSkills.map(id => {
        const skill = skillsList.find(s => s.skillID === id);
        if (!skill) return "";
        return `
          <div class="skill-chip">
            <span>${escapeHTML(skill.skill_name)}</span>
            <span class="skill-chip-remove" data-id="${id}" data-type="teach">&times;</span>
          </div>
        `;
      }).join("");

      // Render Learn Badges
      learnBadgeContainer.innerHTML = selectedLearnSkills.map(id => {
        const skill = skillsList.find(s => s.skillID === id);
        if (!skill) return "";
        return `
          <div class="skill-chip" style="background-color: var(--accent); color: var(--primary);">
            <span>${escapeHTML(skill.skill_name)}</span>
            <span class="skill-chip-remove" data-id="${id}" data-type="learn" style="color: rgba(15,23,42,0.6);">&times;</span>
          </div>
        `;
      }).join("");

      // Attach remove handlers
      document.querySelectorAll(".skill-chip-remove").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = parseInt(e.target.getAttribute("data-id"));
          const type = e.target.getAttribute("data-type");
          if (type === "teach") {
            selectedTeachSkills = selectedTeachSkills.filter(val => val !== id);
          } else {
            selectedLearnSkills = selectedLearnSkills.filter(val => val !== id);
          }
          renderBadges();
          populateDropdowns();
        });
      });
    }

    // Handle duplicate validation
    function handleSkillSelection(skillID, isTeach) {
      const skill = skillsList.find(s => s.skillID === skillID);
      const skillName = skill ? skill.skill_name : "Skill";

      if (isTeach) {
        // If selected to teach, check if it's already in learn list
        if (selectedLearnSkills.includes(skillID)) {
          selectedLearnSkills = selectedLearnSkills.filter(id => id !== skillID);
          showAlert(`⚠️ ${skillName} auto-removed from 'Want to Learn' to prevent duplicate selection.`, true);
          // Auto-hide alert after 3.5s
          setTimeout(() => {
            if (alertBanner && alertBanner.textContent.includes("auto-removed")) {
              alertBanner.style.display = "none";
            }
          }, 3500);
        }
        if (!selectedTeachSkills.includes(skillID)) {
          selectedTeachSkills.push(skillID);
        }
      } else {
        // If selected to learn, check if it's already in teach list
        if (selectedTeachSkills.includes(skillID)) {
          selectedTeachSkills = selectedTeachSkills.filter(id => id !== skillID);
          showAlert(`⚠️ ${skillName} auto-removed from 'Can Teach' to prevent duplicate selection.`, true);
          // Auto-hide alert after 3.5s
          setTimeout(() => {
            if (alertBanner && alertBanner.textContent.includes("auto-removed")) {
              alertBanner.style.display = "none";
            }
          }, 3500);
        }
        if (!selectedLearnSkills.includes(skillID)) {
          selectedLearnSkills.push(skillID);
        }
      }

      renderBadges();
      populateDropdowns();
    }

    // Attach dropdown listeners
    if (teachSelect) {
      teachSelect.addEventListener("change", (e) => {
        const val = parseInt(e.target.value);
        if (val) {
          handleSkillSelection(val, true);
        }
      });
    }

    if (learnSelect) {
      learnSelect.addEventListener("change", (e) => {
        const val = parseInt(e.target.value);
        if (val) {
          handleSkillSelection(val, false);
        }
      });
    }

    // Initialize
    initSkills();

    // Check if there is a redirect message from successful registration
    const registerSuccessMsg = localStorage.getItem("registerSuccessMsg");
    if (registerSuccessMsg) {
      showAlert(registerSuccessMsg, false);
      localStorage.removeItem("registerSuccessMsg");
    }

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const phonenumber = document.getElementById("phonenumber").value.trim();

      const teachSkills = selectedTeachSkills;
      const learnSkills = selectedLearnSkills;

      try {
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            name, 
            email, 
            password, 
            phonenumber: phonenumber || undefined,
            teachSkills,
            learnSkills
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Registration successful
          localStorage.setItem("registerSuccessMsg", "Registration successful! You can now log in.");
          window.location.href = "login.html";
        } else {
          showAlert(result.message || "Registration failed.");
        }
      } catch (error) {
        console.error("Registration error:", error);
        showAlert("Connection failed. Please ensure the backend is running.");
      }
    });
  }
});
