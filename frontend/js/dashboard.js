// =========================================================
// dashboard.js — Logic for dashboard home
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return; // Protected by checkAuth in common.js

  // Update welcome header and profile card details
  document.getElementById("welcome-message").innerHTML = `Welcome back, <span class="serif-title" style="color: var(--accent);">${escapeHTML(currentUser.name)}</span>!`;
  document.getElementById("profile-name").textContent = currentUser.name;
  document.getElementById("profile-dept").textContent = currentUser.department;
  document.getElementById("profile-email").textContent = currentUser.email;
  document.getElementById("profile-phone").textContent = currentUser.phonenumber || "Not Provided";

  // Fetch Dashboard Stats and Activities
  loadDashboardStats(currentUser.studentID);
});

async function loadDashboardStats(studentID) {
  try {
    // 1. Fetch requests for dashboard (to compute pending and accepted requests)
    const dashResponse = await fetch(`${API_BASE_URL}/dashboard/${studentID}`);
    const dashResult = await dashResponse.json();

    let pendingCount = 0;
    let acceptedCount = 0;
    let recentRequests = [];

    if (dashResult.success && dashResult.data) {
      const requests = dashResult.data;
      
      // Calculate pending and accepted
      requests.forEach(req => {
        if (req.status.toLowerCase() === 'pending') {
          pendingCount++;
        } else if (req.status.toLowerCase() === 'accepted') {
          acceptedCount++;
        }
      });

      // Get up to 3 most recent requests
      recentRequests = requests.slice(0, 3);
    }

    // 2. Fetch exchanges to count total completed swaps
    let exchangesCount = 0;
    try {
      const exchResponse = await fetch(`${API_BASE_URL}/exchanges/${studentID}`);
      const exchResult = await exchResponse.json();
      if (exchResult.success && exchResult.data) {
        exchangesCount = exchResult.data.length;
      }
    } catch (e) {
      console.error("Failed to fetch exchanges for stats:", e);
    }

    // 3. Render stats on the UI
    document.getElementById("stat-pending").textContent = pendingCount;
    document.getElementById("stat-accepted").textContent = acceptedCount;
    document.getElementById("stat-exchanges").textContent = exchangesCount;

    // 4. Render recent requests list
    const recentContainer = document.getElementById("recent-requests-container");
    if (recentContainer) {
      if (recentRequests.length === 0) {
        recentContainer.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0; font-size: 0.9rem;">
            No recent request activity.
          </div>
        `;
        return;
      }

      recentContainer.innerHTML = recentRequests.map(req => {
        const isSender = req.sender_name === getCurrentUser().name;
        const statusClass = req.status.toLowerCase() === 'accepted' ? 'badge-accepted' : 
                            req.status.toLowerCase() === 'rejected' ? 'badge-rejected' : 'badge-pending';
        
        return `
          <div style="padding: 0.85rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg); display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; font-size: 0.9rem; color: var(--primary);">
                ${isSender ? `Sent to ${escapeHTML(req.receiver_name)}` : `Received from ${escapeHTML(req.sender_name)}`}
              </span>
              <span class="badge ${statusClass}" style="font-size: 0.65rem;">${escapeHTML(req.status)}</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">
              Requested Skill: <strong>${escapeHTML(req.requested_skill)}</strong>
            </div>
          </div>
        `;
      }).join("");
    }

  } catch (error) {
    console.error("Error loading dashboard statistics:", error);
  }
}
