// ===== ROUTES =====
// routes/tourPackageRoutes.js
import express from "express";
import tourPackageController from "../controllers/tourPackageController.js";
import createUploader from "../middlewares/upload.js";
// import authMiddleware from '../middleware/auth.js'; // Uncomment when available

const router = express.Router();

// Create tour package with cover photo upload
router.post(
  "/",
  // authMiddleware, // Uncomment when auth middleware is available
  //   tourPackageUpload.single("coverPhoto"),
  createUploader("tourpackage").single("coverPhoto"),
  tourPackageController.createTourPackage
);

// Get all tour packages with pagination and filters
router.get(
  "/",
  // authMiddleware, // Uncomment when auth middleware is available
  tourPackageController.getAllTourPackages
);

// Get tour package statistics
router.get(
  "/stats",
  // authMiddleware, // Uncomment when auth middleware is available
  tourPackageController.getTourPackageStats
);

// Get tour package by ID
router.get(
  "/:id",
  // authMiddleware, // Uncomment when auth middleware is available
  tourPackageController.getTourPackageById
);

// Update tour package with optional cover photo upload
router.put(
  "/:id",
  // authMiddleware, // Uncomment when auth middleware is available
  //   tourPackageUpload.single("coverPhoto"),
  createUploader("tourpackage").single("coverPhoto"),
  tourPackageController.updateTourPackage
);

// Delete tour package
router.delete(
  "/:id",
  // authMiddleware, // Uncomment when auth middleware is available
  tourPackageController.deleteTourPackage
);

// Download cover photo
router.get(
  "/:id/cover-photo",
  // authMiddleware, // Uncomment when auth middleware is available
  tourPackageController.downloadCoverPhoto
);

// Bulk delete tour packages
router.post(
  "/bulk-delete",
  // authMiddleware, // Uncomment when auth middleware is available
  tourPackageController.bulkDeleteTourPackages
);

export default router;
