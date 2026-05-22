import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { sendOtpEmail } from "../services/emailService.js";

/**
 * Generate a JWT token for a user.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * Strip password from user object before sending to client.
 */
const sanitizeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// ─────────────────────────────────────────
// POST /api/auth/send-otp
// ─────────────────────────────────────────
export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Rate limiting: check if OTP was sent in the last 60 seconds
    const recentOtp = await prisma.otp.findFirst({
      where: {
        email,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentOtp) {
      return res.status(429).json({
        success: false,
        message: "Please wait 60 seconds before requesting a new OTP.",
      });
    }

    // Generate a 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Hash the OTP before storing
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    // Delete any existing OTPs for this email
    await prisma.otp.deleteMany({ where: { email } });

    // Store the hashed OTP with 10-minute expiry
    await prisma.otp.create({
      data: {
        email,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send OTP via email
    await sendOtpEmail(email, otpCode);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. It expires in 10 minutes.",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/verify-otp
// ─────────────────────────────────────────
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find the latest OTP for this email
    const otpRecord = await prisma.otp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await prisma.otp.deleteMany({ where: { email } });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Mark OTP as verified
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now register.",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Check for a verified OTP
    const verifiedOtp = await prisma.otp.findFirst({
      where: {
        email,
        verified: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verifiedOtp) {
      return res.status(400).json({
        success: false,
        message: "Email not verified. Please verify your email with OTP first.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Clean up used OTPs
    await prisma.otp.deleteMany({ where: { email } });

    // Create an empty cart for the user
    await prisma.cart.create({
      data: { userId: user.id },
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// PUT /api/auth/me
// ─────────────────────────────────────────
export const updateMe = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};
