import express from "express";
import memberController from "../controllers/member.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import createUploader from "../middlewares/upload.js";
const router = express.Router();

// Create member with document upload
router.post(
  "/",
  authMiddleware,
  createUploader("member").array("document", 10),
  memberController.createMember
);

// Get all members with pagination and filters
router.get(
  "/",
  // authMiddleware, // Uncomment when auth middleware is available
  authMiddleware,
  memberController.getAllMembers
);

// Get member by ID
router.get(
  "/:id",
  authMiddleware, // Uncomment when auth middleware is available
  memberController.getMemberById
);

// Update member with optional document upload
router.put(
  "/:id",
  authMiddleware,
  createUploader("member").array("document", 10),
  memberController.updateMember
);

// Delete member
router.delete("/:id", authMiddleware, memberController.deleteMember);

// Get members by user ID
router.get(
  "/user/:userid",
  authMiddleware, // Uncomment when auth middleware is available
  memberController.getMembersByUserId
);

// Download document
router.get(
  "/:id/documents/:filename",
  authMiddleware, // Uncomment when auth middleware is available
  memberController.downloadDocument
);

export default router;
