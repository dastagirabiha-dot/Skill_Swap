// =========================================================
// exchanges.js — Retrieves and displays completed exchanges
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return; // Protected by checkAuth

  loadExchanges(currentUser.studentID);
});

async function loadExchanges(studentID) {
  const tbody = document.getElementById("exchanges-table-body");
  if (!tbody) return;

  try {
    const response = await fetch(`${API_BASE_URL}/exchanges/${studentID}`);
    const result = await response.json();

    if (result.success && result.data) {
      const exchanges = result.data;

      if (exchanges.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 3rem;">
              No completed skill exchanges yet.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = exchanges.map(ex => {
        const date = new Date(ex.completed_at);
        const formattedDate = date.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        return `
          <tr>
            <td style="font-weight: 600; color: var(--primary);">#${ex.exchangeID}</td>
            <td>${escapeHTML(ex.sender)}</td>
            <td>${escapeHTML(ex.receiver)}</td>
            <td><span class="skill-tag">${escapeHTML(ex.skill_name)}</span></td>
            <td style="color: var(--text-muted); font-size: 0.9rem;">${formattedDate}</td>
          </tr>
        `;
      }).join("");

    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--danger); padding: 2rem;">
            Failed to load exchange history.
          </td>
        </tr>
      `;
    }
  } catch (error) {
    console.error("Error loading exchanges:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--danger); padding: 2rem;">
          Connection error. Please check if the backend is running.
        </td>
      </tr>
    `;
  }
}
