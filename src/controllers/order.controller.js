const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===== CREATE ORDER =====
async function createOrder(req, res) {
  try {
    const { listingId, quantityOrdered } = req.body;

    if (!listingId || !quantityOrdered) {
      return res.status(400).json({
        error: "Listing ID aur quantity zaroori hai.",
      });
    }

    const listing = await prisma.listing.findUnique({
      where: {
        id: parseInt(listingId),
      },
    });

    if (!listing) {
      return res.status(404).json({
        error: "Listing nahi mili.",
      });
    }

    if (quantityOrdered <= 0) {
      return res.status(400).json({
        error: "Quantity 0 se zyada honi chahiye.",
      });
    }

    if (quantityOrdered > listing.quantity) {
      return res.status(400).json({
        error: "Itni quantity available nahi hai.",
      });
    }

    const totalPrice =
      parseFloat(quantityOrdered) * listing.pricePerQuintal;

    const order = await prisma.order.create({
      data: {
        listingId: listing.id,
        buyerId: req.user.userId,
        farmerId: listing.farmerId,
        quantityOrdered: parseFloat(quantityOrdered),
        totalPrice: totalPrice,
      },
    });

    res.status(201).json({
      message: "Order successfully create ho gaya!",
      order,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Order create karne mein error aaya.",
    });
  }
}

// ===== GET MY ORDERS (BUYER) =====
async function getMyOrdersAsBuyer(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        buyerId: req.user.userId,
      },
      include: {
        listing: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      orders,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Orders fetch karne mein error aaya.",
    });
  }
}

// ===== GET MY ORDERS (FARMER) =====
async function getMyOrdersAsFarmer(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        farmerId: req.user.userId,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            location: true,
          },
        },
        listing: {
          select: {
            id: true,
            cropName: true,
            quantity: true,
            pricePerQuintal: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      orders,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Orders fetch karne mein error aaya.",
    });
  }
}

// ===== GET SINGLE ORDER =====
async function getSingleOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        listing: true,
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
        error:
          "Aap is order ko dekhne ke liye authorized nahi hain.",
      });
    }

    res.status(200).json({
      order,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Order fetch karne mein error aaya.",
    });
  }
}

// ===== UPDATE ORDER STATUS =====
const VALID_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: "Status zaroori hai.",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Status sirf inme se ek hona chahiye: ${VALID_STATUSES.join(
          ", "
        )}`,
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!order) {
      return res.status(404).json({
        error: "Order nahi mila.",
      });
    }

    if (order.farmerId !== req.user.userId) {
      return res.status(403).json({
        error:
          "Sirf order ka Farmer hi status update kar sakta hai.",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status: status,
      },
    });

    res.status(200).json({
      message: "Order status update ho gaya!",
      order: updatedOrder,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Order status update karne mein error aaya.",
    });
  }
}

// ===== CREATE PAYMENT ORDER (RAZORPAY) =====
async function createPaymentOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!order) {
      return res.status(404).json({
        error: "Order nahi mila.",
      });
    }

    if (order.buyerId !== req.user.userId) {
      return res.status(403).json({
        error:
          "Sirf order ka Buyer hi payment kar sakta hai.",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        error: "Ye order pehle se paid hai.",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalPrice * 100),
      currency: "INR",
      receipt: `order_${order.id}`,
    });

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        razorpayOrderId: razorpayOrder.id,
      },
    });

    res.status(200).json({
      message: "Razorpay payment order create ho gaya!",
      razorpayOrder,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Payment order create karne mein error aaya.",
    });
  }
}

// ===== VERIFY PAYMENT (RAZORPAY) =====
async function verifyPayment(req, res) {
  try {
    const { id } = req.params;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        error:
          "Payment verify karne ke liye saari details zaroori hain.",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!order) {
      return res.status(404).json({
        error: "Order nahi mila.",
      });
    }

    if (order.buyerId !== req.user.userId) {
      return res.status(403).json({
        error:
          "Sirf order ka Buyer hi payment verify kar sakta hai.",
      });
    }

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        error:
          "Payment verify nahi hua. Signature match nahi kar raha.",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: "paid",
        status: "confirmed",
      },
    });

    res.status(200).json({
      message: "Payment successfully verify ho gaya!",
      order: updatedOrder,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Payment verify karne mein error aaya.",
    });
  }
}

// ===== EXPORTS =====
module.exports = {
  createOrder,
  getMyOrdersAsBuyer,
  getMyOrdersAsFarmer,
  getSingleOrder,
  updateOrderStatus,
  createPaymentOrder,
  verifyPayment,
};