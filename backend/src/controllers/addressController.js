import prisma from "../lib/prisma.js";

// ─────────────────────────────────────────
// GET /api/addresses
// ─────────────────────────────────────────
export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    res.status(200).json({
      success: true,
      data: { addresses },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// POST /api/addresses
// ─────────────────────────────────────────
export const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body;

    // If this is the default address, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country,
        isDefault: isDefault || false,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully.",
      data: { address },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// PUT /api/addresses/:id
// ─────────────────────────────────────────
export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body;

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Address not found." });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: { fullName, phone, addressLine1, addressLine2, city, state, pincode, country, isDefault },
    });

    res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      data: { address },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// DELETE /api/addresses/:id
// ─────────────────────────────────────────
export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Address not found." });
    }

    await prisma.address.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// PUT /api/addresses/:id/default
// ─────────────────────────────────────────
export const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Address not found." });
    }

    // Unset all defaults, then set the selected one
    await prisma.address.updateMany({
      where: { userId: req.user.id, isDefault: true },
      data: { isDefault: false },
    });

    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    res.status(200).json({
      success: true,
      message: "Default address updated.",
      data: { address },
    });
  } catch (error) {
    next(error);
  }
};
