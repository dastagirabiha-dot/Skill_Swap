// =========================================================
// requests.js — Tab filters, request cards, and accepting requests
// =========================================================

let allRequests = [];
let activeTab = "pending";

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return; // Protected by checkAuth

  const tabButtons = document.querySelectorAll(".tab-btn");
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

  // 1. Initial Load of Requests
  fetchRequests(currentUser.studentID);

  // 2. Setup Tab Button Listeners
  tabButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Toggle active classes on tabs
      tabButtons.forEach(tb => tb.classList.remove("active"));
      e.currentTarget.classList.add("active");

      // Update active tab status
      activeTab = e.currentTarget.getAttribute("data-status");
      renderFilteredRequests(currentUser.studentID);
    });
  });

  // 3. Delegate Accept Request button clicks
  const container = document.getElementById("request-cards-container");
  if (container) {
    container.addEventListener("click", async (e) => {
      if (e.target.classList.contains("accept-req-btn")) {
        const requestID = parseInt(e.target.getAttribute("data-request-id"));
        e.target.disabled = true;
        e.target.textContent = "Accepting...";

        try {
          const response = await fetch(`${API_BASE_URL}/request/accept`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ requestID })
          });

          const result = await response.json();

          if (response.ok && result.success) {
            showAlert("Request accepted and exchange recorded successfully!", false);
            
            // Reload requests list
            await fetchRequests(currentUser.studentID);
            
            // Refresh notifications timeline
            const notificationsList = document.getElementById("notifications-list");
            if (notificationsList) {
              loadNotifications(currentUser.studentID, notificationsList);
            }
          } else {
            showAlert(result.message || "Failed to accept request.");
            e.target.disabled = false;
            e.target.textContent = "Accept Request";
          }
        } catch (error) {
          console.error("Accept request error:", error);
          showAlert("Connection error. Could not accept request.");
          e.target.disabled = false;
          e.target.textContent = "Accept Request";
        }
      }
    });
  }
});

// Fetch all requests for this student
async function fetchRequests(studentID) {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/${studentID}`);
    const result = await response.json();

    if (result.success && result.data) {
      allRequests = result.data;
      renderFilteredRequests(studentID);
    } else {
      document.getElementById("request-cards-container").innerHTML = `
        <div style="text-align: center; color: var(--danger); padding: 2rem 0;">
          Failed to load requests from server.
        </div>
      `;
    }
  } catch (error) {
    console.error("Failed fetching requests:", error);
    document.getElementById("request-cards-container").innerHTML = `
      <div style="text-align: center; color: var(--danger); padding: 2rem 0;">
        Connection error. Please check if the backend is running.
      </div>
    `;
  }
}

// Render only the requests that match the active tab
function renderFilteredRequests(currentUserID) {
  const container = document.getElementById("request-cards-container");
  if (!container) return;

  const filtered = allRequests.filter(req => req.status.toLowerCase() === activeTab.toLowerCase());

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 3rem 0; border: 1px dashed var(--border-color); border-radius: var(--radius-lg); background-color: var(--white);">
        No ${activeTab} requests found.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(req => {
    const isSender = req.senderID === currentUserID;
    const isReceiver = req.receiverID === currentUserID;
    const statusClass = req.status.toLowerCase() === 'accepted' ? 'badge-accepted' : 
                        req.status.toLowerCase() === 'rejected' ? 'badge-rejected' : 'badge-pending';
    
    // Check if current user is the receiver and the request is pending, so they can accept it
    const showAcceptButton = activeTab.toLowerCase() === 'pending' && isReceiver;

    const date = new Date(req.created_at);
    const formattedDate = date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    return `
      <div class="request-strip">
        <div class="request-details">
          <div class="request-users">
            ${escapeHTML(req.sender_name)} ➔ ${escapeHTML(req.receiver_name)}
            ${isSender ? '<span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal; margin-left: 0.5rem;">(Sent by you)</span>' : ''}
            ${isReceiver ? '<span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal; margin-left: 0.5rem;">(Received by you)</span>' : ''}
          </div>
          <div class="request-skill-info">
            Skill Requested: <strong>${escapeHTML(req.requested_skill)}</strong>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">Sent on: ${formattedDate}</span>
        </div>
        
        <div class="request-actions">
          <span class="badge ${statusClass}">${escapeHTML(req.status)}</span>
          ${showAcceptButton ? `
            <button class="btn btn-primary btn-sm accept-req-btn" data-request-id="${req.request_ID}">
              Accept Request
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join("");
}
