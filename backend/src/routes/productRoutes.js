import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import {
  getProducts,
  getProductBySlug,
  getProductReviews,
  addProductReview,
} from "../controllers/productController.js";

const router = Router();

// List products (public)
router.get("/", getProducts);

// Get product by slug (public)
router.get("/:slug", getProductBySlug);

// Get reviews for a product (public)
router.get("/:id/reviews", getProductReviews);

// Add a review (protected)
router.post(
  "/:id/reviews",
  authenticate,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),
    body("title").optional().trim(),
    body("comment").optional().trim(),
  ],
  validate,
  addProductReview
);

export default router;
