import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { createPaymentIntent, getStripeConfig } from "../controllers/paymentController.js";

const router = Router();

// Public: return publishable key
router.get("/config", getStripeConfig);

// Protected: create payment intent (requires valid cart)
router.post("/create-intent", authenticate, createPaymentIntent);

export default router;
