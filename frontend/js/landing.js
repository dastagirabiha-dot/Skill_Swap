// =========================================================
// landing.js — Actions for landing homepage
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser();
  const navLinks = document.getElementById("landing-nav-links");
  const offerBtn = document.getElementById("offer-skill-btn");
  const learnBtn = document.getElementById("learn-skill-btn");

  // Customize navbar if already logged in
  if (currentUser && navLinks) {
    navLinks.innerHTML = `
      <span style="font-weight: 500; font-size: 0.95rem; color: var(--text-muted);">Welcome, ${escapeHTML(currentUser.name)}</span>
      <a href="dashboard.html" class="btn btn-primary btn-sm">Go to Dashboard</a>
    `;
  }

  // Handle CTA buttons
  if (offerBtn) {
    offerBtn.addEventListener("click", () => {
      if (currentUser) {
        // Logged in: navigate to profile page to offer new skills
        window.location.href = "profile.html";
      } else {
        // Not logged in: navigate to login/register
        window.location.href = "register.html";
      }
    });
  }

  if (learnBtn) {
    learnBtn.addEventListener("click", () => {
      if (currentUser) {
        // Logged in: navigate to search skill page
        window.location.href = "search.html";
      } else {
        // Not logged in: navigate to login
        window.location.href = "login.html";
      }
    });
  }
});
