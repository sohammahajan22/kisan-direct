const express = require("express");

const router = express.Router();

const {
  createReview,
  getOrderReview,
  getUserReviews,
} = require("../controllers/review.controller");

const {
  authMiddleware,
} = require("../middleware/auth.middleware");

// POST /api/reviews
router.post(
  "/",
  authMiddleware,
  createReview
);

// GET /api/reviews/order/:orderId
router.get(
  "/order/:orderId",
  authMiddleware,
  getOrderReview
);

// GET /api/reviews/user/:userId
router.get(
  "/user/:userId",
  getUserReviews
);

module.exports = router;