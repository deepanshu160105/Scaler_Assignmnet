import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import addressRoutes from "./src/routes/addressRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import wishlistRoutes from "./src/routes/wishlistRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";

// Import middleware
import { errorHandler } from "./src/middleware/errorHandler.js";

const app = express();

// ─── CORS Configuration ───────────────────────────
// Allow all origins so any frontend URL can access this API
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Amazon Clone API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ──────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payments", paymentRoutes);

// ─── 404 Handler ─────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler ────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📡 API available at http://0.0.0.0:${PORT}/api`);
});
