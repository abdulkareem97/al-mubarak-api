// ===== TOUR PACKAGE SERVICE =====
// services/tourPackageService.js
import nodePath from "path";
import { __dirname } from "../middlewares/upload.js";
import prisma from "../config/prisma.js";
class TourPackageService {
  // Create new tour package
  async createTourPackage(packageData, file, createdBy) {
    try {
      // Process cover photo if provided
      let coverPhotoPath = "";
      if (file) {
        coverPhotoPath = file.path;
      }

      const tourPackage = await prisma.tourPackage.create({
        data: {
          ...packageData,
          coverPhoto: nodePath
            .relative(nodePath.join(__dirname, ".."), coverPhotoPath)
            .replace(/\\/g, "/"),
          tourPrice: parseFloat(packageData.tourPrice),
          totalSeat: parseInt(packageData.totalSeat),
          createdById: createdBy.userId,
        },
      });

      return tourPackage;
    } catch (error) {
      throw new Error(`Error creating tour package: ${error.message}`);
    }
  }

  // Get all tour packages with pagination
  async getAllTourPackages(page = 1, limit = 10, filters = {}, options = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (filters.packageName) {
        where.packageName = {
          contains: filters.packageName,
        };
      }
      if (filters.minPrice) {
        where.tourPrice = {
          ...where.tourPrice,
          gte: parseFloat(filters.minPrice),
        };
      }
      if (filters.maxPrice) {
        where.tourPrice = {
          ...where.tourPrice,
          lte: parseFloat(filters.maxPrice),
        };
      }
      if (filters.minSeats) {
        where.totalSeat = {
          ...where.totalSeat,
          gte: parseInt(filters.minSeats),
        };
      }
      if (filters.maxSeats) {
        where.totalSeat = {
          ...where.totalSeat,
          lte: parseInt(filters.maxSeats),
        };
      }

      // Build orderBy
      const orderBy = {};
      const sortBy = options.sortBy || "createdAt";
      const sortOrder = options.sortOrder || "desc";
      orderBy[sortBy] = sortOrder;
      const [tourPackages, total] = await Promise.all([
        prisma.tourPackage.findMany({
          where,
          include: {
            createdBy: {
              select: { id: true, email: true, name: true },
            },
          },
          skip,
          take: Number(limit),
          orderBy,
        }),
        prisma.tourPackage.count({ where }),
      ]);

      return {
        packages: tourPackages,
        total,
        pageSize: Number(limit),
      };
    } catch (error) {
      throw new Error(`Error fetching tour packages: ${error.message}`);
    }
  }

  // Get tour package by ID
  async getTourPackageById(id) {
    try {
      const tourPackage = await prisma.tourPackage.findUnique({
        where: { id },
      });

      if (!tourPackage) {
        throw new Error("Tour package not found");
      }

      return tourPackage;
    } catch (error) {
      throw new Error(`Error fetching tour package: ${error.message}`);
    }
  }

  // Update tour package
  async updateTourPackage(id, updateData, file, createdBy) {
    try {
      const existingPackage = await prisma.tourPackage.findUnique({
        where: { id },
      });

      if (!existingPackage) {
        throw new Error("Tour package not found");
      }

      let coverPhotoPath = updateData.coverPhoto || existingPackage.coverPhoto;

      // Handle cover photo updates
      if (file) {
        coverPhotoPath = nodePath
          .relative(nodePath.join(__dirname, ".."), file.path)
          .replace(/\\/g, "/");
      }

      // Prepare update data
      const dataToUpdate = {
        ...updateData,
        coverPhoto: coverPhotoPath,
        createdById: createdBy.userId,
      };

      // Convert numeric fields if provided
      if (updateData.tourPrice) {
        dataToUpdate.tourPrice = parseFloat(updateData.tourPrice);
      }
      if (updateData.totalSeat) {
        dataToUpdate.totalSeat = parseInt(updateData.totalSeat);
      }

      const tourPackage = await prisma.tourPackage.update({
        where: { id },
        data: dataToUpdate,
      });

      return tourPackage;
    } catch (error) {
      throw new Error(`Error updating tour package: ${error.message}`);
    }
  }

  // Delete tour package
  async deleteTourPackage(id) {
    try {
      const tourPackage = await prisma.tourPackage.findUnique({
        where: { id },
      });

      if (!tourPackage) {
        throw new Error("Tour package not found");
      }

      await prisma.tourPackage.delete({
        where: { id },
      });

      return { message: "Tour package deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting tour package: ${error.message}`);
    }
  }

  // Get tour package statistics
  async getTourPackageStats() {
    try {
      const [totalPackages, averagePrice, totalSeats, priceRange] =
        await Promise.all([
          prisma.tourPackage.count(),
          prisma.tourPackage.aggregate({
            _avg: { tourPrice: true },
          }),
          prisma.tourPackage.aggregate({
            _sum: { totalSeat: true },
          }),
          prisma.tourPackage.aggregate({
            _min: { tourPrice: true },
            _max: { tourPrice: true },
          }),
        ]);

      return {
        totalPackages,
        averagePrice: averagePrice._avg.tourPrice || 0,
        totalSeats: totalSeats._sum.totalSeat || 0,
        priceRange: {
          min: priceRange._min.tourPrice || 0,
          max: priceRange._max.tourPrice || 0,
        },
      };
    } catch (error) {
      throw new Error(
        `Error fetching tour package statistics: ${error.message}`
      );
    }
  }

  // Bulk delete tour packages
  async bulkDeleteTourPackages(packageIds) {
    try {
      const result = await prisma.tourPackage.deleteMany({
        where: {
          id: {
            in: packageIds,
          },
        },
      });

      return {
        deletedCount: result.count,
        message: `Successfully deleted ${result.count} tour package(s)`,
      };
    } catch (error) {
      throw new Error(`Error bulk deleting tour packages: ${error.message}`);
    }
  }
}

export default new TourPackageService();
