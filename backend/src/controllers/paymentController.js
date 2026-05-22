import Stripe from "stripe";
import prisma from "../lib/prisma.js";
import crypto from "crypto";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";
const IS_DEMO =
  !STRIPE_SECRET ||
  STRIPE_SECRET.includes("REPLACE_WITH") ||
  STRIPE_SECRET === "sk_test_" ||
  STRIPE_SECRET.length < 20;

// Lazy initialise — only create if we have a real key
let _stripe = null;
const getStripe = () => {
  if (IS_DEMO) return null;
  if (!_stripe) {
    try { _stripe = new Stripe(STRIPE_SECRET); }
    catch { _stripe = null; }
  }
  return _stripe;
};

// ─────────────────────────────────────────────────────
// GET /api/payments/config
// ─────────────────────────────────────────────────────
export const getStripeConfig = async (_req, res) => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || "";
  const isDemo =
    IS_DEMO ||
    !publishableKey ||
    publishableKey.includes("REPLACE_WITH");

  res.status(200).json({
    success: true,
    data: { publishableKey: isDemo ? null : publishableKey, isDemo },
  });
};

// ─────────────────────────────────────────────────────
// POST /api/payments/create-intent
// ─────────────────────────────────────────────────────
export const createPaymentIntent = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty." });
    }

    const subtotal     = cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const shippingCost = subtotal >= 500 ? 0 : 40;
    const tax          = Math.round(subtotal * 0.18 * 100) / 100;
    const totalAmount  = Math.round((subtotal + shippingCost + tax) * 100) / 100;

    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (IS_DEMO) {
      return res.status(200).json({
        success: true,
        data: {
          clientSecret: null,
          paymentIntentId: `demo_pi_${crypto.randomBytes(12).toString("hex")}`,
          amount: totalAmount,
          isDemo: true,
        },
      });
    }

    // ── REAL STRIPE ───────────────────────────────────────────────────────────
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ success: false, message: "Payment service unavailable." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "inr",
      automatic_payment_methods: { enabled: true },
      metadata: { userId, cartTotal: totalAmount.toString() },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount,
        isDemo: false,
      },
    });
  } catch (error) {
    next(error);
  }
};
