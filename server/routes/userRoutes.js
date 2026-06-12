import express from "express";

import {
  registerUser,
  loginUser,
  getUserProfile,
  getUserResumes,
} from "../controllers/Usercontroller.js";

import protect from "../middlewares/authmiddleware.js";

const router = express.Router();

// Register User
router.post("/register", registerUser);

// Login User
router.post("/login", loginUser);

// Get User Profile
router.get("/profile", protect, getUserProfile);

// Get User Resumes
router.get("/resumes", protect, getUserResumes);

export default router;