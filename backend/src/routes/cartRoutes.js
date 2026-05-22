import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// Get cart
router.get("/", getCart);

// Add item to cart
router.post(
  "/items",
  [
    body("productId").notEmpty().withMessage("Product ID is required."),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1."),
  ],
  validate,
  addToCart
);

// Update cart item quantity
router.put(
  "/items/:itemId",
  [
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be 0 or greater."),
  ],
  validate,
  updateCartItem
);

// Remove item from cart
router.delete("/items/:itemId", removeFromCart);

// Clear entire cart
router.delete("/", clearCart);

export default router;
