import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setError("");

      const response = await API.get("/orders/farmer-orders");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.orders || [];

      setOrders(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Orders fetch nahi ho paaye."
      );
    }
  }

  async function updateStatus(orderId, status) {
    try {
      setError("");
      setMessage("");
      setUpdatingId(orderId);

      await API.put(`/orders/${orderId}/status`, {
        status,
      });

      setMessage(
        `Order #${orderId} status updated to ${status}.`
      );

      await fetchOrders();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Status update nahi ho paya."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const stats = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) => order.status === "pending"
      ).length,

      active: orders.filter((order) =>
        ["confirmed", "shipped"].includes(order.status)
      ).length,

      delivered: orders.filter(
        (order) => order.status === "delivered"
      ).length,

      revenue: orders.reduce(
        (sum, order) =>
          sum + Number(order.totalPrice || 0),
        0
      ),
    };
  }, [orders]);

  function getStatusClass(status) {
    return String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function formatStatus(status) {
    if (!status) return "PENDING";

    return String(status)
      .replace(/_/g, " ")
      .toUpperCase();
  }

  return (
    <main className="farmer-orders-page">

      <style>{`
        .farmer-orders-page {
          min-height: calc(100vh - 80px);
          background:
            radial-gradient(circle at 85% 10%, rgba(20, 190, 100, 0.12), transparent 30%),
            radial-gradient(circle at 10% 40%, rgba(20, 120, 70, 0.12), transparent 30%),
            #001f14;
          color: #f2f8f3;
          padding: 70px 7vw 100px;
          box-sizing: border-box;
        }

        .farmer-orders-container {
          max-width: 1250px;
          margin: 0 auto;
        }

        .farmer-orders-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 40px;
          margin-bottom: 45px;
        }

        .farmer-orders-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 9px 15px;
          border: 1px solid rgba(35, 220, 115, 0.25);
          border-radius: 999px;
          color: #20e875;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 20px;
          background: rgba(10, 70, 40, 0.35);
        }

        .farmer-orders-eyebrow::before {
          content: "●";
          font-size: 8px;
          color: #20e875;
        }

        .farmer-orders-hero h1 {
          margin: 0;
          font-size: clamp(42px, 5vw, 72px);
          line-height: 0.98;
          letter-spacing: -3px;
          font-family: Georgia, "Times New Roman", serif;
        }

        .farmer-orders-hero h1 span {
          color: #20e875;
        }

        .farmer-orders-hero p {
          max-width: 650px;
          margin: 22px 0 0;
          color: #91b6a2;
          font-size: 16px;
          line-height: 1.7;
        }

        .orders-live-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border: 1px solid rgba(35, 220, 115, 0.25);
          border-radius: 999px;
          color: #20e875;
          font-weight: 800;
          white-space: nowrap;
          background: rgba(8, 50, 32, 0.65);
        }

        .orders-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #20e875;
          box-shadow: 0 0 14px #20e875;
        }

        .farmer-orders-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 55px;
        }

        .farmer-orders-stat {
          position: relative;
          overflow: hidden;
          min-height: 150px;
          padding: 25px;
          border: 1px solid rgba(53, 170, 105, 0.22);
          border-radius: 22px;
          background: linear-gradient(
            145deg,
            rgba(8, 57, 37, 0.9),
            rgba(3, 38, 25, 0.85)
          );
        }

        .farmer-orders-stat::after {
          content: "";
          position: absolute;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          right: -40px;
          top: -45px;
          background: rgba(30, 220, 110, 0.06);
        }

        .farmer-orders-stat-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(18, 100, 58, 0.55);
          font-size: 20px;
          margin-bottom: 18px;
        }

        .farmer-orders-stat small {
          display: block;
          color: #6f9e86;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .farmer-orders-stat strong {
          display: block;
          margin-top: 8px;
          font-size: 32px;
          color: #f2f8f3;
          font-family: Georgia, "Times New Roman", serif;
        }

        .farmer-orders-stat.revenue strong {
          color: #20e875;
          font-size: 28px;
        }

        .farmer-orders-section {
          margin-top: 20px;
        }

        .farmer-orders-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 22px;
        }

        .farmer-orders-section-heading span {
          color: #20e875;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .farmer-orders-section-heading h2 {
          margin: 8px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 34px;
        }

        .farmer-orders-count {
          padding: 10px 15px;
          border: 1px solid rgba(35, 220, 115, 0.2);
          border-radius: 999px;
          color: #8db7a1;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .farmer-orders-message {
          padding: 15px 18px;
          border-radius: 14px;
          margin-bottom: 20px;
          background: rgba(20, 180, 90, 0.12);
          border: 1px solid rgba(30, 220, 110, 0.25);
          color: #55ed99;
        }

        .farmer-orders-error {
          padding: 15px 18px;
          border-radius: 14px;
          margin-bottom: 20px;
          background: rgba(220, 50, 50, 0.1);
          border: 1px solid rgba(220, 70, 70, 0.25);
          color: #ff8d8d;
        }

        .farmer-orders-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .farmer-order-card {
          position: relative;
          overflow: hidden;
          padding: 28px;
          border: 1px solid rgba(55, 170, 105, 0.2);
          border-radius: 24px;
          background:
            linear-gradient(
              145deg,
              rgba(7, 55, 35, 0.96),
              rgba(2, 32, 21, 0.96)
            );
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.15);
        }

        .farmer-order-card:hover {
          border-color: rgba(35, 220, 115, 0.35);
          transform: translateY(-2px);
          transition: 0.2s ease;
        }

        .farmer-order-top {
          display: flex;
          align-items: center;
          gap: 18px;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(80, 160, 110, 0.12);
        }

        .farmer-order-icon {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 17px;
          background: rgba(18, 100, 58, 0.55);
          font-size: 27px;
        }

        .farmer-order-title {
          flex: 1;
        }

        .farmer-order-title small {
          color: #61a784;
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 800;
        }

        .farmer-order-title h3 {
          margin: 5px 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 27px;
        }

        .farmer-order-title p {
          margin: 0;
          color: #6f9e86;
          font-size: 13px;
        }

        .farmer-order-status {
          padding: 9px 14px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
          border: 1px solid rgba(35, 220, 115, 0.2);
          background: rgba(20, 110, 60, 0.2);
          color: #20e875;
        }

        .farmer-order-status.pending {
          color: #ffd166;
          border-color: rgba(255, 209, 102, 0.25);
          background: rgba(255, 209, 102, 0.08);
        }

        .farmer-order-status.cancelled {
          color: #ff7777;
          border-color: rgba(255, 100, 100, 0.25);
          background: rgba(255, 100, 100, 0.08);
        }

        .farmer-order-status.delivered {
          color: #58f59b;
        }

        .farmer-order-details {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          padding: 22px 0;
        }

        .farmer-order-detail {
          min-height: 72px;
          padding: 15px;
          border: 1px solid rgba(70, 160, 105, 0.12);
          border-radius: 14px;
          background: rgba(4, 45, 28, 0.55);
        }

        .farmer-order-detail small {
          display: block;
          color: #65927c;
          font-size: 9px;
          letter-spacing: 1.2px;
          font-weight: 800;
          margin-bottom: 9px;
        }

        .farmer-order-detail strong {
          color: #eef8f1;
          font-size: 15px;
        }

        .farmer-order-detail .price {
          color: #20e875;
          font-size: 18px;
        }

        .payment-paid {
          color: #20e875 !important;
        }

        .payment-pending {
          color: #ffd166 !important;
        }

        .farmer-order-actions {
          display: flex;
          gap: 10px;
          padding-top: 5px;
        }

        .farmer-status-btn {
          border: 1px solid rgba(60, 170, 105, 0.25);
          background: rgba(9, 72, 43, 0.7);
          color: #dcefe3;
          padding: 11px 17px;
          border-radius: 11px;
          cursor: pointer;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .farmer-status-btn:hover:not(:disabled) {
          background: #20d96f;
          color: #002515;
          border-color: #20d96f;
          transform: translateY(-1px);
        }

        .farmer-status-btn.cancel:hover:not(:disabled) {
          background: #ef6464;
          color: white;
          border-color: #ef6464;
        }

        .farmer-status-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .farmer-orders-empty {
          text-align: center;
          padding: 80px 20px;
          border: 1px dashed rgba(60, 170, 105, 0.25);
          border-radius: 24px;
          background: rgba(5, 50, 31, 0.35);
        }

        .farmer-orders-empty-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .farmer-orders-empty h3 {
          margin: 0 0 8px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 27px;
        }

        .farmer-orders-empty p {
          margin: 0;
          color: #759c88;
        }

        .farmer-orders-loading {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #20e875;
          font-size: 18px;
          font-weight: 800;
        }

        @media (max-width: 1000px) {
          .farmer-orders-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .farmer-order-details {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 700px) {
          .farmer-orders-page {
            padding: 45px 20px 70px;
          }

          .farmer-orders-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .farmer-orders-stats {
            grid-template-columns: 1fr;
          }

          .farmer-order-top {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .farmer-order-details {
            grid-template-columns: 1fr 1fr;
          }

          .farmer-order-actions {
            flex-wrap: wrap;
          }

          .farmer-status-btn {
            flex: 1;
          }
        }

        @media (max-width: 480px) {
          .farmer-order-details {
            grid-template-columns: 1fr;
          }

          .farmer-orders-hero h1 {
            letter-spacing: -1.5px;
          }
        }
      `}</style>

      <div className="farmer-orders-container">

        {/* HERO */}

        <section className="farmer-orders-hero">

          <div>
            <div className="farmer-orders-eyebrow">
              FARMER COMMAND CENTER
            </div>

            <h1>
              Manage your
              <br />
              <span>orders smarter.</span>
            </h1>

            <p>
              Review buyer orders, confirm purchases,
              manage delivery status and keep your
              farm business moving.
            </p>
          </div>

          <div className="orders-live-pill">
            <span className="orders-live-dot"></span>
            MARKETPLACE LIVE
          </div>

        </section>

        {/* STATS */}

        <section className="farmer-orders-stats">

          <div className="farmer-orders-stat">
            <div className="farmer-orders-stat-icon">
              📦
            </div>

            <small>TOTAL ORDERS</small>

            <strong>{stats.total}</strong>
          </div>

          <div className="farmer-orders-stat">
            <div className="farmer-orders-stat-icon">
              ⏳
            </div>

            <small>PENDING</small>

            <strong>{stats.pending}</strong>
          </div>

          <div className="farmer-orders-stat">
            <div className="farmer-orders-stat-icon">
              🚚
            </div>

            <small>ACTIVE DELIVERY</small>

            <strong>{stats.active}</strong>
          </div>

          <div className="farmer-orders-stat revenue">
            <div className="farmer-orders-stat-icon">
              ₹
            </div>

            <small>ORDER VALUE</small>

            <strong>
              ₹{stats.revenue.toLocaleString("en-IN")}
            </strong>
          </div>

        </section>

        {/* MESSAGES */}

        {message && (
          <div className="farmer-orders-message">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="farmer-orders-error">
            ⚠️ {error}
          </div>
        )}

        {/* ORDERS */}

        <section className="farmer-orders-section">

          <div className="farmer-orders-section-heading">

            <div>
              <span>RECENT ACTIVITY</span>

              <h2>Customer Orders</h2>
            </div>

            <div className="farmer-orders-count">
              {orders.length} ORDERS
            </div>

          </div>

          {orders.length === 0 ? (

            <div className="farmer-orders-empty">

              <div className="farmer-orders-empty-icon">
                🌾
              </div>

              <h3>
                No customer orders yet
              </h3>

              <p>
                New buyer orders will appear here.
              </p>

            </div>

          ) : (

            <div className="farmer-orders-list">

              {orders.map((order) => {

                const isPaid =
                  order.paymentStatus === "paid";

                const isUpdating =
                  updatingId === order.id;

                return (

                  <article
                    className="farmer-order-card"
                    key={order.id}
                  >

                    {/* TOP */}

                    <div className="farmer-order-top">

                      <div className="farmer-order-icon">
                        🌾
                      </div>

                      <div className="farmer-order-title">

                        <small>
                          ORDER #{order.id}
                        </small>

                        <h3>
                          {order.listing?.cropName ||
                            "Crop Order"}
                        </h3>

                        <p>
                          🌱 Direct marketplace purchase
                        </p>

                      </div>

                      <div
                        className={`farmer-order-status ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="farmer-order-details">

                      <div className="farmer-order-detail">

                        <small>QUANTITY</small>

                        <strong>
                          {order.quantityOrdered} QTL
                        </strong>

                      </div>

                      <div className="farmer-order-detail">

                        <small>TOTAL VALUE</small>

                        <strong className="price">
                          ₹
                          {Number(
                            order.totalPrice || 0
                          ).toLocaleString("en-IN")}
                        </strong>

                      </div>

                      <div className="farmer-order-detail">

                        <small>BUYER</small>

                        <strong>
                          {order.buyer?.name ||
                            "Buyer"}
                        </strong>

                      </div>

                      <div className="farmer-order-detail">

                        <small>BUYER PHONE</small>

                        <strong>
                          {order.buyer?.phone ||
                            "Not available"}
                        </strong>

                      </div>

                      <div className="farmer-order-detail">

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

                    </div>

                    {/* ACTIONS */}

                    <div className="farmer-order-actions">

                      <button
                        className="farmer-status-btn"
                        disabled={
                          isUpdating ||
                          order.status === "confirmed"
                        }
                        onClick={() =>
                          updateStatus(
                            order.id,
                            "confirmed"
                          )
                        }
                      >
                        {isUpdating
                          ? "Updating..."
                          : "✓ Confirm"}
                      </button>

                      <button
                        className="farmer-status-btn"
                        disabled={
                          isUpdating ||
                          order.status === "shipped"
                        }
                        onClick={() =>
                          updateStatus(
                            order.id,
                            "shipped"
                          )
                        }
                      >
                        🚚 Shipped
                      </button>

                      <button
                        className="farmer-status-btn"
                        disabled={
                          isUpdating ||
                          order.status === "delivered"
                        }
                        onClick={() =>
                          updateStatus(
                            order.id,
                            "delivered"
                          )
                        }
                      >
                        📦 Delivered
                      </button>

                      <button
                        className="farmer-status-btn cancel"
                        disabled={
                          isUpdating ||
                          order.status === "cancelled" ||
                          order.status === "delivered"
                        }
                        onClick={() =>
                          updateStatus(
                            order.id,
                            "cancelled"
                          )
                        }
                      >
                        ✕ Cancel
                      </button>

                    </div>

                  </article>

                );
              })}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

export default FarmerOrders;