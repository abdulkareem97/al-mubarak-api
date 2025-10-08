// controllers/dashboardController.js

import dashboardService from "../services/dashboardService.js";
import { successResponse, errorResponse } from "../utils/response.js";

class DashboardController {
  /**
   * Get comprehensive dashboard overview
   * GET /api/dashboard/overview
   */
  async getDashboardOverview(req, res) {
    try {
      console.info("Fetching dashboard overview", { userId: req.user?.id });

      const dashboardData = await dashboardService.getDashboardOverview();

      console.info("Dashboard overview fetched successfully", {
        userId: req.user?.id,
        dataPoints: Object.keys(dashboardData).length,
      });

      return successResponse(
        res,
        200,
        "Dashboard overview retrieved successfully",
        dashboardData
      );
    } catch (error) {
      console.error("Error fetching dashboard overview", {
        error: error.message,
        userId: req.user?.id,
      });

      return errorResponse(
        res,
        500,
        "Failed to fetch dashboard overview",
        error.message
      );
    }
  }

  /**
   * Get recent bookings
   * GET /api/dashboard/recent-bookings
   */
  async getRecentBookings(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      console.info("Fetching recent bookings", {
        userId: req.user?.id,
        limit,
      });

      const recentBookings = await dashboardService.getRecentBookings(limit);

      console.info("Recent bookings fetched successfully", {
        userId: req.user?.id,
        count: recentBookings.length,
      });

      return successResponse(
        res,
        { bookings: recentBookings, total: recentBookings.length },
        "Recent bookings retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching recent bookings", {
        error: error.message,
        userId: req.user?.id,
      });

      return errorResponse(
        res,
        "Failed to fetch recent bookings",
        500,
        error.message
      );
    }
  }

  /**
   * Get revenue trends
   * GET /api/dashboard/revenue-trends
   */
  async getRevenueTrends(req, res) {
    try {
      const months = parseInt(req.query.months) || 6;

      if (months < 1 || months > 24) {
        return errorResponse(
          res,
          "Invalid months parameter. Must be between 1 and 24",
          400
        );
      }

      console.info("Fetching revenue trends", {
        userId: req.user?.id,
        months,
      });

      const revenueTrends = await dashboardService.getRevenueTrends(months);

      console.info("Revenue trends fetched successfully", {
        userId: req.user?.id,
        dataPoints: revenueTrends.length,
      });

      return successResponse(
        res,
        { trends: revenueTrends, period: `${months} months` },
        "Revenue trends retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching revenue trends", {
        error: error.message,
        userId: req.user?.id,
      });

      return errorResponse(
        res,
        "Failed to fetch revenue trends",
        500,
        error.message
      );
    }
  }

  /**
   * Get popular packages
   * GET /api/dashboard/popular-packages
   */
  async getPopularPackages(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;

      if (limit < 1 || limit > 20) {
        return errorResponse(
          res,
          "Invalid limit parameter. Must be between 1 and 20",
          400
        );
      }

      console.info("Fetching popular packages", {
        userId: req.user?.id,
        limit,
      });

      const popularPackages = await dashboardService.getPopularPackages(limit);

      console.info("Popular packages fetched successfully", {
        userId: req.user?.id,
        count: popularPackages.length,
      });

      return successResponse(
        res,
        { packages: popularPackages, total: popularPackages.length },
        "Popular packages retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching popular packages", {
        error: error.message,
        userId: req.user?.id,
      });

      return errorResponse(
        res,
        "Failed to fetch popular packages",
        500,
        error.message
      );
    }
  }

  /**
   * Get dashboard summary for mobile/quick view
   * GET /api/dashboard/summary
   */
  async getDashboardSummary(req, res) {
    try {
      console.info("Fetching dashboard summary", { userId: req.user?.id });

      // Get only essential metrics for quick loading
      const dashboardData = await dashboardService.getDashboardOverview();

      const summary = {
        totalRevenue: dashboardData.totalRevenue,
        monthlyRevenue: dashboardData.monthlyRevenue,
        totalBookings: dashboardData.totalBookings,
        monthlyBookings: dashboardData.monthlyBookings,
        pendingBookings: dashboardData.pendingBookings,
        availableSeats: dashboardData.availableSeats,
        recentGrowth: dashboardData.recentGrowth,
      };

      console.info("Dashboard summary fetched successfully", {
        userId: req.user?.id,
      });

      return successResponse(
        res,
        summary,
        "Dashboard summary retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching dashboard summary", {
        error: error.message,
        userId: req.user?.id,
      });

      return errorResponse(
        res,
        "Failed to fetch dashboard summary",
        500,
        error.message
      );
    }
  }

  /**
   * Get real-time dashboard updates
   * GET /api/dashboard/realtime
   */
  async getRealtimeUpdates(req, res) {
    try {
      const lastUpdated = req.query.lastUpdated
        ? new Date(req.query.lastUpdated)
        : null;

      console.info("Fetching realtime updates", {
        userId: req.user?.id,
        lastUpdated,
      });

      // Get recent updates since last check
      const updates = {
        timestamp: new Date(),
        hasUpdates: true, // You can implement logic to check if there are actual updates
        quickStats: {
          todayBookings: 0, // Implement today's booking count
          todayRevenue: 0, // Implement today's revenue
          pendingPayments: 0, // Implement pending payment count
        },
      };

      // If you want to implement actual change detection, you can compare with lastUpdated
      if (lastUpdated) {
        // Query for changes since lastUpdated timestamp
        // This is a placeholder - implement based on your needs
      }

      console.info("Realtime updates fetched successfully", {
        userId: req.user?.id,
      });

      return successResponse(
        res,
        updates,
        "Realtime updates retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching realtime updates", {
        error: error.message,
        userId: req.user?.id,
      });

      return errorResponse(
        res,
        "Failed to fetch realtime updates",
        500,
        error.message
      );
    }
  }
}

export default new DashboardController();
