// controllers/paymentReminderController.js
import paymentReminderService from "../services/paymentReminderService.js";
import { successResponse, errorResponse } from "../utils/response.js";

class PaymentReminderController {
  // GET /api/tour-members/payment-reminders
  async getTourMembersWithReminders(req, res) {
    try {
      const filters = {
        search: req.query.search || "",
        tourPackageId: req.query.tourPackageId || "",
        paymentStatus: req.query.paymentStatus || "",
        paymentType: req.query.paymentType || "",
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
      };

      const tourMembers =
        await paymentReminderService.getTourMembersWithReminders(filters);

      return successResponse(
        res,
        200,
        "Payment reminders fetched successfully",
        tourMembers
      );
    } catch (error) {
      console.error("Error in getTourMembersWithReminders:", error);
      return errorResponse(
        res,
        500,
        error.message || "Failed to fetch payment reminders"
      );
    }
  }

  // GET /api/tour-packages
  async getTourPackages(req, res) {
    try {
      const tourPackages = await paymentReminderService.getTourPackages();

      return successResponse(
        res,
        200,
        "Tour packages fetched successfully",
        tourPackages
      );
    } catch (error) {
      console.error("Error in getTourPackages:", error);
      return errorResponse(
        res,
        500,
        error.message || "Failed to fetch tour packages"
      );
    }
  }

  // POST /api/sms/bulk
  async sendBulkSMS(req, res) {
    try {
      const { memberIds, message, scheduleDate } = req.body;

      // Validate input
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return errorResponse(res, 400, "Member IDs are required");
      }

      if (!message || typeof message !== "string" || !message.trim()) {
        return errorResponse(res, 400, "Message is required");
      }

      const result = await paymentReminderService.sendBulkSMS({
        memberIds,
        message,
        scheduleDate,
      });

      return successResponse(res, 200, result.message, { count: result.count });
    } catch (error) {
      console.error("Error in sendBulkSMS:", error);
      return errorResponse(
        res,
        500,
        error.message || "Failed to send bulk SMS"
      );
    }
  }

  // POST /api/sms/individual
  async sendIndividualSMS(req, res) {
    try {
      const { memberId, message } = req.body;

      if (!memberId || !message) {
        return errorResponse(res, 400, "Member ID and message are required");
      }

      const result = await paymentReminderService.sendIndividualSMS({
        memberId,
        message,
      });

      return successResponse(res, 200, result.message);
    } catch (error) {
      console.error("Error in sendIndividualSMS:", error);
      return errorResponse(res, 500, error.message || "Failed to send SMS");
    }
  }

  // PATCH /api/tour-members/:id/reminder
  async updateReminderCount(req, res) {
    try {
      const { id: memberId } = req.params;

      if (!memberId) {
        return errorResponse(res, 400, "Member ID is required");
      }

      const result = await paymentReminderService.updateReminderCount(memberId);

      return successResponse(res, 200, result.message);
    } catch (error) {
      console.error("Error in updateReminderCount:", error);
      return errorResponse(
        res,
        500,
        error.message || "Failed to update reminder count"
      );
    }
  }
}

export default new PaymentReminderController();
