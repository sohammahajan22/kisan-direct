import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (!token) {
    return null;
  }

  const isFarmer = user?.role === "FARMER";
  const isBuyer = user?.role === "BUYER";

  const navItem = (path) => ({
    textDecoration: "none",
    color: location.pathname === path ? "#15803d" : "#475569",
    background:
      location.pathname === path ? "#dcfce7" : "transparent",
    padding: "11px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  });

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid #e2e8e3",
        boxShadow: "0 5px 25px rgba(15,61,32,0.08)",
      }}
    >
      <div
        style={{
          width: "min(1180px, calc(100% - 40px))",
          minHeight: "78px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "25px",
        }}
      >
        {/* BRAND */}
        <Link
          to="/listings"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "15px",
              display: "grid",
              placeItems: "center",
              fontSize: "25px",
              background:
                "linear-gradient(145deg, #22c55e, #15803d)",
              boxShadow:
                "0 8px 22px rgba(22,163,74,0.25)",
            }}
          >
            🌾
          </div>

          <div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "850",
                letterSpacing: "-0.5px",
                color: "#0f3d20",
              }}
            >
              Kisan Direct
            </div>

            <div
              style={{
                marginTop: "2px",
                fontSize: "11px",
                fontWeight: "600",
                color: "#789080",
              }}
            >
              Farmer • Buyer Marketplace
            </div>
          </div>
        </Link>

        {/* NAVIGATION */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            flex: 1,
          }}
        >
          {/* MARKETPLACE - BOTH */}
          <Link
            to="/listings"
            style={navItem("/listings")}
          >
            🏪 Marketplace
          </Link>

          {/* MY ORDERS - BUYER ONLY */}
          {isBuyer && (
            <Link
              to="/my-orders"
              style={navItem("/my-orders")}
            >
              📦 My Orders
            </Link>
          )}

          {/* FARMER ORDERS - FARMER ONLY */}
          {isFarmer && (
            <Link
              to="/farmer-orders"
              style={navItem("/farmer-orders")}
            >
              🚜 Farmer Orders
            </Link>
          )}

          {/* FARMER DASHBOARD - FARMER ONLY */}
          {isFarmer && (
            <Link
              to="/farmer-dashboard"
              style={navItem("/farmer-dashboard")}
            >
              📊 Dashboard
            </Link>
          )}

          {/* PROFILE - BOTH */}
          <Link
            to="/profile"
            style={navItem("/profile")}
          >
            👤 Profile
          </Link>
        </div>

        {/* USER AREA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "800",
                color: "#17211b",
              }}
            >
              {user?.name || "User"}
            </div>

            <div
              style={{
                marginTop: "2px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#15803d",
              }}
            >
              {isFarmer ? "🌱 Farmer" : "🛒 Buyer"}
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              border: "none",
              padding: "11px 17px",
              borderRadius: "11px",
              background: "#17211b",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "750",
              cursor: "pointer",
              boxShadow:
                "0 5px 15px rgba(15,61,32,0.12)",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* MOBILE */}
      <style>
        {`
          @media (max-width: 1000px) {
            nav > div {
              width: calc(100% - 24px) !important;
              min-height: 70px !important;
              gap: 10px !important;
            }

            nav > div > div:nth-child(2) {
              gap: 2px !important;
            }

            nav > div > div:nth-child(2) a {
              padding: 8px 9px !important;
              font-size: 12px !important;
            }

            nav > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) {
              display: none;
            }

            nav > div > div:nth-child(3) > div:first-child {
              display: none;
            }
          }

          @media (max-width: 700px) {
            nav > div {
              width: calc(100% - 20px) !important;
            }

            nav > div > div:nth-child(2) {
              display: none !important;
            }
          }
        `}
      </style>
    </nav>
  );
}

export default Navbar;