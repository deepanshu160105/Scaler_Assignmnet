import { Router } from "express";
import {
  getCategories,
  getCategoryBySlug,
} from "../controllers/categoryController.js";

const router = Router();

// List all categories (public)
router.get("/", getCategories);

// Get category by slug with products (public)
router.get("/:slug", getCategoryBySlug);

export default router;
