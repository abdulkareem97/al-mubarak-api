// ===== TOUR PACKAGE CONTROLLER =====
// controllers/tourPackageController.js
import tourPackageService from "../services/tourPackageService.js";
import {
  tourPackageCreateSchema,
  tourPackageUpdateSchema,
} from "../validations/tourPackageVaalidation.js";
import { successResponse, errorResponse } from "../utils/response.js";
import fs, { promises as fsp } from "fs";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to clean up uploaded files
const cleanupFile = async (file) => {
  if (file) {
    try {
      await fsp.unlink(file.path);
      console.log(`Cleaned up file: ${file.filename}`);
    } catch (unlinkError) {
      console.error(
        `Error deleting file ${file.filename}:`,
        unlinkError.message
      );
    }
  }
};

// Helper function to move file to correct directory after package creation
const moveFileToCorrectLocation = async (tempFile, packageId) => {
  if (!tempFile) return null;

  try {
    const correctDir = path.join(
      __dirname,
      "..",
      "uploads",
      "tourpackage",
      packageId
    );
    const correctPath = path.join(correctDir, tempFile.filename);

    // Create correct directory if it doesn't exist
    if (!fs.existsSync(correctDir)) {
      await fsp.mkdir(correctDir, { recursive: true });
    }

    // Move file to correct location
    await fsp.rename(tempFile.path, correctPath);

    return `uploads/tourpackage/${packageId}/${tempFile.filename}`;
  } catch (error) {
    console.error("Error moving file:", error);
    return tempFile.path;
  }
};

// Helper function to format validation errors
const formatValidationErrors = (errors) => {
  return errors
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
};
class TourPackageController {
  // Create tour package
  async createTourPackage(req, res) {
    try {
      // Validate request body
      const validationResult = tourPackageCreateSchema.safeParse(req.body);

      if (!validationResult.success) {
        await cleanupFile(req.file);
        const errorMessage = formatValidationErrors(
          validationResult.error.issues
        );
        return errorResponse(res, 400, `Validation failed: ${errorMessage}`);
      }

      // Create tour package first
      const tourPackage = await tourPackageService.createTourPackage(
        validationResult.data,
        req.file,
        req.user
      );

      // If file was uploaded, move it to correct location
      if (req.file) {
        const correctPath = await moveFileToCorrectLocation(
          req.file,
          tourPackage.id
        );
        console.log("here and here ", correctPath);

        // Update package with correct file path
        if (correctPath !== req.file.path) {
          await tourPackageService.updateTourPackage(tourPackage.id, {
            coverPhoto: correctPath,
          });

          console.log("cover phtot updated", correctPath);

          tourPackage.coverPhoto = correctPath;
        }
      }

      return successResponse(
        res,
        201,
        "Tour package created successfully",
        tourPackage
      );
    } catch (error) {
      await cleanupFile(req.file);
      console.error("Error creating tour package:", error);
      return errorResponse(
        res,
        500,
        error.message || "Failed to create tour package"
      );
    }
  }

