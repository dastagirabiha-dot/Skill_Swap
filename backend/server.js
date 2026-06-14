// =========================================================
// server.js — SkillSwap API entry point
//
// Node.js responsibilities ONLY:
//   ✔ Connect to MySQL
//   ✔ Register routes
//   ✔ Return JSON responses
//   ✔ Handle HTTP routing
//
// ALL business logic lives in MySQL (procedures/triggers/views)
// =========================================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// ── Routes ─────────────────────────────────────────────
app.use("/",            require("./routes/auth"));          // POST /register, /login
app.use("/profile",     require("./routes/profile"));       // GET  /profile/:studentID
app.use("/skills",      require("./routes/skills"));        // GET  /skills/search, /skills/all
app.use("/request",     require("./routes/requests"));      // POST /request/send, /request/accept
app.use("/dashboard",   require("./routes/dashboard"));     // GET  /dashboard/:studentID
app.use("/notifications", require("./routes/notifications")); // GET  /notifications/:userID
app.use("/exchanges",   require("./routes/exchanges"));     // GET  /exchanges/:studentID

// ── 404 fallback ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ── Global error handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({
    success: false,
    data: null,
    message: "An unexpected error occurred.",
  });
});

// ── Start ───────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SkillSwap API running on http://localhost:${PORT}`);
});
