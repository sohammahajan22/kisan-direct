const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { generateToken } = require("../utils/jwt");

const prisma = new PrismaClient();

// ===== SIGNUP =====
async function signup(req, res) {
  try {
    const {
      name,
      phone,
      email,
      password,
      role,
      location,
      gstNumber,
    } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({
        error: "Name, phone, password aur role zaroori hain.",
      });
    }

    if (role !== "FARMER" && role !== "BUYER") {
      return res.status(400).json({
        error: "Role sirf FARMER ya BUYER ho sakta hai.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Ye phone number pehle se registered hai.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        phone,
        email: email || null,
        password: hashedPassword,
        role,
        location: location || null,
        gstNumber: role === "FARMER" ? gstNumber || null : null,
      },
    });

    const token = generateToken(newUser.id, newUser.role);

    res.status(201).json({
      message: "Signup successful!",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Signup mein kuch error aaya, dobara try karein.",
    });
  }
}

// ===== LOGIN =====
async function login(req, res) {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        error: "Phone aur password zaroori hain.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res.status(401).json({
        error: "Phone number ya password galat hai.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: "Phone number ya password galat hai.",
      });
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Login mein kuch error aaya, dobara try karein.",
    });
  }
}

// ===== GET CURRENT USER =====
async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        location: true,
        gstNumber: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User nahi mila.",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Kuch error aaya.",
    });
  }
}

// ===== UPDATE CURRENT USER PROFILE =====
async function updateProfile(req, res) {
  try {
    const {
      name,
      email,
      location,
      gstNumber,
    } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        error: "Name aur location zaroori hain.",
      });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!currentUser) {
      return res.status(404).json({
        error: "User nahi mila.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },

      data: {
        name,
        email: email || null,
        location,

        gstNumber:
          currentUser.role === "FARMER"
            ? gstNumber || null
            : currentUser.gstNumber,
      },

      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        location: true,
        gstNumber: true,
        isVerified: true,
      },
    });

    res.status(200).json({
      message: "Profile successfully update ho gaya!",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Profile update karne mein error aaya.",
    });
  }
}

// ===== EXPORTS =====
module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
};