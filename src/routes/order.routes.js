const express = require("express");

const router = express.Router();

const {
  createOrder,
  getMyOrdersAsBuyer,
  getMyOrdersAsFarmer,
  getSingleOrder,
  updateOrderStatus,
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/order.controller");

const {
  authMiddleware,
  requireRole,
} = require("../middleware/auth.middleware");

// POST /api/orders
// Sirf BUYER order create kar sakta hai
router.post(
  "/",
  authMiddleware,
  requireRole("BUYER"),
  createOrder
);

// GET /api/orders/my-orders
// Sirf BUYER apne orders dekh sakta hai
router.get(
  "/my-orders",
  authMiddleware,
  requireRole("BUYER"),
  getMyOrdersAsBuyer
);

// GET /api/orders/farmer-orders
// Sirf FARMER apne orders dekh sakta hai
router.get(
  "/farmer-orders",
  authMiddleware,
  requireRole("FARMER"),
  getMyOrdersAsFarmer
);

// PUT /api/orders/:id/status
// Sirf order ka FARMER status update kar sakta hai
router.put(
  "/:id/status",
  authMiddleware,
  requireRole("FARMER"),
  updateOrderStatus
);

// POST /api/orders/:id/pay
// Sirf order ka BUYER payment kar sakta hai
router.post(
  "/:id/pay",
  authMiddleware,
  requireRole("BUYER"),
  createPaymentOrder
);

// POST /api/orders/:id/verify
// Sirf order ka BUYER payment verify kar sakta hai
router.post(
  "/:id/verify",
  authMiddleware,
  requireRole("BUYER"),
  verifyPayment
);

// GET /api/orders/:id
// Sirf us order ka BUYER ya FARMER dekh sakta hai
router.get(
  "/:id",
  authMiddleware,
  getSingleOrder
);

module.exports = router;