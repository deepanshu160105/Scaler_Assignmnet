import prisma from "../lib/prisma.js";
import { generateOrderNumber } from "../lib/generateOrderNumber.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";

// ─────────────────────────────────────────
// POST /api/orders
// ─────────────────────────────────────────
export const placeOrder = async (req, res, next) => {
  try {
    const { addressId, paymentMethod = "COD", paymentIntentId } = req.body;
    const userId = req.user.id;

    // 1. Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    // 2. Get user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    // 3. Validate stock for all items
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `"${item.product.name}" has only ${item.product.stock} items in stock.`,
        });
      }
    }

    // 4. Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const shippingCost = subtotal >= 500 ? 0 : 40; // Free shipping over ₹500
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
    const totalAmount = Math.round((subtotal + shippingCost + tax) * 100) / 100;

    // 5. Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId,
          subtotal,
          shippingCost,
          tax,
          totalAmount,
          paymentMethod,
          status: "PENDING",
          paymentStatus: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, images: true, slug: true },
              },
            },
          },
          address: true,
        },
      });

      // Deduct stock for each product
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    // 6. Send confirmation email (non-blocking)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    sendOrderConfirmationEmail(user.email, order).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// GET /api/orders
// ─────────────────────────────────────────
export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, images: true, slug: true },
              },
            },
          },
          address: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where: { userId: req.user.id } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// GET /api/orders/:orderNumber
// ─────────────────────────────────────────
export const getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, slug: true, price: true },
            },
          },
        },
        address: true,
      },
    });

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// PUT /api/orders/:orderNumber/cancel
// ─────────────────────────────────────────
export const cancelOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status "${order.status}".`,
      });
    }

    // Cancel order and restore stock in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { orderNumber },
        data: {
          status: "CANCELLED",
          paymentStatus: order.paymentStatus === "COMPLETED" ? "REFUNDED" : "FAILED",
        },
      });

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, slug: true } },
          },
        },
        address: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      data: { order: updatedOrder },
    });
  } catch (error) {
    next(error);
  }
};
