// services/dashboardService.js
import prisma from "../config/prisma.js";

class DashboardService {
  /**
   * Get comprehensive dashboard overview statistics
   */
  async getDashboardOverview() {
    try {
      // Get current date ranges for comparison
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Execute all queries in parallel for better performance
      const [
        packageStats,
        memberStats,
        bookingStats,
        paymentStats,
        revenueStats,
        seatStats,
        growthStats,
      ] = await Promise.all([
        this._getPackageStatistics(),
        this._getMemberStatistics(startOfMonth),
        this._getBookingStatistics(
          startOfMonth,
          startOfLastMonth,
          endOfLastMonth
        ),
        this._getPaymentStatistics(),
        this._getRevenueStatistics(
          startOfMonth,
          startOfLastMonth,
          endOfLastMonth
        ),
        this._getSeatStatistics(),
        this._getGrowthStatistics(
          startOfMonth,
          startOfLastMonth,
          endOfLastMonth
        ),
      ]);

      // Combine all statistics
      const dashboardData = {
        // Package Statistics
        totalPackages: packageStats.total,
        activePackages: packageStats.active,

        // Seat Statistics
        totalSeats: seatStats.total,
        occupiedSeats: seatStats.occupied,
        availableSeats: seatStats.available,

        // Financial Statistics
        totalRevenue: revenueStats.total,
        monthlyRevenue: revenueStats.monthly,
        pendingPayments: paymentStats.pendingAmount,
        avgPackagePrice: packageStats.avgPrice,

        // Member Statistics
        totalMembers: memberStats.total,

        // Booking Statistics
        totalBookings: bookingStats.total,
        monthlyBookings: bookingStats.monthly,

        // Payment Status Statistics
        paidBookings: paymentStats.paid,
        partialBookings: paymentStats.partial,
        pendingBookings: paymentStats.pending,
        failedBookings: paymentStats.failed,

        // Growth Statistics
        recentGrowth: growthStats,
      };

      return dashboardData;
    } catch (error) {
      throw new Error(`Dashboard service error: ${error.message}`);
    }
  }

  /**
   * Get package-related statistics
   */
  async _getPackageStatistics() {
    const [totalPackages, activePackages, avgPrice] = await Promise.all([
      prisma.tourPackage.count(),
      prisma.tourPackage.count({
        where: {
          TourMember: {
            some: {},
          },
        },
      }),
      prisma.tourPackage.aggregate({
        _avg: {
          tourPrice: true,
        },
      }),
    ]);

    return {
      total: totalPackages,
      active: activePackages,
      avgPrice: Math.round(avgPrice._avg.tourPrice || 0),
    };
  }

