// routes/enquiry.routes.js
import express from "express";

import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../controllers/enquiry.controller.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants/string.js";

const router = express.Router();

// All routes are protected with authentication
router.use(authMiddleware, authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.STAFF));

// Create new enquiry
router.post("/", createEnquiry);

// Get all enquiries with pagination
router.get("/", getAllEnquiries);

// Get single enquiry by ID
router.get("/:id", getEnquiryById);

// Update enquiry
router.put("/:id", updateEnquiry);

// Update enquiry status only
router.patch("/:id/status", updateEnquiryStatus);

// Delete enquiry
router.delete("/:id", authorizeRoles(USER_ROLES.ADMIN), deleteEnquiry);

export default router;
