import express from "express";
import memberController from "../controllers/member.controller.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import createUploader from "../middlewares/upload.js";
import { USER_ROLES } from "../constants/string.js";
const router = express.Router();

// Create member with document upload
router.post(
  "/",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.STAFF),
  createUploader("member").array("document", 10),
  memberController.createMember
);

// Get all members with pagination and filters
router.get(
  "/",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.STAFF),
  memberController.getAllMembers
);

// Get member by ID
router.get("/:id", authMiddleware, memberController.getMemberById);

// Update member with optional document upload
router.put(
  "/:id",
  authMiddleware,
  createUploader("member").array("document", 10),
  memberController.updateMember
);

// Delete member
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN),
  memberController.deleteMember
);

// Get members by user ID
router.get(
  "/user/:userid",
  authMiddleware,

  memberController.getMembersByUserId
);

// Download document
router.get(
  "/:id/documents/:filename",
  authMiddleware,
  memberController.downloadDocument
);

export default router;
