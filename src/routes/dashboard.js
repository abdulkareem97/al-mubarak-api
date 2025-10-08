// routes/dashboard.js

import express from "express";
import dashboardController from "../controllers/dashboardController.js";
const router = express.Router();

// Dashboard overview route
router.get(
  "/overview",
  //  authenticate,
  dashboardController.getDashboardOverview
);

// Additional dashboard routes for future use
router.get("/recent-bookings", dashboardController.getRecentBookings);
router.get(
  "/revenue-trends",
  //   authenticate,
  dashboardController.getRevenueTrends
);
router.get(
  "/popular-packages",
  //   authenticate,
  dashboardController.getPopularPackages
);

export default router;
