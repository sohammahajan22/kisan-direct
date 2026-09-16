import React, { useEffect, useState } from "react";
import API from "../api/axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    gstNumber: "",
  });

  // ===== FETCH PROFILE =====
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/auth/me");

        const userData = response.data.user;

        setUser(userData);

        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          location: userData.location || "",
          gstNumber: userData.gstNumber || "",
        });
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ===== INPUT CHANGE =====
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ===== SAVE PROFILE =====
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const response = await API.put("/auth/profile", formData);

      const updatedUser = response.data.user;

      setUser(updatedUser);

      // Update localStorage user also
      const oldUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          ...updatedUser,
        })
      );

      setEditing(false);
      setMessage("✓ Profile successfully updated!");
    } catch (error) {
      console.error("Profile update error:", error);

      setMessage(
        error.response?.data?.error ||
          "Profile update nahi hua."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===== CANCEL EDIT =====
  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      location: user.location || "",
      gstNumber: user.gstNumber || "",
    });

    setEditing(false);
    setMessage("");
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.loading}>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.error}>
            Profile load nahi hua.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* AVATAR */}
        <div style={styles.avatar}>
          {user.name?.charAt(0).toUpperCase()}
        </div>

        {/* NAME */}
        <h1 style={styles.name}>{user.name}</h1>

        {/* ROLE */}
        <div style={styles.role}>
          {user.role === "FARMER"
            ? "🌾 Farmer"
            : "🛒 Buyer"}
        </div>

        {!editing ? (
          <>
            {/* PROFILE INFO */}
            <div style={styles.infoBox}>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>
                  📱 Phone
                </span>

                <strong style={styles.infoValue}>
                  {user.phone || "Not available"}
                </strong>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>
                  📧 Email
                </span>

                <strong style={styles.infoValue}>
                  {user.email || "Not added"}
                </strong>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>
                  📍 Location
                </span>

                <strong style={styles.infoValue}>
                  {user.location || "Not added"}
                </strong>
              </div>

              {user.role === "FARMER" && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>
                    🏢 GST Number
                  </span>

                  <strong style={styles.infoValue}>
                    {user.gstNumber || "Not added"}
                  </strong>
                </div>
              )}

            </div>

            {/* ACCOUNT STATUS */}
            <div style={styles.verified}>
              {user.isVerified
                ? "✓ Verified Account"
                : "• Account"}
            </div>

            {/* EDIT BUTTON */}
            <button
              onClick={() => {
                setEditing(true);
                setMessage("");
              }}
              style={styles.editButton}
            >
              ✏️ Edit Profile
            </button>
          </>
        ) : (
          <>
            {/* EDIT FORM */}
            <div style={styles.formBox}>

              {/* NAME */}
              <label style={styles.label}>
                FULL NAME
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter your name"
              />

              {/* EMAIL */}
              <label style={styles.label}>
                EMAIL
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter your email"
              />

              {/* LOCATION */}
              <label style={styles.label}>
                LOCATION
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g. Nashik, Maharashtra"
              />

              {/* GST - FARMER ONLY */}
              {user.role === "FARMER" && (
                <>
                  <label style={styles.label}>
                    GST NUMBER
                  </label>

                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Enter GST number"
                  />
                </>
              )}

            </div>

            {/* ACTION BUTTONS */}
            <div style={styles.buttonRow}>

              <button
                onClick={handleCancel}
                style={styles.cancelButton}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                style={styles.saveButton}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "✓ Save Changes"}
              </button>

            </div>
          </>
        )}

        {/* MESSAGE */}
        {message && (
          <div
            style={{
              ...styles.message,
              color: message.startsWith("✓")
                ? "#20d66b"
                : "#ffb4b4",
            }}
          >
            {message}
          </div>
        )}

      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "calc(100vh - 78px)",
    background:
      "linear-gradient(135deg, #002d20 0%, #003b29 50%, #00261b 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "50px 20px",
    color: "#f4fff9",
  },

  card: {
    width: "100%",
    maxWidth: "620px",
    background: "rgba(7,61,45,0.96)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "26px",
    padding: "48px",
    textAlign: "center",
    boxShadow:
      "0 25px 70px rgba(0,0,0,0.35)",
  },

  avatar: {
    width: "96px",
    height: "96px",
    margin: "0 auto 20px",
    borderRadius: "50%",
    background:
      "linear-gradient(145deg, #22e875, #16a34a)",
    color: "#00351f",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "40px",
    fontWeight: "800",
    boxShadow:
      "0 12px 30px rgba(32,214,107,0.25)",
  },

  name: {
    margin: "0",
    fontSize: "34px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  role: {
    marginTop: "10px",
    color: "#20d66b",
    fontSize: "16px",
    fontWeight: "700",
  },

  infoBox: {
    marginTop: "35px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  infoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "15px 18px",
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
  },

  infoLabel: {
    color: "#a8c4b5",
    fontSize: "14px",
    fontWeight: "600",
  },

  infoValue: {
    color: "#f4fff9",
    fontSize: "14px",
    fontWeight: "700",
    textAlign: "right",
    wordBreak: "break-word",
  },

  verified: {
    marginTop: "28px",
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(32,214,107,0.08)",
    color: "#20d66b",
    fontWeight: "700",
    fontSize: "14px",
  },

  editButton: {
    marginTop: "18px",
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #20d66b, #16a34a)",
    color: "#00351f",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
  },

  formBox: {
    marginTop: "32px",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },

  label: {
    marginTop: "8px",
    color: "#a8c4b5",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    outline: "none",
    background: "rgba(255,255,255,0.06)",
    color: "#f4fff9",
    fontSize: "14px",
    fontWeight: "600",
  },

  buttonRow: {
    marginTop: "24px",
    display: "flex",
    gap: "12px",
  },

  cancelButton: {
    flex: 1,
    padding: "14px",
    borderRadius: "12px",
    border:
      "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#d7e8df",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
  },

  saveButton: {
    flex: 1,
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #20d66b, #16a34a)",
    color: "#00351f",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
  },

  message: {
    marginTop: "18px",
    fontSize: "14px",
    fontWeight: "700",
  },

  loading: {
    color: "#20d66b",
    fontSize: "18px",
    fontWeight: "700",
  },

  error: {
    color: "#ffb4b4",
    fontSize: "18px",
    fontWeight: "700",
  },
};

export default Profile;