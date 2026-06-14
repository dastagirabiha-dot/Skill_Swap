// =========================================================
// common.js — Shared utilities, auth check, and sidebar logic
// =========================================================

// Base API URL
const API_BASE_URL = "http://localhost:3000";

// Check if user is logged in
function getCurrentUser() {
  const userJson = localStorage.getItem("currentUser");
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    localStorage.removeItem("currentUser");
    return null;
  }
}

// Check authentication status and redirect if needed
function checkAuth() {
  const currentUser = getCurrentUser();
  const currentPath = window.location.pathname;
  
  // Authenticated pages list
  const authPages = [
    "dashboard.html",
    "profile.html",
    "search.html",
    "requests.html",
    "exchanges.html"
  ];
  
  const isAuthPage = authPages.some(page => currentPath.includes(page));
  
  if (isAuthPage && !currentUser) {
    window.location.href = "login.html";
  } else if (!isAuthPage && currentUser && (currentPath.includes("login.html") || currentPath.includes("register.html"))) {
    window.location.href = "dashboard.html";
  }
}

// Run auth check immediately
checkAuth();

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser();
  
  // Highlight active sidebar link
  const currentPath = window.location.pathname;
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  sidebarLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href && currentPath.includes(href)) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Mobile navigation drawer toggle
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (sidebar && sidebar.classList.contains("active") && 
        !sidebar.contains(e.target) && 
        mobileToggle && !mobileToggle.contains(e.target)) {
      sidebar.classList.remove("active");
    }
  });

  // Load notifications if user is logged in and right-panel notifications-list exists
  const notificationsList = document.getElementById("notifications-list");
  if (currentUser && notificationsList) {
    loadNotifications(currentUser.studentID, notificationsList);
    // Refresh notifications every 15 seconds
    setInterval(() => {
      loadNotifications(currentUser.studentID, notificationsList);
    }, 15000);
  }

  // Handle logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    });
  }
});

// Fetch notifications from backend and display
async function loadNotifications(userID, container) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${userID}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      if (result.data.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 2rem 0; font-size: 0.85rem;">
            No notifications yet.
          </div>
        `;
        return;
      }
      
      container.innerHTML = result.data.map(notif => {
        const date = new Date(notif.created_at);
        const formattedDate = date.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        return `
          <div class="timeline-card">
            <p>${escapeHTML(notif.message)}</p>
            <span class="timeline-time">${formattedDate}</span>
          </div>
        `;
      }).join("");
    } else {
      container.innerHTML = `<p style="color: var(--danger); font-size: 0.8rem;">Failed to load notifications</p>`;
    }
  } catch (error) {
    console.error("Error loading notifications:", error);
    container.innerHTML = `<p style="color: var(--danger); font-size: 0.8rem;">Error loading notifications</p>`;
  }
}

// Utility function to escape HTML to prevent XSS
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Utility function to render star proficiency ratings
function renderStars(level) {
  const norm = (level || '').toLowerCase().trim();
  if (norm === 'expert') {
    return `<span class="proficiency-stars">★★★</span>`;
  } else if (norm === 'intermediate') {
    return `<span class="proficiency-stars">★★</span>`;
  } else {
    return `<span class="proficiency-stars">★</span>`; // Beginner/other
  }
}
