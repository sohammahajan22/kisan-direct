import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Listings() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedListing, setSelectedListing] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/listings");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.listings || [];

      setListings(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Listings fetch karne mein error aaya."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (search.trim()) {
      result = result.filter((item) =>
        item.cropName
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (location.trim()) {
      result = result.filter((item) =>
        item.location
          ?.toLowerCase()
          .includes(location.toLowerCase())
      );
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.pricePerQuintal) -
          Number(b.pricePerQuintal)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.pricePerQuintal) -
          Number(a.pricePerQuintal)
      );
    }

    if (sort === "stock-high") {
      result.sort(
        (a, b) =>
          Number(b.quantity) -
          Number(a.quantity)
      );
    }

    if (sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
    }

    return result;
  }, [listings, search, location, sort]);

  const totalStock = listings.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const averagePrice =
    listings.length > 0
      ? Math.round(
          listings.reduce(
            (sum, item) =>
              sum +
              Number(item.pricePerQuintal || 0),
            0
          ) / listings.length
        )
      : 0;

  const farmers = new Set(
    listings.map((item) => item.farmerId)
  ).size;

  function openOrder(listing) {
    setSelectedListing(listing);
    setQuantity("");
    setOrderMessage("");
  }

  function closeOrder() {
    if (ordering) return;

    setSelectedListing(null);
    setQuantity("");
    setOrderMessage("");
  }

  async function placeOrder() {
    if (!selectedListing) return;

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      setOrderMessage(
        "Quantity 0 se zyada honi chahiye."
      );
      return;
    }

    if (qty > Number(selectedListing.quantity)) {
      setOrderMessage(
        `Maximum ${selectedListing.quantity} QTL available hai.`
      );
      return;
    }

    try {
      setOrdering(true);
      setOrderMessage("");

      const response = await API.post("/orders", {
        listingId: selectedListing.id,
        quantityOrdered: qty,
      });

      setOrderMessage(
        response.data.message ||
          "Order successfully create ho gaya!"
      );

      setTimeout(() => {
        setSelectedListing(null);
        setQuantity("");
        setOrderMessage("");
        navigate("/my-orders");
      }, 900);
    } catch (err) {
      setOrderMessage(
        err.response?.data?.error ||
          "Order create nahi ho paaya."
      );
    } finally {
      setOrdering(false);
    }
  }

  return (
    <div className="premium-marketplace">

      {/* ================= HERO ================= */}

      <section className="market-hero">

        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        <div className="hero-content">

          <div className="hero-badge">
            <span>🌾</span>
            KISAN DIRECT
            <span className="badge-dot">●</span>
            LIVE MARKETPLACE
          </div>

          <h1>
            Fresh Crops.
            <br />
            <span>Direct From Farmers.</span>
          </h1>

          <p className="hero-description">
            A modern digital marketplace connecting farmers
            directly with buyers — transparent pricing,
            real-time availability and secure ordering.
          </p>

          <div className="hero-actions">

            <button
              className="hero-primary"
              onClick={() =>
                document
                  .getElementById("marketplace")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              🛒 Explore Marketplace
              <span>→</span>
            </button>

            <button
              className="hero-secondary"
              onClick={() =>
                navigate("/my-orders")
              }
            >
              📦 Track My Orders
              <span>→</span>
            </button>

          </div>

          <div className="hero-points">
            <span>✓ Direct farmer pricing</span>
            <span>✓ No middlemen</span>
            <span>✓ Razorpay payments</span>
          </div>

        </div>

        {/* HERO VISUAL */}

        <div className="hero-visual">

          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>

          <div className="crop-orb">
            <span>🌾</span>
          </div>

          <div className="floating-card farmer-floating">

            <div className="floating-icon">
              👨‍🌾
            </div>

            <div>
              <strong>Direct Farmers</strong>
              <small>
                Verified marketplace sellers
              </small>
            </div>

          </div>

          <div className="floating-card price-floating">

            <div className="floating-icon">
              💰
            </div>

            <div>
              <strong>Fair Pricing</strong>
              <small>
                Transparent ₹ / Quintal
              </small>
            </div>

          </div>

          <div className="floating-card secure-floating">

            <div className="floating-icon">
              🔐
            </div>

            <div>
              <strong>Secure</strong>
              <small>
                Payments & Orders
              </small>
            </div>

          </div>

        </div>

      </section>

      {/* ================= STATS ================= */}

      <section className="stats-section">

        <div className="stat-card premium-stat">

          <div className="stat-icon">
            🌾
          </div>

          <div>
            <small>ACTIVE LISTINGS</small>

            <strong>
              {listings.length}
            </strong>

            <span>
              Live crops available
            </span>
          </div>

          <div className="stat-arrow">
            ↗
          </div>

        </div>

        <div className="stat-card premium-stat">

          <div className="stat-icon">
            📦
          </div>

          <div>
            <small>AVAILABLE STOCK</small>

            <strong>
              {totalStock.toLocaleString()}
              <em> QTL</em>
            </strong>

            <span>
              Across marketplace
            </span>
          </div>

          <div className="stat-arrow">
            ↗
          </div>

        </div>

        <div className="stat-card premium-stat">

          <div className="stat-icon">
            👨‍🌾
          </div>

          <div>
            <small>FARMERS</small>

            <strong>
              {farmers}
            </strong>

            <span>
              Direct sellers
            </span>
          </div>

          <div className="stat-arrow">
            ↗
          </div>

        </div>

        <div className="stat-card premium-stat">

          <div className="stat-icon">
            ₹
          </div>

          <div>
            <small>AVG. PRICE / QTL</small>

            <strong>
              ₹{averagePrice.toLocaleString()}
            </strong>

            <span>
              Current market average
            </span>
          </div>

          <div className="stat-arrow">
            ↗
          </div>

        </div>

      </section>

      {/* ================= MARKETPLACE ================= */}

      <section
        id="marketplace"
        className="marketplace-section"
      >

        <div className="section-heading">

          <div>

            <span className="section-eyebrow">
              DISCOVER
            </span>

            <h2>
              Find the right crop.
            </h2>

            <p>
              Compare live listings from verified farmers.
            </p>

          </div>

          <div className="result-counter">

            <strong>
              {filteredListings.length}
            </strong>

            <span>
              RESULTS
            </span>

          </div>

        </div>

        {/* FILTER BAR */}

        <div className="filter-panel">

          <div className="search-box">

            <span>🔎</span>

            <input
              type="text"
              placeholder="Search crops — Rice, Wheat, Potato..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="search-box">

            <span>📍</span>

            <input
              type="text"
              placeholder="Filter by city / location"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
            />

          </div>

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
          >
            <option value="newest">
              Sort: Newest
            </option>

            <option value="price-low">
              Price: Low → High
            </option>

            <option value="price-high">
              Price: High → Low
            </option>

            <option value="stock-high">
              Stock: High → Low
            </option>
          </select>

        </div>

        {/* ERROR */}

        {error && (
          <div className="error-box">
            ⚠️ {error}
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="loading-box">

            <div className="loading-spinner"></div>

            <p>
              Loading marketplace...
            </p>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredListings.length === 0 && (
            <div className="empty-box">

              <span>🌾</span>

              <h3>
                No crops found
              </h3>

              <p>
                Search/filter change karke
                dobara try karo.
              </p>

            </div>
          )}

        {/* CROP CARDS */}

        <div className="crop-grid">

          {!loading &&
            filteredListings.map((listing) => {

              const stock =
                Number(listing.quantity) || 0;

              const stockLevel =
                stock >= 100
                  ? "HIGH STOCK"
                  : stock >= 30
                  ? "IN STOCK"
                  : "LIMITED";

              return (

                <article
                  className="crop-card premium-crop-card"
                  key={listing.id}
                >

                  {/* IMAGE */}

                  <div className="crop-image">

                    <div className="crop-pattern"></div>

                    <div className="crop-status">
                      <span>●</span>
                      ACTIVE
                    </div>

                    {listing.photoUrl ? (
                      <img
                        src={listing.photoUrl}
                        alt={listing.cropName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          position: "absolute",
                          inset: 0,
                        }}
                      />
                    ) : (
                      <div className="crop-symbol">
                        🌾
                      </div>
                    )}

                    <div className="crop-image-label">
                      FARM FRESH
                    </div>

                  </div>

                  {/* BODY */}

                  <div className="crop-body">

                    <div className="crop-title-row">

                      <div>

                        <span className="crop-category">
                          PREMIUM PRODUCE
                        </span>

                        <h3>
                          {listing.cropName}
                        </h3>

                      </div>

                      <span
                        className={`stock-badge ${
                          stock >= 100
                            ? "high"
                            : stock >= 30
                            ? "medium"
                            : "low"
                        }`}
                      >
                        {stockLevel}
                      </span>

                    </div>

                    <div className="crop-location">
                      📍 {listing.location}
                    </div>

                    {/* PRICE / STOCK */}

                    <div className="crop-metrics">

                      <div>

                        <small>
                          AVAILABLE
                        </small>

                        <strong>
                          {listing.quantity}
                          <em> QTL</em>
                        </strong>

                      </div>

                      <div>

                        <small>
                          PRICE / QTL
                        </small>

                        <strong className="price">
                          ₹
                          {Number(
                            listing.pricePerQuintal
                          ).toLocaleString()}
                        </strong>

                      </div>

                    </div>

                    {/* FARMER */}

                    <div className="farmer-row">

                      <div className="farmer-avatar">
                        👨‍🌾
                      </div>

                      <div>

                        <strong>
                          {listing.farmer?.name ||
                            "Verified Farmer"}
                        </strong>

                        <span>
                          Direct farmer
                          {listing.farmer?.phone
                            ? ` • ${listing.farmer.phone}`
                            : ""}
                        </span>

                      </div>

                      <div className="verified">
                        ✓
                      </div>

                    </div>

                    {/* ORDER BUTTON */}

                    <button
                      className="order-button"
                      onClick={() =>
                        openOrder(listing)
                      }
                    >
                      🛒 Order Now
                      <span>→</span>
                    </button>

                  </div>

                </article>

              );
            })}

        </div>

      </section>

      {/* ================= WHY KISAN DIRECT ================= */}

      <section className="why-section">

        <div className="why-heading">

          <span>
            WHY KISAN DIRECT
          </span>

          <h2>
            Built for a fairer
            <br />
            agricultural marketplace.
          </h2>

        </div>

        <div className="why-grid">

          <div className="why-card">

            <div>🌱</div>

            <h3>
              Direct From Farmers
            </h3>

            <p>
              Buyers connect directly with
              crop sellers without unnecessary
              middlemen.
            </p>

          </div>

          <div className="why-card">

            <div>💎</div>

            <h3>
              Transparent Pricing
            </h3>

            <p>
              Clear price per quintal so buyers
              know exactly what they are paying.
            </p>

          </div>

          <div className="why-card">

            <div>🔐</div>

            <h3>
              Secure Payments
            </h3>

            <p>
              Integrated Razorpay payment flow
              for safer digital transactions.
            </p>

          </div>

          <div className="why-card">

            <div>📦</div>

            <h3>
              Order Tracking
            </h3>

            <p>
              Track order status from confirmation
              to delivery in one place.
            </p>

          </div>

        </div>

      </section>

      {/* ================= ORDER MODAL ================= */}

      {selectedListing && (

        <div
          className="order-overlay"
          onClick={closeOrder}
        >

          <div
            className="order-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={closeOrder}
            >
              ×
            </button>

            <div className="modal-top">

              <div className="modal-crop-icon">
                🌾
              </div>

              <div>

                <span>
                  DIRECT FARMER ORDER
                </span>

                <h2>
                  {selectedListing.cropName}
                </h2>

              </div>

            </div>

            <div className="modal-details">

              <div>

                <small>
                  LOCATION
                </small>

                <strong>
                  📍 {selectedListing.location}
                </strong>

              </div>

              <div>

                <small>
                  AVAILABLE
                </small>

                <strong>
                  {selectedListing.quantity} QTL
                </strong>

              </div>

              <div>

                <small>
                  PRICE
                </small>

                <strong>
                  ₹
                  {Number(
                    selectedListing.pricePerQuintal
                  ).toLocaleString()}
                  /QTL
                </strong>

              </div>

            </div>

            <label className="quantity-label">

              ENTER QUANTITY

              <span>
                Max {selectedListing.quantity} QTL
              </span>

            </label>

            <input
              className="quantity-input"
              type="number"
              min="1"
              max={selectedListing.quantity}
              placeholder="e.g. 5"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
            />

            {Number(quantity) > 0 && (

              <div className="total-preview">

                <span>
                  Estimated Total
                </span>

                <strong>
                  ₹
                  {(
                    Number(quantity) *
                    Number(
                      selectedListing.pricePerQuintal
                    )
                  ).toLocaleString()}
                </strong>

              </div>

            )}

            {orderMessage && (

              <div className="order-message">
                {orderMessage}
              </div>

            )}

            <div className="modal-actions">

              <button
                className="cancel-order"
                onClick={closeOrder}
                disabled={ordering}
              >
                Cancel
              </button>

              <button
                className="confirm-order"
                onClick={placeOrder}
                disabled={ordering}
              >
                {ordering
                  ? "Creating Order..."
                  : "Confirm Order →"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Listings;