// File: src/services/tourMemberService.js

import prisma from "../config/prisma.js";

class TourMemberService {
  // Get all tour members with pagination and filters
  async getAllTourMembers(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      paymentStatus,
      paymentType,
      search,
      tourPackageId,
      status,
    } = options;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    if (tourPackageId) {
      where.tourPackageId = tourPackageId;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (paymentType) {
      where.paymentType = paymentType;
    }
    if (status) {
      where.status = status;
    } else {
      where.status = "BOOKED";
    }
    if (search) {
      where.OR = [
        {
          tourPackage: {
            packageName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [tourMembers, total] = await Promise.all([
      prisma.tourMember.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          tourPackage: {
            select: {
              id: true,
              packageName: true,
              tourPrice: true,
              coverPhoto: true,
              desc: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payments: {
            orderBy: {
              createdAt: "desc",
            },
          },
          members: {
            select: {
              id: true,
              name: true,
              mobileNo: true,
              address: true,
              document: true,
              extra: true,
            },
          },
        },
      }),
      prisma.tourMember.count({ where }),
    ]);

    // console.log("tour members", tourMembers, where);

    return {
      data: tourMembers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: take,
      },
    };
  }

  // Get tour member by ID
  async getTourMemberById(id) {
    const tourMember = await prisma.tourMember.findUnique({
      where: { id },
      include: {
        tourPackage: {
          select: {
            id: true,
            packageName: true,
            tourPrice: true,
            coverPhoto: true,
            desc: true,
            totalSeat: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            mobileNo: true,
            address: true,
            document: true,
            extra: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!tourMember) {
      throw new Error("Tour member not found");
    }

    return tourMember;
  }

  // Create new tour member
  async createTourMember(data, createdBy) {
    const {
      memberIds,
      tourPackageId,
      packagePrice,
      memberCount,
      netCost,
      discount = 0,
      totalCost,
      paymentType,
      nextReminder,
      status,
      extra,
    } = data;

    // Validate that all members exist
    const members = await prisma.member.findMany({
      where: {
        id: {
          in: memberIds,
        },
      },
    });

    if (members.length !== memberIds.length) {
      throw new Error("Some members not found");
    }

    // Validate tour package exists
    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id: tourPackageId },
    });

    if (!tourPackage) {
      throw new Error("Tour package not found");
    }

    // Create tour member
    const tourMember = await prisma.tourMember.create({
      data: {
        memberIds: JSON.stringify(memberIds),
        tourPackageId,
        packagePrice,
        memberCount,
        netCost,
        discount,
        totalCost,
        paymentType,
        paymentStatus: "PENDING",
        nextReminder: nextReminder ? new Date(nextReminder) : null,
        extra: extra || null,
        status,
        createdById: createdBy.userId,
      },
      include: {
        tourPackage: {
          select: {
            id: true,
            packageName: true,
            tourPrice: true,
            coverPhoto: true,
            desc: true,
          },
        },

        payments: true,
        members: {
          select: {
            id: true,
            name: true,
            mobileNo: true,
            address: true,
            document: true,
            extra: true,
          },
        },
      },
    });

    // Connect members to tour member
    await prisma.tourMember.update({
      where: { id: tourMember.id },
      data: {
        members: {
          connect: memberIds.map((id) => ({ id })),
        },
      },
    });

    return this.getTourMemberById(tourMember.id);
  }

  // Update tour member
  async updateTourMember(id, data, createdBy) {
    const existingTourMember = await prisma.tourMember.findUnique({
      where: { id },
    });

    if (!existingTourMember) {
      throw new Error("Tour member not found");
    }

    const updateData = { ...data, createdById: createdBy.userId };

    // Handle memberIds update
    if (data.memberIds) {
      // Validate that all members exist
      const members = await prisma.member.findMany({
        where: {
          id: {
            in: data.memberIds,
          },
        },
      });

      if (members.length !== data.memberIds.length) {
        throw new Error("Some members not found");
      }

      updateData.memberIds = JSON.stringify(data.memberIds);
    }

    // Handle date fields
    if (data.nextReminder) {
      updateData.nextReminder = new Date(data.nextReminder);
    }
    if (data.lastReminder) {
      updateData.lastReminder = new Date(data.lastReminder);
    }

    const updatedTourMember = await prisma.tourMember.update({
      where: { id },
      data: updateData,
    });

    // Update member connections if memberIds changed
    if (data.memberIds) {
      await prisma.tourMember.update({
        where: { id },
        data: {
          members: {
            set: [], // Clear existing connections
            connect: data.memberIds.map((memberId) => ({ id: memberId })),
          },
        },
      });
    }

    return this.getTourMemberById(id);
  }

  // Delete tour member
  async deleteTourMember(id) {
    const existingTourMember = await prisma.tourMember.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!existingTourMember) {
      throw new Error("Tour member not found");
    }

    // Delete tour member (payments will be cascade deleted)
    await prisma.tourMember.delete({
      where: { id },
    });

    return { message: "Tour member deleted successfully" };
  }

  // Add payment to tour member
  async addPayment(tourMemberId, paymentData, createdBy) {
    const tourMember = await prisma.tourMember.findUnique({
      where: { id: tourMemberId },
      include: {
        payments: true,
      },
    });

    if (!tourMember) {
      throw new Error("Tour member not found");
    }

    const payment = await prisma.payment.create({
      data: {
        tourMemberId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        note: paymentData.note,
        status: paymentData.status || "PAID",
        createdById: createdBy.userId,
      },
    });

    // Update tour member payment status
    await this.updatePaymentStatus(tourMemberId);

    return payment;
  }

  // Update payment
  async updatePayment(tourMemberId, paymentId, paymentData, createdBy) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        tourMemberId,
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { ...paymentData, createdById: createdBy.userId },
    });

