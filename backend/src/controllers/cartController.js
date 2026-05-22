import prisma from "../lib/prisma.js";

/**
 * Helper: Get or create user's cart with items and product details.
 */
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    });
  }

  return cart;
};

/**
 * Helper: Calculate cart summary (item count + subtotal).
 */
const calculateCartSummary = (cart) => {
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return {
    ...cart,
    itemCount,
    subtotal: Math.round(subtotal * 100) / 100,
  };
};

// ─────────────────────────────────────────
// GET /api/cart
// ─────────────────────────────────────────
export const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const cartWithSummary = calculateCartSummary(cart);

    res.status(200).json({
      success: true,
      data: { cart: cartWithSummary },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// POST /api/cart/items
// ─────────────────────────────────────────
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock.`,
      });
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id } });
    }

    // Check if product is already in cart — update quantity instead of duplicating
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} items available.`,
        });
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await getOrCreateCart(req.user.id);
    const cartWithSummary = calculateCartSummary(updatedCart);

    res.status(200).json({
      success: true,
      message: "Item added to cart.",
      data: { cart: cartWithSummary },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// PUT /api/cart/items/:itemId
// ─────────────────────────────────────────
export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });

    if (!cartItem || cartItem.cart.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    if (quantity > cartItem.product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${cartItem.product.stock} items available.`,
      });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    const updatedCart = await getOrCreateCart(req.user.id);
    const cartWithSummary = calculateCartSummary(updatedCart);

    res.status(200).json({
      success: true,
      message: "Cart updated.",
      data: { cart: cartWithSummary },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// DELETE /api/cart/items/:itemId
// ─────────────────────────────────────────
export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    const updatedCart = await getOrCreateCart(req.user.id);
    const cartWithSummary = calculateCartSummary(updatedCart);

    res.status(200).json({
      success: true,
      message: "Item removed from cart.",
      data: { cart: cartWithSummary },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// DELETE /api/cart
// ─────────────────────────────────────────
export const clearCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    const updatedCart = await getOrCreateCart(req.user.id);
    const cartWithSummary = calculateCartSummary(updatedCart);

    res.status(200).json({
      success: true,
      message: "Cart cleared.",
      data: { cart: cartWithSummary },
    });
  } catch (error) {
    next(error);
  }
};
