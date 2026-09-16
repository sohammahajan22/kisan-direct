const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ===== CREATE REVIEW =====
async function createReview(req, res) {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({
        error: "Order ID aur rating zaroori hai.",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating 1 se 5 ke beech honi chahiye.",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(orderId),
      },
    });

    if (!order) {
      return res.status(404).json({
        error: "Order nahi mila.",
      });
    }

    if (
      order.buyerId !== req.user.userId &&
      order.farmerId !== req.user.userId
    ) {
      return res.status(403).json({
        error: "Aap is order pe review nahi de sakte.",
      });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        error: "Sirf delivered order pe review diya ja sakta hai.",
      });
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        orderId: parseInt(orderId),
      },
    });

    if (existingReview) {
      return res.status(400).json({
        error: "Is order pe pehle se review diya ja chuka hai.",
      });
    }

    const revieweeId =
      req.user.userId === order.buyerId
        ? order.farmerId
        : order.buyerId;

    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        reviewerId: req.user.userId,
        revieweeId: revieweeId,
        rating: parseInt(rating),
        comment: comment || null,
      },
    });

    res.status(201).json({
      message: "Review successfully create ho gaya!",
      review,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Review create karne mein error aaya.",
    });
  }
}

// ===== CHECK REVIEW FOR AN ORDER =====
async function getOrderReview(req, res) {
  try {
    const { orderId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        orderId: parseInt(orderId),
      },
    });

    res.status(200).json({
      reviewed: !!review,
      review: review || null,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Review status fetch nahi ho paaya.",
    });
  }
}

// ===== GET REVIEWS FOR A USER =====
async function getUserReviews(req, res) {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: parseInt(userId),
      },
      include: {
        reviewer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      reviews,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Reviews fetch karne mein error aaya.",
    });
  }
}

// ===== EXPORTS =====
module.exports = {
  createReview,
  getOrderReview,
  getUserReviews,
};