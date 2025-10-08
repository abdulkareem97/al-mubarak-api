// File: src/routes/tourMemberRoutes.js
import express from "express";
import tourMemberController from "../controllers/tourMemberController.js";

const router = express.Router();

// Tour Member Routes
router.get("/", tourMemberController.getAllTourMembers);
// router.get("/stats", tourMemberController.getTourMemberStats);

router.get("/stats", tourMemberController.getTourMemberStatsByTourId);
router.get("/:id", tourMemberController.getTourMemberById);
router.post("/", tourMemberController.createTourMember);
router.put("/:id", tourMemberController.updateTourMember);
router.delete("/:id", tourMemberController.deleteTourMember);

// Payment Routes for Tour Members
router.post("/:tourMemberId/payments", tourMemberController.addPayment);
router.put(
  "/:tourMemberId/payments/:paymentId",
  tourMemberController.updatePayment
);
router.delete(
  "/:tourMemberId/payments/:paymentId",
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
