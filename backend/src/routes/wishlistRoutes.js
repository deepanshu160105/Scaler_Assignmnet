import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

// Get wishlist
router.get("/", getWishlist);

// Add to wishlist
router.post(
  "/",
  [body("productId").notEmpty().withMessage("Product ID is required.")],
  validate,
  addToWishlist
);

// Remove from wishlist
router.delete("/:productId", removeFromWishlist);

export default router;
