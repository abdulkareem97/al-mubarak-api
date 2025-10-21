// File: src/routes/tourMemberRoutes.js
import express from "express";
import tourMemberController from "../controllers/tourMemberController.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants/string.js";

const router = express.Router();

router.use(authMiddleware);

// Tour Member Routes
router.get(
  "/",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.STAFF),
  tourMemberController.getAllTourMembers
);
// router.get("/stats", tourMemberController.getTourMemberStats);

router.get(
  "/stats",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN),
  tourMemberController.getTourMemberStatsByTourId
);
router.get("/:id", authMiddleware, tourMemberController.getTourMemberById);
router.post("/", authMiddleware, tourMemberController.createTourMember);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN),
  tourMemberController.updateTourMember
);
router.delete(
  "/:id",
  authorizeRoles(USER_ROLES.ADMIN),
  tourMemberController.deleteTourMember
);

// Payment Routes for Tour Members
router.post(
  "/:tourMemberId/payments",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.STAFF),
  tourMemberController.addPayment
);
router.put(
  "/:tourMemberId/payments/:paymentId",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN),
  tourMemberController.updatePayment
);
router.delete(
  "/:tourMemberId/payments/:paymentId",
  authMiddleware,
  authorizeRoles(USER_ROLES.ADMIN),
  tourMemberController.deletePayment
);

// Helper Routes (for dropdowns and form data)
router.get("/helpers/members", tourMemberController.getMembers);
router.get("/helpers/tour-packages", tourMemberController.getTourPackages);
router.get(
  "/helpers/tour-packages/:id",
  tourMemberController.getTourPackageById
);

export default router;
