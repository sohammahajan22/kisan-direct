import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function Signup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/auth/signup", {
        name,
        phone,
        email,
        password,
        role,
        location,
      });

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Signup mein kuch galat ho gaya."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
    background: "#f9fafb",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
        boxSizing: "border-box",
        background:
          "linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #ecfdf5 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "38px",
          boxSizing: "border-box",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.10)",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Branding */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 14px",
              borderRadius: "17px",
              background:
                "linear-gradient(135deg, #16a34a, #22c55e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              boxShadow:
                "0 10px 25px rgba(22, 163, 74, 0.25)",
            }}
          >
            🌾
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: "800",
              color: "#111827",
              letterSpacing: "-1px",
            }}
          >
            Join Kisan Direct
          </h1>

          <p
            style={{
              marginTop: "7px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Sell directly. Buy smarter. Grow together.
          </p>
        </div>

        <form onSubmit={handleSignup}>
          {/* Name */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Full Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              style={inputStyle}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Phone Number</label>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>
              Email{" "}
              <span
                style={{
                  color: "#9ca3af",
                  fontWeight: "400",
                }}
              >
                (optional)
              </span>
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              style={inputStyle}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Location</label>

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City / District"
              style={inputStyle}
            />
          </div>

          {/* Role */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              I want to join as
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                ...inputStyle,
                cursor: "pointer",
              }}
            >
              <option value="BUYER">
                🛒 Buyer
              </option>

              <option value="FARMER">
                🌾 Farmer
              </option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "11px 12px",
                marginBottom: "16px",
                borderRadius: "10px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {/* Signup */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "10px",
              background: loading
                ? "#86efac"
                : "linear-gradient(135deg, #16a34a, #15803d)",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              boxShadow:
                "0 8px 20px rgba(22, 163, 74, 0.25)",
            }}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <div
          style={{
            marginTop: "22px",
            paddingTop: "18px",
            borderTop: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Already have an account?
          </p>

          <Link
            to="/login"
            style={{
              display: "inline-block",
              marginTop: "7px",
              color: "#16a34a",
              fontSize: "14px",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Login to Kisan Direct →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;