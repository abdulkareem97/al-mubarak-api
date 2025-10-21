// services/paymentReminderService.js

import prisma from "../config/prisma.js";

class PaymentReminderService {
  // Get tour members with payment reminders based on filters
  async getTourMembersWithReminders(filters = {}) {
    try {
      const {
        search = "",
        tourPackageId = "",
        paymentStatus = "",
        paymentType = "",
        dateFrom,
        dateTo,
        createdById = "",
      } = filters;

      // Build where clause
      const whereClause = {
        paymentStatus: {
          not: "PAID", // Prisma equivalent of $ne
        },
      };

      if (createdById) {
        whereClause.createdById = createdById;
      }

      if (tourPackageId) {
        whereClause.tourPackageId = tourPackageId;
      }

      if (paymentStatus) {
        whereClause.paymentStatus = paymentStatus;
      }

      if (paymentType) {
        whereClause.paymentType = paymentType;
      }

      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
        if (dateTo) whereClause.createdAt.lte = new Date(dateTo);
      }

      if (search) {
        whereClause.OR = [
          {
            members: {
              some: { name: { contains: search } },
            },
          },
          {
            members: {
              some: { mobileNo: { contains: search } },
            },
          },
          { tourPackage: { packageName: { contains: search } } },
        ];
      }

      console.log("Fetching tour members with filters:", whereClause);

      const tourMembers = await prisma.tourMember.findMany({
        where: whereClause,
        include: {
          members: true,
          tourPackage: true,
          payments: true,
        },
        orderBy: [
          { paymentStatus: "desc" },
          { totalCost: "desc" },
          { createdAt: "desc" },
        ],
      });

      return tourMembers;
    } catch (error) {
      console.error("Error in getTourMembersWithReminders:", error);
      throw new Error("Failed to fetch payment reminders");
    }
  }

  // Get all tour packages for dropdown
  async getTourPackages() {
    try {
      console.log("Fetching tour packages");

      const tourPackages = await prisma.tourPackage.findMany({
        orderBy: {
          packageName: "asc",
        },
      });

      return tourPackages;
    } catch (error) {
      console.error("Error in getTourPackages:", error);
      throw new Error("Failed to fetch tour packages");
    }
  }

  // Send bulk SMS to multiple members
  async sendBulkSMS(data) {
    try {
      const { memberIds, message, scheduleDate } = data;

      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        throw new Error("Member IDs are required");
      }

      if (!message || typeof message !== "string" || !message.trim()) {
        throw new Error("Message is required");
      }

      console.log("Bulk SMS Request:", {
        memberIds,
        message,
        scheduleDate,
        timestamp: new Date().toISOString(),
      });

      const members = await prisma.tourMember.findMany({
        where: { id: { in: memberIds } },
        include: { members: true, tourPackage: true },
      });

      for (const member of members) {
        // Placeholder SMS sending
        await this.sendSMS({
          to: member.members[0]?.mobileNo,
          message: this.generateSmsMessage(message, member),
          scheduleDate,
        });

        await prisma.tourMember.update({
          where: { id: member.id },
          data: {
            reminderCount: { increment: 1 },
            lastReminder: new Date(),
            nextReminder:
              scheduleDate || this.calculateNextReminderDate(member),
          },
        });
      }

      return {
        success: true,
        message: "Bulk SMS sent successfully",
        count: memberIds.length,
      };
    } catch (error) {
      console.error("Error in sendBulkSMS:", error);
      throw error;
    }
  }

  // Send individual SMS
  async sendIndividualSMS(data) {
    try {
      const { memberId, message } = data;

      if (!memberId || !message) {
        throw new Error("Member ID and message are required");
      }

      console.log("Individual SMS Request:", {
        memberId,
        message,
        timestamp: new Date().toISOString(),
      });

      const member = await prisma.tourMember.findUnique({
        where: { id: memberId },
        include: { members: true, tourPackage: true },
      });

      if (!member) throw new Error("Member not found");

      await this.sendSMS({
        to: member.members[0]?.mobileNo,
        message: this.generateSmsMessage(message, member),
      });

      await prisma.tourMember.update({
        where: { id: memberId },
        data: {
          reminderCount: { increment: 1 },
          lastReminder: new Date(),
        },
      });

      return {
        success: true,
        message: "SMS sent successfully",
      };
    } catch (error) {
      console.error("Error in sendIndividualSMS:", error);
      throw error;
    }
  }

  async updateReminderCount(memberId) {
    try {
      console.log("Updating reminder count for member:", memberId);

      const updated = await prisma.tourMember.update({
        where: { id: memberId },
        data: {
          reminderCount: { increment: 1 },
          lastReminder: new Date(),
        },
      });

      if (!updated) throw new Error("Member not found");

      return {
        success: true,
        message: "Reminder count updated",
      };
    } catch (error) {
      console.error("Error in updateReminderCount:", error);
      throw error;
    }
  }

  // Helpers
  async sendSMS({ to, message, scheduleDate }) {
    console.log("Sending SMS:", { to, message, scheduleDate });
  }

  generateSmsMessage(template, member) {
    return template.replace(/{{([^}]+)}}/g, (match, key) => {
      return member[key] || match;
    });
  }

  calculateNextReminderDate() {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7);
    return nextDate;
  }
}

export default new PaymentReminderService();
