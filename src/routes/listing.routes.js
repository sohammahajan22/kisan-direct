const express = require("express");

const router = express.Router();

const {
  createListing,
  getAllListings,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
} = require("../controllers/listing.controller");

const {
  authMiddleware,
  requireRole,
} = require("../middleware/auth.middleware");


// =====================================================
// GET ALL LISTINGS
// GET /api/listings
// =====================================================
router.get("/", getAllListings);


// =====================================================
// GET MY LISTINGS
// GET /api/listings/my
// Sirf FARMER
// =====================================================
router.get(
  "/my",
  authMiddleware,
  requireRole("FARMER"),
  getMyListings
);


// =====================================================
// GET SINGLE LISTING
// GET /api/listings/:id
// =====================================================
router.get(
  "/:id",
  getListingById
);


// =====================================================
// CREATE LISTING
// POST /api/listings
// Sirf FARMER
// =====================================================
router.post(
  "/",
  authMiddleware,
  requireRole("FARMER"),
  createListing
);


// =====================================================
// UPDATE LISTING
// PUT /api/listings/:id
// Sirf FARMER + apni listing
// =====================================================
router.put(
  "/:id",
  authMiddleware,
  requireRole("FARMER"),
  updateListing
);


// =====================================================
// DELETE LISTING
// DELETE /api/listings/:id
// Sirf FARMER + apni listing
// =====================================================
router.delete(
  "/:id",
  authMiddleware,
  requireRole("FARMER"),
  deleteListing
);


module.exports = router;