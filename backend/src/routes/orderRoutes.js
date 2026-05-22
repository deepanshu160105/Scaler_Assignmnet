import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import {
  placeOrder,
  getOrders,
  getOrderByNumber,
  cancelOrder,
} from "../controllers/orderController.js";

const router = Router();

// All order routes require authentication
router.use(authenticate);

// Place order
router.post(
  "/",
  [
    body("addressId").notEmpty().withMessage("Address ID is required."),
    body("paymentMethod").optional().isIn(["COD", "UPI", "CARD", "ONLINE", "STRIPE"]).withMessage("Invalid payment method."),
    body("paymentIntentId").optional().isString(),
  ],
  validate,
  placeOrder
);

// Get order history
router.get("/", getOrders);

// Get order by order number
router.get("/:orderNumber", getOrderByNumber);

// Cancel order
router.put("/:orderNumber/cancel", cancelOrder);

export default router;
