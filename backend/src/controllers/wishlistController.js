import prisma from "../lib/prisma.js";

// ─────────────────────────────────────────
// GET /api/wishlist
// ─────────────────────────────────────────
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// POST /api/wishlist
// ─────────────────────────────────────────
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Validate product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist.",
      });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: req.user.id,
        productId,
      },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Added to wishlist.",
      data: { wishlistItem },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// DELETE /api/wishlist/:productId
// ─────────────────────────────────────────
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Product not in your wishlist.",
      });
    }

    await prisma.wishlist.delete({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    res.status(200).json({
      success: true,
      message: "Removed from wishlist.",
    });
  } catch (error) {
    next(error);
  }
};