    // Update tour member payment status
    await this.updatePaymentStatus(tourMemberId);

    return updatedPayment;
  }

  // Delete payment
  async deletePayment(tourMemberId, paymentId) {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        tourMemberId,
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    await prisma.payment.delete({
      where: { id: paymentId },
    });

    // Update tour member payment status
    await this.updatePaymentStatus(tourMemberId);

    return { message: "Payment deleted successfully" };
  }

  // Update payment status based on payments
  async updatePaymentStatus(tourMemberId) {
    const tourMember = await prisma.tourMember.findUnique({
      where: { id: tourMemberId },
      include: {
        payments: {
          where: {
            status: "PAID",
          },
        },
      },
    });

    if (!tourMember) {
      throw new Error("Tour member not found");
    }

    const totalPaid = tourMember.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const totalCost = tourMember.totalCost;

    let paymentStatus = "PENDING";
    if (totalPaid >= totalCost) {
      paymentStatus = "PAID";
    } else if (totalPaid > 0) {
      paymentStatus = "PARTIAL";
    }

    await prisma.tourMember.update({
      where: { id: tourMemberId },
      data: { paymentStatus },
    });

    return paymentStatus;
  }

  // Get tour member statistics
  async getTourMemberStats() {
    const [
      totalBookings,
      pendingPayments,
      partialPayments,
      paidBookings,
      totalRevenue,
    ] = await Promise.all([
      prisma.tourMember.count(),
      prisma.tourMember.count({
        where: { paymentStatus: "PENDING", status: "BOOKED" },
      }),
      prisma.tourMember.count({
        where: { paymentStatus: "PARTIAL", status: "BOOKED" },
      }),
      prisma.tourMember.count({
        where: { paymentStatus: "PAID", status: "BOOKED" },
      }),
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalBookings,
      pendingPayments,
      partialPayments,
      paidBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }

  async getTourMemberStatsByTourId(tourId) {
    const whereClause = tourId
      ? { tourId, status: "BOOKED" }
      : { status: "BOOKED" };

    const [
      totalBookings,
      pendingPayments,
      partialPayments,
      paidBookings,
      totalRevenue,
      totalActiveTours,
    ] = await Promise.all([
      prisma.tourMember.count({ where: whereClause }),
      prisma.tourMember.count({
        where: { ...whereClause, paymentStatus: "PENDING" },
      }),
      prisma.tourMember.count({
        where: { ...whereClause, paymentStatus: "PARTIAL" },
      }),
      prisma.tourMember.count({
        where: { ...whereClause, paymentStatus: "PAID" },
      }),
      prisma.payment.aggregate({
        where: { tourMember: { ...whereClause } },
        _sum: { amount: true },
      }),
      prisma.tourPackage.count({ where: tourId ? { id: tourId } : {} }),
    ]);

    console.log("totalActiveTours", totalActiveTours);
    return {
      tourId,
      totalBookings,
      pendingPayments,
      partialPayments,
      paidBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalActiveTours,
    };
  }
}

export default new TourMemberService();
