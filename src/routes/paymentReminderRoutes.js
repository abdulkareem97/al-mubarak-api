// routes/paymentReminderRoutes.js
import express from "express";
import paymentReminderController from "../controllers/paymentReminderController.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants/string.js";

const router = express.Router();

router.use(authMiddleware, authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.STAFF));

// GET /api/tour-members/payment-reminders - Get tour members with payment reminders
router.get(
  "/tour-members/payment-reminders",

  paymentReminderController.getTourMembersWithReminders
);

// GET /api/tour-packages - Get all tour packages for dropdown
router.get("/tour-packages", paymentReminderController.getTourPackages);

// POST /api/sms/bulk - Send bulk SMS to multiple members
router.post("/sms/bulk", paymentReminderController.sendBulkSMS);

// POST /api/sms/individual - Send individual SMS to a single member
router.post("/sms/individual", paymentReminderController.sendIndividualSMS);

// PATCH /api/tour-members/:id/reminder - Update reminder count for a member
router.patch(
  "/tour-members/:id/reminder",
  paymentReminderController.updateReminderCount
);

export default router;
