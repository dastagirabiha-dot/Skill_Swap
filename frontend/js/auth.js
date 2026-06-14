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

  // Handle Register Form Submission
  if (registerForm) {
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
      const department = document.getElementById("department").value;
      const phonenumber = document.getElementById("phonenumber").value.trim();

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
            department, 
            phonenumber: phonenumber || undefined 
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
