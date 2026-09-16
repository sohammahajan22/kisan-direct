const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  getMe,
  updateProfile,
} = require("../controllers/auth.controller");

const { authMiddleware } = require("../middleware/auth.middleware");

// ================= SIGNUP =================
// POST /api/auth/signup
router.post("/signup", signup);

// ================= LOGIN =================
// POST /api/auth/login
router.post("/login", login);

// ================= GET CURRENT USER =================
// GET /api/auth/me
router.get("/me", authMiddleware, getMe);

// ================= UPDATE PROFILE =================
// PUT /api/auth/profile
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;