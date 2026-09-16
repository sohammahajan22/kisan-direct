import { useEffect, useState } from "react";
import API from "../api/axios";
import { supabase } from "../lib/supabase";

function FarmerDashboard() {
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddCrop, setShowAddCrop] = useState(false);
  const [addingCrop, setAddingCrop] = useState(false);
  const [cropError, setCropError] = useState("");

  const [cropForm, setCropForm] = useState({
    cropName: "",
    quantity: "",
    pricePerQuintal: "",
    location: "",
    photoFile: null,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [listingRes, orderRes] = await Promise.all([
        API.get("/listings/my"),
        API.get("/orders/farmer-orders"),
      ]);

      const listingData = Array.isArray(listingRes.data)
        ? listingRes.data
        : listingRes.data?.listings || [];

      const orderData = Array.isArray(orderRes.data)
        ? orderRes.data
        : orderRes.data?.orders || [];

      setListings(listingData);
      setOrders(orderData);
    } catch (error) {
      console.error("Dashboard error:", error);
      setListings([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function handleCropChange(e) {
    const { name, value } = e.target;

    setCropForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleAddCrop(e) {
    e.preventDefault();

    setCropError("");
    setAddingCrop(true);

    try {
      let photoUrl = null;

      // Upload image to Supabase Storage
      if (cropForm.photoFile) {
        const file = cropForm.photoFile;

        const fileExt = file.name.split(".").pop();

        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("crop-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("crop-images")
          .getPublicUrl(fileName);

        photoUrl = publicUrlData.publicUrl;
      }

      await API.post("/listings", {
        cropName: cropForm.cropName,
        quantity: Number(cropForm.quantity),
        pricePerQuintal: Number(cropForm.pricePerQuintal),
        location: cropForm.location,
        photoUrl: photoUrl,
      });

      setCropForm({
        cropName: "",
        quantity: "",
        pricePerQuintal: "",
        location: "",
        photoFile: null,
      });

      setShowAddCrop(false);

      await loadDashboard();
    } catch (error) {
      console.error("Add crop error:", error);

      setCropError(
        error.response?.data?.error ||
          error.message ||
          "Crop add nahi ho paya. Please try again."
      );
    } finally {
      setAddingCrop(false);
    }
  }

  const totalStock = listings.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalPrice || 0),
    0
  );

  const activeListings = listings.filter(
    (item) => item.status === "active"
  ).length;

  if (loading) {
    return (
      <div className="farmer-dashboard">
        <div className="dashboard-loading">
          Loading Farmer Command Center...
        </div>
      </div>
    );
  }

  return (
    <div className="farmer-dashboard">

      {/* HEADER */}
      <section className="farmer-dashboard-header">
        <div>
          <div className="dashboard-eyebrow">
            🚜 FARMER COMMAND CENTER
          </div>

          <h1>
            Grow your business.
            <br />
            <span>Sell smarter.</span>
          </h1>

          <p>
            Manage your crop inventory, track orders and monitor
            your marketplace performance from one place.
          </p>
        </div>

        <div
          className="dashboard-live"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <span></span>
          MARKETPLACE LIVE

          <button
            onClick={() => {
              setCropError("");
              setShowAddCrop(true);
            }}
            style={{
              marginLeft: "10px",
              border: "none",
              borderRadius: "12px",
              padding: "12px 18px",
              background: "#22c55e",
              color: "#052e16",
              fontWeight: "800",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            + Add New Crop
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="dashboard-stat-grid">

        <div className="dashboard-stat-card">
          <div className="stat-top">
            <span>🌾</span>
            <small>INVENTORY</small>
          </div>

          <strong>{totalStock}</strong>
          <p>Quintals available</p>
          <div className="stat-line"></div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-top">
            <span>📦</span>
            <small>ORDERS</small>
          </div>

          <strong>{orders.length}</strong>
          <p>Total customer orders</p>
          <div className="stat-line"></div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-top">
            <span>🌱</span>
            <small>LISTINGS</small>
          </div>

          <strong>{activeListings}</strong>
          <p>Active crop listings</p>
          <div className="stat-line"></div>
        </div>

        <div className="dashboard-stat-card revenue-card">
          <div className="stat-top">
            <span>₹</span>
            <small>REVENUE</small>
          </div>

          <strong>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </strong>

          <p>Order value generated</p>
          <div className="stat-line"></div>
        </div>

      </section>

      {/* MAIN GRID */}
      <section className="dashboard-main-grid">

        {/* INVENTORY */}
        <div className="dashboard-panel">

          <div className="panel-heading">
            <div>
              <span>LIVE INVENTORY</span>
              <h2>Your crop listings</h2>
            </div>

            <div
              className="panel-count"
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                setCropError("");
                setShowAddCrop(true);
              }}
            >
              + ADD CROP
            </div>
          </div>

          <div className="inventory-list">

            {listings.length === 0 ? (
              <div className="dashboard-empty">
                <div>🌱</div>
                <h3>No crop listings yet</h3>

                <p>
                  Add your first crop to start selling directly.
                </p>

                <button
                  onClick={() => setShowAddCrop(true)}
                  style={{
                    marginTop: "15px",
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#22c55e",
                    color: "#052e16",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  + Add Your First Crop
                </button>
              </div>
            ) : (
              listings.map((listing) => (
                <div
                  className="inventory-row"
                  key={listing.id}
                >
                  <div className="inventory-icon">
                    {listing.photoUrl ? (
                      <img
                        src={listing.photoUrl}
                        alt={listing.cropName}
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    ) : (
                      "🌾"
                    )}
                  </div>

                  <div className="inventory-info">
                    <strong>{listing.cropName}</strong>

                    <span>
                      📍 {listing.location}
                    </span>
                  </div>

                  <div className="inventory-quantity">
                    <small>AVAILABLE</small>

                    <strong>
                      {listing.quantity} QTL
                    </strong>
                  </div>

                  <div className="inventory-price">
                    <small>PRICE / QTL</small>

                    <strong>
                      ₹
                      {Number(
                        listing.pricePerQuintal
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="inventory-status">
                    <span>
                      ● {listing.status}
                    </span>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>

        {/* ORDERS */}
        <div className="dashboard-panel">

          <div className="panel-heading">
            <div>
              <span>RECENT ACTIVITY</span>
              <h2>Latest orders</h2>
            </div>

            <div className="panel-count">
              {orders.length} ORDERS
            </div>
          </div>

          <div className="orders-list">

            {orders.length === 0 ? (
              <div className="dashboard-empty">
                <div>📦</div>
                <h3>No orders yet</h3>

                <p>
                  Orders from buyers will appear here.
                </p>
              </div>
            ) : (
              orders.slice(0, 6).map((order) => (
                <div
                  className="order-row"
                  key={order.id}
                >
                  <div className="order-number">
                    #{order.id}
                  </div>

                  <div className="order-info">
                    <strong>
                      {order.listing?.cropName || "Crop Order"}
                    </strong>

                    <span>
                      {order.quantityOrdered} QTL
                    </span>
                  </div>

                  <div className="order-value">
                    <strong>
                      ₹
                      {Number(
                        order.totalPrice
                      ).toLocaleString("en-IN")}
                    </strong>

                    <span>
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div
                    className={`order-status ${String(
                      order.status
                    ).toLowerCase()}`}
                  >
                    {order.status}
                  </div>
                </div>
              ))
            )}

          </div>
        </div>

      </section>

      {/* BOTTOM BANNER */}
      <section className="farmer-dashboard-banner">

        <div>
          <span>DIRECT FARM NETWORK</span>

          <h2>
            Your farm.
            <br />
            Your customers. Your price.
          </h2>

          <p>
            Kisan Direct helps farmers reach buyers directly
            with transparent pricing and secure digital orders.
          </p>
        </div>

        <div className="banner-visual">

          <div className="visual-ring">
            🌾
          </div>

          <div className="visual-node node-one">
            FARM
          </div>

          <div className="visual-node node-two">
            BUYER
          </div>

          <div className="visual-node node-three">
            ₹
          </div>

        </div>

      </section>

      {/* ADD CROP MODAL */}
      {showAddCrop && (
        <div
          onClick={() => {
            if (!addingCrop) {
              setShowAddCrop(false);
              setCropError("");
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "520px",
              background:
                "linear-gradient(145deg, #092c20, #061c15)",
              border: "1px solid rgba(34, 197, 94, 0.25)",
              borderRadius: "24px",
              padding: "32px",
              boxShadow:
                "0 30px 100px rgba(0, 0, 0, 0.55)",
            }}
          >

            {/* MODAL HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "26px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#22c55e",
                    fontSize: "12px",
                    fontWeight: "800",
                    letterSpacing: "2px",
                    marginBottom: "8px",
                  }}
                >
                  FARM INVENTORY
                </div>

                <h2
                  style={{
                    margin: 0,
                    color: "#f0fdf4",
                    fontSize: "30px",
                  }}
                >
                  Add New Crop
                </h2>

                <p
                  style={{
                    color: "#7fa895",
                    marginTop: "8px",
                    marginBottom: 0,
                  }}
                >
                  List your crop directly for buyers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!addingCrop) {
                    setShowAddCrop(false);
                    setCropError("");
                  }
                }}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border:
                    "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#d1fae5",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleAddCrop}>

              {/* CROP NAME */}
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>
                  CROP NAME
                </label>

                <input
                  name="cropName"
                  value={cropForm.cropName}
                  onChange={handleCropChange}
                  placeholder="e.g. Rice, Wheat, Onion"
                  required
                  style={inputStyle}
                />
              </div>

              {/* QUANTITY + PRICE */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    QUANTITY (QTL)
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    value={cropForm.quantity}
                    onChange={handleCropChange}
                    placeholder="50"
                    min="0.1"
                    step="0.1"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    PRICE / QTL
                  </label>

                  <input
                    type="number"
                    name="pricePerQuintal"
                    value={cropForm.pricePerQuintal}
                    onChange={handleCropChange}
                    placeholder="2500"
                    min="1"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* LOCATION */}
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>
                  FARM LOCATION
                </label>

                <input
                  name="location"
                  value={cropForm.location}
                  onChange={handleCropChange}
                  placeholder="e.g. Nashik, Maharashtra"
                  required
                  style={inputStyle}
                />
              </div>

              {/* CROP IMAGE */}
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>
                  CROP IMAGE
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCropForm((prev) => ({
                      ...prev,
                      photoFile:
                        e.target.files?.[0] || null,
                    }))
                  }
                  style={{
                    ...inputStyle,
                    padding: "11px 12px",
                    cursor: "pointer",
                  }}
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "7px",
                    color: "#6f9881",
                    fontSize: "12px",
                  }}
                >
                  JPG, PNG or WEBP image
                </small>

                {cropForm.photoFile && (
                  <div
                    style={{
                      marginTop: "10px",
                      color: "#86efac",
                      fontSize: "13px",
                    }}
                  >
                    ✓ {cropForm.photoFile.name}
                  </div>
                )}
              </div>

              {/* PREVIEW */}
              {cropForm.quantity &&
                cropForm.pricePerQuintal && (
                  <div
                    style={{
                      padding: "16px",
                      marginBottom: "18px",
                      borderRadius: "14px",
                      background:
                        "rgba(34, 197, 94, 0.07)",
                      border:
                        "1px solid rgba(34, 197, 94, 0.15)",
                    }}
                  >
                    <div
                      style={{
                        color: "#7fa895",
                        fontSize: "11px",
                        letterSpacing: "1px",
                      }}
                    >
                      ESTIMATED LISTING VALUE
                    </div>

                    <strong
                      style={{
                        display: "block",
                        color: "#22c55e",
                        fontSize: "24px",
                        marginTop: "5px",
                      }}
                    >
                      ₹
                      {(
                        Number(cropForm.quantity) *
                        Number(cropForm.pricePerQuintal)
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                )}

              {/* ERROR */}
              {cropError && (
                <div
                  style={{
                    padding: "12px",
                    marginBottom: "16px",
                    borderRadius: "10px",
                    background:
                      "rgba(239, 68, 68, 0.12)",
                    border:
                      "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#fca5a5",
                    fontSize: "14px",
                  }}
                >
                  {cropError}
                </div>
              )}

              {/* ACTIONS */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!addingCrop) {
                      setShowAddCrop(false);
                      setCropError("");
                    }
                  }}
                  disabled={addingCrop}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background:
                      "rgba(255,255,255,0.04)",
                    color: "#b7d8c5",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addingCrop}
                  style={{
                    flex: 2,
                    padding: "14px",
                    border: "none",
                    borderRadius: "12px",
                    background: addingCrop
                      ? "#166534"
                      : "#22c55e",
                    color: "#052e16",
                    fontWeight: "800",
                    fontSize: "15px",
                    cursor: addingCrop
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {addingCrop
                    ? "Publishing..."
                    : "🌾 Publish Crop"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const labelStyle = {
  display: "block",
  color: "#b7d8c5",
  fontSize: "13px",
  fontWeight: "700",
  marginBottom: "8px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 15px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.045)",
  color: "#f0fdf4",
  outline: "none",
  fontSize: "15px",
};

export default FarmerDashboard;