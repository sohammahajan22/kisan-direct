import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Listings from "./pages/Listings";
import MyOrders from "./pages/MyOrders";
import FarmerOrders from "./pages/FarmerOrders";
import FarmerDashboard from "./pages/FarmerDashboard";
import Profile from "./pages/Profile";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      {localStorage.getItem("token") && <Navbar />}

      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* MARKETPLACE - BOTH BUYER & FARMER */}
        <Route
          path="/listings"
          element={
            <ProtectedRoute allowedRoles={["BUYER", "FARMER"]}>
              <Listings />
            </ProtectedRoute>
          }
        />

        {/* BUYER ONLY */}
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute allowedRoles={["BUYER"]}>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* FARMER ONLY */}
        <Route
          path="/farmer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["FARMER"]}>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />

        {/* FARMER ONLY */}
        <Route
          path="/farmer-orders"
          element={
            <ProtectedRoute allowedRoles={["FARMER"]}>
              <FarmerOrders />
            </ProtectedRoute>
          }
        />

        {/* PROFILE - BOTH BUYER & FARMER */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["BUYER", "FARMER"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* DEFAULT */}
        <Route
          path="/"
          element={<Navigate to="/listings" replace />}
        />

        {/* UNKNOWN URL */}
        <Route
          path="*"
          element={<Navigate to="/listings" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;