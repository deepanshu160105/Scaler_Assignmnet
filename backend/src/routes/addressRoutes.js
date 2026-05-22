import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";

const router = Router();

// All address routes require authentication
router.use(authenticate);

const addressValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required."),
  body("phone").trim().notEmpty().withMessage("Phone number is required."),
  body("addressLine1").trim().notEmpty().withMessage("Address line 1 is required."),
  body("city").trim().notEmpty().withMessage("City is required."),
  body("state").trim().notEmpty().withMessage("State is required."),
  body("pincode").trim().notEmpty().withMessage("Pincode is required."),
];

// List addresses
router.get("/", getAddresses);

// Add address
router.post("/", addressValidation, validate, addAddress);

// Update address
router.put("/:id", addressValidation, validate, updateAddress);

// Delete address
router.delete("/:id", deleteAddress);

// Set default address
router.put("/:id/default", setDefaultAddress);

export default router;
