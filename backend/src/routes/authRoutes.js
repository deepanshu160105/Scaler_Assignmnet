import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import {
  sendOtp,
  verifyOtp,
  register,
  login,
  getMe,
  updateMe,
} from "../controllers/authController.js";

const router = Router();

// Send OTP
router.post(
  "/send-otp",
  [
    body("email").isEmail().withMessage("Please provide a valid email.").normalizeEmail(),
  ],
  validate,
  sendOtp
);

// Verify OTP
router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Please provide a valid email.").normalizeEmail(),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits.")
      .isNumeric()
      .withMessage("OTP must contain only digits."),
  ],
  validate,
  verifyOtp
);

// Register (after OTP verification)
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("Please provide a valid email.").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
  ],
  validate,
  register
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  login
);

// Get current user profile (protected)
router.get("/me", authenticate, getMe);

// Update profile (protected)
router.put("/me", authenticate, updateMe);

export default router;
