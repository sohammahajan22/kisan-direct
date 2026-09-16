import { useEffect, useState } from "react";
import API from "../api/axios";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [payingOrderId, setPayingOrderId] = useState(null);

  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewedOrderIds, setReviewedOrderIds] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setError("");

      const response = await API.get("/orders/my-orders");
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Orders fetch nahi ho paaye."
      );
    }
  }

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  async function handlePayment(order) {
    try {
      setError("");
      setMessage("");
      setPayingOrderId(order.id);

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setError("Razorpay load nahi ho paaya.");
        setPayingOrderId(null);
        return;
      }

      const response = await API.post(
        `/orders/${order.id}/pay`
      );

      const razorpayOrder = response.data.razorpayOrder;
      const keyId = response.data.key_id;

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Kisan Direct",
        description: `Payment for Order #${order.id}`,
        order_id: razorpayOrder.id,

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await API.post(
              `/orders/${order.id}/verify`,
              {
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }
            );

            setMessage(
              verifyResponse.data.message ||
                "Payment successfully verify ho gaya!"
            );

            setPayingOrderId(null);
            fetchOrders();
          } catch (err) {
            setError(
              err.response?.data?.error ||
                "Payment verification failed."
            );

            setPayingOrderId(null);
          }
        },

        modal: {
          ondismiss: function () {
            setPayingOrderId(null);
            setMessage("Payment cancel ho gaya.");
          },
        },

        theme: {
          color: "#19d66b",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function () {
        setError("Payment failed. Please try again.");
        setPayingOrderId(null);
      });

      razorpay.open();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Payment start nahi ho paaya."
      );

      setPayingOrderId(null);
    }
  }

  function openReviewForm(orderId) {
    setReviewingOrderId(orderId);
    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
  }

  function closeReviewForm() {
    setReviewingOrderId(null);
    setReviewError("");
  }

  async function handleSubmitReview(orderId) {
    try {
      setReviewError("");
      setSubmittingReview(true);

      await API.post("/reviews", {
        orderId,
        rating: Number(reviewRating),
        comment: reviewComment,
      });

      setMessage("Review submit ho gaya!");
      setReviewedOrderIds((prev) => [...prev, orderId]);
      setReviewingOrderId(null);
      setSubmittingReview(false);
    } catch (err) {
      setReviewError(
        err.response?.data?.error ||
          "Review submit nahi ho paaya."
      );

      setSubmittingReview(false);
    }
  }

  const totalOrders = orders.length;

  const paidOrders = orders.filter(
    (order) => order.paymentStatus === "paid"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const totalSpent = orders.reduce(
    (sum, order) => sum + Number(order.totalPrice || 0),
    0
  );

  if (error && orders.length === 0) {
    return (
      <main className="orders-page">
        <div className="orders-container">
          <div className="orders-hero">
            <span className="orders-eyebrow">
              📦 ORDER CENTER
            </span>

            <h1>My Orders</h1>

            <p>
              Track your purchases, payments and deliveries
              from one place.
            </p>
          </div>

          <div className="orders-error">
            ⚠️ {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <div className="orders-container">

        {/* HERO */}
        <section className="orders-hero">
          <div>
            <span className="orders-eyebrow">
              📦 BUYER ORDER CENTER
            </span>

            <h1>
              Your orders.
              <br />
              <span>All in one place.</span>
            </h1>

            <p>
              Track your crop purchases, secure payments and
              delivery progress with Kisan Direct.
            </p>
          </div>

          <div className="orders-live">
            <span></span>
            ORDERS LIVE
          </div>
        </section>

        {/* STATS */}
        <section className="orders-stats">

          <div className="orders-stat">
            <div className="orders-stat-icon">📦</div>
            <small>TOTAL ORDERS</small>
            <strong>{totalOrders}</strong>
            <span>Your purchases</span>
          </div>

          <div className="orders-stat">
            <div className="orders-stat-icon">💳</div>
            <small>PAID ORDERS</small>
            <strong>{paidOrders}</strong>
            <span>Payments completed</span>
          </div>

          <div className="orders-stat">
            <div className="orders-stat-icon">🚚</div>
            <small>DELIVERED</small>
            <strong>{deliveredOrders}</strong>
            <span>Orders received</span>
          </div>

          <div className="orders-stat revenue">
            <div className="orders-stat-icon">₹</div>
            <small>TOTAL SPENT</small>
            <strong>
              ₹{totalSpent.toLocaleString("en-IN")}
            </strong>
            <span>Purchase value</span>
          </div>

        </section>

        {/* MESSAGES */}
        {message && (
          <div className="orders-success">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="orders-error">
            ⚠️ {error}
          </div>
        )}

        {/* ORDER LIST */}
        <section className="orders-section">

          <div className="orders-section-heading">
            <div>
              <span>RECENT ACTIVITY</span>
              <h2>Your purchases</h2>
            </div>

            <div className="orders-count">
              {orders.length} ORDERS
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="orders-empty">
              <div className="empty-icon">🌾</div>

              <h3>No orders yet</h3>

              <p>
                Explore the marketplace and place your
                first crop order directly from a farmer.
              </p>
            </div>
          ) : (
            <div className="orders-list">

              {orders.map((order) => {
                const isPaid =
                  order.paymentStatus === "paid";

                const isDelivered =
                  order.status === "delivered";

                const isReviewing =
                  reviewingOrderId === order.id;

                const isReviewed =
                  reviewedOrderIds.includes(order.id);

                return (
                  <article
                    className="order-card"
                    key={order.id}
                  >

                    {/* TOP */}
                    <div className="order-card-top">

                      <div className="order-crop-icon">
                        🌾
                      </div>

                      <div className="order-title">
                        <span>ORDER #{order.id}</span>

                        <h3>
                          {order.listing?.cropName ||
                            "Crop Order"}
                        </h3>

                        <p>
                          🌱 Direct farmer purchase
                        </p>
                      </div>

                      <div
                        className={`order-status-badge ${String(
                          order.status
                        ).toLowerCase()}`}
                      >
                        {order.status}
                      </div>

                    </div>

                    {/* DETAILS */}
                    <div className="order-details">

                      <div className="order-detail">
                        <small>QUANTITY</small>
                        <strong>
                          {order.quantityOrdered} QTL
                        </strong>
                      </div>

                      <div className="order-detail">
                        <small>TOTAL VALUE</small>
                        <strong>
                          ₹
                          {Number(
                            order.totalPrice || 0
                          ).toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <div className="order-detail">
                        <small>PAYMENT</small>
                        <strong
                          className={
                            isPaid
                              ? "payment-paid"
                              : "payment-pending"
                          }
                        >
                          {isPaid
                            ? "✓ PAID"
                            : "PENDING"}
                        </strong>
                      </div>

                      <div className="order-detail">
                        <small>DELIVERY</small>
                        <strong>
                          {isDelivered
                            ? "✓ Delivered"
                            : order.status}
                        </strong>
                      </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="order-card-actions">

                      {!isPaid && (
                        <button
                          className="pay-button"
                          onClick={() =>
                            handlePayment(order)
                          }
                          disabled={
                            payingOrderId === order.id
                          }
                        >
                          {payingOrderId === order.id
                            ? "Processing..."
                            : "💳 Pay Now"}
                        </button>
                      )}

                      {isPaid && (
                        <div className="payment-complete">
                          ✓ Payment Completed
                        </div>
                      )}

                      {isDelivered &&
                        !isReviewed && (
                          <button
                            className="review-button"
                            onClick={() =>
                              openReviewForm(order.id)
                            }
                          >
                            ⭐ Leave a Review
                          </button>
                        )}

                      {isReviewed && (
                        <div className="review-complete">
                          ✓ Review Submitted
                        </div>
                      )}

                    </div>

                    {/* REVIEW FORM */}
                    {isReviewing && (
                      <div className="review-panel">

                        <div className="review-panel-heading">
                          <div>
                            <span>YOUR FEEDBACK</span>
                            <h3>
                              Rate your experience
                            </h3>
                          </div>

                          <button
                            className="review-close"
                            onClick={closeReviewForm}
                            disabled={submittingReview}
                          >
                            ×
                          </button>
                        </div>

                        <div className="rating-field">
                          <label>RATING</label>

                          <select
                            value={reviewRating}
                            onChange={(e) =>
                              setReviewRating(
                                e.target.value
                              )
                            }
                          >
                            <option value={5}>
                              ⭐⭐⭐⭐⭐ 5 - Excellent
                            </option>
                            <option value={4}>
                              ⭐⭐⭐⭐ 4 - Good
                            </option>
                            <option value={3}>
                              ⭐⭐⭐ 3 - Average
                            </option>
                            <option value={2}>
                              ⭐⭐ 2 - Poor
                            </option>
                            <option value={1}>
                              ⭐ 1 - Very Poor
                            </option>
                          </select>
                        </div>

                        <div className="comment-field">
                          <label>COMMENT</label>

                          <textarea
                            placeholder="Tell us about your experience..."
                            value={reviewComment}
                            onChange={(e) =>
                              setReviewComment(
                                e.target.value
                              )
                            }
                          />
                        </div>

                        {reviewError && (
                          <div className="review-error">
                            ⚠️ {reviewError}
                          </div>
                        )}

                        <div className="review-actions">

                          <button
                            className="review-cancel"
                            onClick={closeReviewForm}
                            disabled={submittingReview}
                          >
                            Cancel
                          </button>

                          <button
                            className="review-submit"
                            onClick={() =>
                              handleSubmitReview(
                                order.id
                              )
                            }
                            disabled={submittingReview}
                          >
                            {submittingReview
                              ? "Submitting..."
                              : "Submit Review →"}
                          </button>

                        </div>

                      </div>
                    )}

                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* BANNER */}
        <section className="orders-banner">

          <div>
            <span>DIRECT FARM MARKETPLACE</span>

            <h2>
              Buy directly.
              <br />
              Support real farmers.
            </h2>

            <p>
              Transparent prices, secure payments and
              direct farmer connections — all through
              Kisan Direct.
            </p>
          </div>

          <div className="orders-banner-visual">
            <div className="banner-circle">
              🌾
            </div>

            <div className="banner-node node-left">
              FARMER
            </div>

            <div className="banner-node node-right">
              BUYER
            </div>

            <div className="banner-node node-bottom">
              ✓ SECURE
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}

export default MyOrders;