  /**
   * Get member-related statistics
   */
  async _getMemberStatistics(startOfMonth) {
    const [totalMembers, monthlyMembers] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
    ]);

    return {
      total: totalMembers,
      monthly: monthlyMembers,
    };
  }

  /**
   * Get booking-related statistics
   */
  async _getBookingStatistics(startOfMonth, startOfLastMonth, endOfLastMonth) {
    const [totalBookings, monthlyBookings, lastMonthBookings] =
      await Promise.all([
        prisma.tourMember.count(),
        prisma.tourMember.count({
          where: {
            createdAt: {
              gte: startOfMonth,
            },
          },
        }),
        prisma.tourMember.count({
          where: {
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
        }),
      ]);

    return {
      total: totalBookings,
      monthly: monthlyBookings,
      lastMonth: lastMonthBookings,
    };
  }

  /**
   * Get payment-related statistics
   */
  async _getPaymentStatistics() {
    const [paymentStatusCounts, pendingAmount] = await Promise.all([
      prisma.tourMember.groupBy({
        by: ["paymentStatus"],
        _count: {
          paymentStatus: true,
        },
      }),
      prisma.tourMember.aggregate({
        _sum: {
          totalCost: true,
        },
        where: {
          paymentStatus: {
            in: ["PENDING", "PARTIAL"],
          },
        },
      }),
    ]);

    // Initialize payment status counts
    const statusCounts = {
      PAID: 0,
      PARTIAL: 0,
      PENDING: 0,
      FAILED: 0,
    };

    // Map the results to our structure
    paymentStatusCounts.forEach((stat) => {
      statusCounts[stat.paymentStatus] = stat._count.paymentStatus;
    });

    return {
      ...statusCounts,
      paid: statusCounts.PAID,
      partial: statusCounts.PARTIAL,
      pending: statusCounts.PENDING,
      failed: statusCounts.FAILED,
      pendingAmount: pendingAmount._sum.totalCost || 0,
    };
  }

  /**
   * Get revenue-related statistics
   */
  async _getRevenueStatistics(startOfMonth, startOfLastMonth, endOfLastMonth) {
    const [totalRevenue, monthlyRevenue, lastMonthRevenue] = await Promise.all([
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: "PAID",
        },
      }),
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: "PAID",
          paymentDate: {
            gte: startOfMonth,
          },
        },
      }),
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: "PAID",
          paymentDate: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    return {
      total: totalRevenue._sum?.amount || 0,
      monthly: monthlyRevenue._sum?.amount || 0,
      lastMonth: lastMonthRevenue._sum?.amount || 0,
    };
  }

  /**
   * Get seat-related statistics
   */
  async _getSeatStatistics() {
    const [totalSeats, occupiedSeats] = await Promise.all([
      prisma.tourPackage.aggregate({
        _sum: {
          totalSeat: true,
        },
      }),
      prisma.tourMember.aggregate({
        _sum: {
          memberCount: true,
        },
      }),
    ]);

    const total = totalSeats._sum.totalSeat || 0;
    const occupied = occupiedSeats._sum.memberCount || 0;
    const available = total - occupied;

    return {
      total,
      occupied,
      available,
    };
  }

  /**
   * Get growth statistics comparing current month with previous month
   */
  async _getGrowthStatistics(startOfMonth, startOfLastMonth, endOfLastMonth) {
    const [
      monthlyPackages,
      lastMonthPackages,
      monthlyMembers,
      lastMonthMembers,
      monthlyBookings,
      lastMonthBookings,
      monthlyRevenue,
      lastMonthRevenue,
    ] = await Promise.all([
      // Current month data
      prisma.tourPackage.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.member.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.tourMember.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "PAID",
          paymentDate: { gte: startOfMonth },
        },
      }),

      // Last month data
      prisma.tourPackage.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      prisma.member.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      prisma.tourMember.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "PAID",
          paymentDate: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    // Calculate percentage growth
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      packages: calculateGrowth(monthlyPackages, lastMonthPackages),
      members: monthlyMembers, // Show absolute number for new members
      bookings: calculateGrowth(monthlyBookings, lastMonthBookings),
      revenue: calculateGrowth(
        monthlyRevenue._sum?.amount || 0,
        lastMonthRevenue._sum?.amount || 0
      ),
    };
  }

  /**
   * Get recent bookings for dashboard
   */
  async getRecentBookings(limit = 10) {
    try {
      const recentBookings = await prisma.tourMember.findMany({
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          tourPackage: {
            select: {
              packageName: true,
              tourPrice: true,
            },
          },
          members: {
            select: {
              name: true,
              mobileNo: true,
            },
          },
        },
      });

      return recentBookings.map((booking) => ({
        id: booking.id,
        packageName: booking.tourPackage.packageName,
        memberCount: booking.memberCount,
        totalCost: booking.totalCost,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,
        primaryMember: booking.members[0] || null,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch recent bookings: ${error.message}`);
    }
  }

  /**
   * Get revenue trends for charts
   */
  async getRevenueTrends(months = 6) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const revenueByMonth = await prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(p.paymentDate, '%Y-%m') as month,
          SUM(p?.amount) as revenue,
          COUNT(p.id) as transactions
        FROM Payment p
        WHERE p.status = 'PAID' 
          AND p.paymentDate >= ${startDate}
          AND p.paymentDate <= ${endDate}
        GROUP BY DATE_FORMAT(p.paymentDate, '%Y-%m')
        ORDER BY month ASC
      `;

      return revenueByMonth.map((row) => ({
        month: row.month,
        revenue: Number(row.revenue),
        transactions: Number(row.transactions),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch revenue trends: ${error.message}`);
    }
  }

  /**
   * Get popular packages
   */
  async getPopularPackages(limit = 5) {
    try {
      const popularPackages = await prisma.tourPackage.findMany({
        include: {
          _count: {
            select: {
              TourMember: true,
            },
          },
          TourMember: {
            select: {
              memberCount: true,
              totalCost: true,
            },
          },
        },
        orderBy: {
          TourMember: {
            _count: "desc",
          },
        },
        take: limit,
      });

      return popularPackages.map((pkg) => {
        const totalRevenue = pkg.TourMember.reduce(
          (sum, booking) => sum + booking.totalCost,
          0
        );
        const totalMembers = pkg.TourMember.reduce(
          (sum, booking) => sum + booking.memberCount,
          0
        );

        return {
          id: pkg.id,
          packageName: pkg.packageName,
          tourPrice: pkg.tourPrice,
          totalSeat: pkg.totalSeat,
          bookingCount: pkg._count.TourMember,
          totalRevenue,
          totalMembers,
          utilizationRate: Math.round((totalMembers / pkg.totalSeat) * 100),
        };
      });
    } catch (error) {
      throw new Error(`Failed to fetch popular packages: ${error.message}`);
    }
  }
}

export default new DashboardService();
