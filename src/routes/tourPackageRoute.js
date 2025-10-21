// ===== ROUTES =====
// routes/tourPackageRoutes.js
import express from "express";
import tourPackageController from "../controllers/tourPackageController.js";
import createUploader from "../middlewares/upload.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants/string.js";

const router = express.Router();

// Create tour package with cover photo upload
router.post(
  "/",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN),
  //   tourPackageUpload.single("coverPhoto"),
  createUploader("tourpackage").single("coverPhoto"),
  tourPackageController.createTourPackage
);

// Get all tour packages with pagination and filters
router.get(
  "/",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.STAFF),
  tourPackageController.getAllTourPackages
);

// Get tour package statistics
router.get(
  "/stats",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN),
  tourPackageController.getTourPackageStats
);

// Get tour package by ID
router.get("/:id", authMiddleware, tourPackageController.getTourPackageById);

// Update tour package with optional cover photo upload
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN),
  createUploader("tourpackage").single("coverPhoto"),
  tourPackageController.updateTourPackage
);

// Delete tour package
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN),
  tourPackageController.deleteTourPackage
);

// Download cover photo
router.get(
  "/:id/cover-photo",
  authMiddleware,
  tourPackageController.downloadCoverPhoto
);

// Bulk delete tour packages
router.post(
  "/bulk-delete",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN),
  tourPackageController.bulkDeleteTourPackages
);

export default router;