  // Get all tour packages with pagination and filters
  async getAllTourPackages(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        packageName,
        minPrice,
        maxPrice,
        minSeats,
        maxSeats,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // console.log("req query ", req.query);

      // Build filters object
      const filters = {};
      if (search) {
        filters.packageName = search;
      }

      // console.log("filters ", filters);
      if (packageName) filters.packageName = packageName;
      if (minPrice) filters.minPrice = minPrice;
      if (maxPrice) filters.maxPrice = maxPrice;
      if (minSeats) filters.minSeats = minSeats;
      if (maxSeats) filters.maxSeats = maxSeats;

      const options = {
        sortBy,
        sortOrder,
      };

      const result = await tourPackageService.getAllTourPackages(
        page,
        limit,
        filters,
        options
      );

      return successResponse(
        res,
        200,
        "Tour packages retrieved successfully",
        result
      );
    } catch (error) {
      console.error("Error fetching tour packages:", error);
      return errorResponse(
        res,
        500,
        error.message || "Failed to fetch tour packages"
      );
    }
  }

  // Get tour package by ID
  async getTourPackageById(req, res) {
    try {
      const { id } = req.params;

      if (!id || id.trim() === "") {
        return errorResponse(res, 400, "Tour package ID is required");
      }

      const tourPackage = await tourPackageService.getTourPackageById(id);

      return successResponse(
        res,
        200,
        "Tour package retrieved successfully",
        tourPackage
      );
    } catch (error) {
      console.error("Error fetching tour package by ID:", error);

      if (error.message === "Tour package not found") {
        return errorResponse(res, 404, "Tour package not found");
      }

      return errorResponse(res, 500, "Failed to fetch tour package");
    }
  }

  // Update tour package
  async updateTourPackage(req, res) {
    try {
      const { id } = req.params;

      console.log("here here ", req.file);

      if (!id || id.trim() === "") {
        await cleanupFile(req.file);
        return errorResponse(res, 400, "Tour package ID is required");
      }

      // Validate request body
      const validationResult = tourPackageUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        await cleanupFile(req.file);
        const errorMessage = formatValidationErrors(
          validationResult.error.issues
        );
        return errorResponse(res, 400, `Validation failed: ${errorMessage}`);
      }

      // If file is uploaded, ensure it's in correct directory
      let fileForService = req.file;
      if (req.file && req.file.fieldname !== "coverPhoto") {
        const correctPath = await moveFileToCorrectLocation(req.file, id);
        fileForService = { ...req.file, path: correctPath };
      }

      // Update tour package with validated data
      const tourPackage = await tourPackageService.updateTourPackage(
        id,
        validationResult.data,
        fileForService,
        req.user
      );

      return successResponse(
        res,
        200,
        "Tour package updated successfully",
        tourPackage
      );
    } catch (error) {
      await cleanupFile(req.file);
      console.error("Error updating tour package:", error);

      if (error.message === "Tour package not found") {
        return errorResponse(res, 404, "Tour package not found");
      }

      return errorResponse(res, 500, "Failed to update tour package");
    }
  }

  // Delete tour package
  async deleteTourPackage(req, res) {
    try {
      const { id } = req.params;

      if (!id || id.trim() === "") {
        return errorResponse(res, 400, "Tour package ID is required");
      }

      const result = await tourPackageService.deleteTourPackage(id);

      return successResponse(
        res,
        200,
        result.message || "Tour package deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting tour package:", error);

      if (error.message === "Tour package not found") {
        return errorResponse(res, 404, "Tour package not found");
      }

      return errorResponse(res, 500, "Failed to delete tour package");
    }
  }

  // Download cover photo
  async downloadCoverPhoto(req, res) {
    try {
      const { id } = req.params;

      if (!id || id.trim() === "") {
        return errorResponse(res, 400, "Tour package ID is required");
      }

      const tourPackage = await tourPackageService.getTourPackageById(id);

      if (!tourPackage.coverPhoto) {
        return errorResponse(res, 404, "Cover photo not found");
      }

      // Construct file path
      const filePath = path.resolve(__dirname, "..", tourPackage.coverPhoto);

      // Check if file exists on filesystem
      try {
        await fsp.access(filePath);
      } catch (fileError) {
        console.error(`File not found on filesystem: ${filePath}`);
        return errorResponse(res, 404, "Cover photo file not found on server");
      }

      // Get file info
      const fileName = path.basename(filePath);
      const fileExtension = path.extname(fileName);
      const originalName = `${tourPackage.packageName}-cover${fileExtension}`;

      // Set appropriate headers
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${originalName}"`
      );

      // Download the file
      return res.download(filePath, originalName, (err) => {
        if (err) {
          console.error("Error downloading cover photo:", err);
          if (!res.headersSent) {
            return errorResponse(res, 500, "Failed to download cover photo");
          }
        }
      });
    } catch (error) {
      console.error("Error in download cover photo:", error);

      if (error.message === "Tour package not found") {
        return errorResponse(res, 404, "Tour package not found");
      }

      if (!res.headersSent) {
        return errorResponse(res, 500, "Failed to download cover photo");
      }
    }
  }

  // Get tour package statistics
  async getTourPackageStats(req, res) {
    try {
      const stats = await tourPackageService.getTourPackageStats();

      return successResponse(
        res,
        200,
        "Tour package statistics retrieved successfully",
        stats
      );
    } catch (error) {
      console.error("Error fetching tour package statistics:", error);
      return errorResponse(res, 500, "Failed to fetch tour package statistics");
    }
  }

  // Bulk delete tour packages
  async bulkDeleteTourPackages(req, res) {
    try {
      const { packageIds } = req.body;

      if (
        !packageIds ||
        !Array.isArray(packageIds) ||
        packageIds.length === 0
      ) {
        return errorResponse(res, 400, "Package IDs array is required");
      }

      const result = await tourPackageService.bulkDeleteTourPackages(
        packageIds
      );

      return successResponse(res, 200, result.message, {
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.error("Error bulk deleting tour packages:", error);
      return errorResponse(res, 500, "Failed to delete tour packages");
    }
  }
}

export default new TourPackageController();
