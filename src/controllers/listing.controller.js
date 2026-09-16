const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


// ===== CREATE LISTING =====
async function createListing(req, res) {
  try {
    const {
      cropName,
      quantity,
      pricePerQuintal,
      location,
      photoUrl
    } = req.body;

    if (!cropName || !quantity || !pricePerQuintal || !location) {
      return res.status(400).json({
        error: "Crop name, quantity, price aur location zaroori hain."
      });
    }

    const newListing = await prisma.listing.create({
      data: {
        farmerId: req.user.userId,
        cropName,
        quantity: parseFloat(quantity),
        pricePerQuintal: parseFloat(pricePerQuintal),
        location,
        photoUrl: photoUrl || null,
      },
    });

    res.status(201).json({
      message: "Listing successfully create ho gayi!",
      listing: newListing,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Listing banane mein error aaya."
    });
  }
}


// ===== GET ALL ACTIVE LISTINGS =====
async function getAllListings(req, res) {
  try {
    const {
      cropName,
      location,
      minPrice,
      maxPrice
    } = req.query;

    const filters = {
      status: "active"
    };

    if (cropName) {
      filters.cropName = {
        contains: cropName,
        mode: "insensitive"
      };
    }

    if (location) {
      filters.location = {
        contains: location,
        mode: "insensitive"
      };
    }

    if (minPrice || maxPrice) {
      filters.pricePerQuintal = {};

      if (minPrice) {
        filters.pricePerQuintal.gte = parseFloat(minPrice);
      }

      if (maxPrice) {
        filters.pricePerQuintal.lte = parseFloat(maxPrice);
      }
    }

    const listings = await prisma.listing.findMany({
      where: filters,

      include: {
        farmer: {
          select: {
            name: true,
            phone: true,
            location: true
          },
        },
      },

      orderBy: {
        createdAt: "desc"
      },
    });

    res.json({
      listings
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Listings fetch karne mein error aaya."
    });
  }
}


// ===== GET MY LISTINGS =====
async function getMyListings(req, res) {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        farmerId: req.user.userId
      },

      orderBy: {
        createdAt: "desc"
      },
    });

    res.json({
      listings
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Listings fetch karne mein error aaya."
    });
  }
}


// ===== GET SINGLE LISTING =====
async function getListingById(req, res) {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: {
        id: parseInt(id),
      },

      include: {
        farmer: {
          select: {
            name: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        error: "Listing nahi mili.",
      });
    }

    res.json({
      listing,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Listing fetch karne mein error aaya.",
    });
  }
}


// ===== UPDATE LISTING =====
async function updateListing(req, res) {
  try {
    const { id } = req.params;

    const {
      cropName,
      quantity,
      pricePerQuintal,
      location,
      photoUrl,
      status
    } = req.body;

    const listing = await prisma.listing.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!listing) {
      return res.status(404).json({
        error: "Listing nahi mili."
      });
    }

    if (listing.farmerId !== req.user.userId) {
      return res.status(403).json({
        error: "Aap sirf apni listing edit kar sakte hain."
      });
    }

    const updatedListing = await prisma.listing.update({
      where: {
        id: parseInt(id)
      },

      data: {
        cropName: cropName ?? listing.cropName,

        quantity: quantity
          ? parseFloat(quantity)
          : listing.quantity,

        pricePerQuintal: pricePerQuintal
          ? parseFloat(pricePerQuintal)
          : listing.pricePerQuintal,

        location: location ?? listing.location,

        photoUrl: photoUrl ?? listing.photoUrl,

        status: status ?? listing.status,
      },
    });

    res.json({
      message: "Listing update ho gayi!",
      listing: updatedListing
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Listing update karne mein error aaya."
    });
  }
}


// ===== DELETE LISTING =====
async function deleteListing(req, res) {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!listing) {
      return res.status(404).json({
        error: "Listing nahi mili."
      });
    }

    if (listing.farmerId !== req.user.userId) {
      return res.status(403).json({
        error: "Aap sirf apni listing delete kar sakte hain."
      });
    }

    await prisma.listing.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.json({
      message: "Listing delete ho gayi."
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Listing delete karne mein error aaya."
    });
  }
}


// ===== EXPORTS =====
module.exports = {
  createListing,
  getAllListings,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
};