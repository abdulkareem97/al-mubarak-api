// controllers/enquiry.controller.js
import { successResponse, errorResponse } from "../utils/response.js";
import {
  createEnquiryService,
  getAllEnquiriesService,
  getEnquiryByIdService,
  updateEnquiryService,
  updateEnquiryStatusService,
  deleteEnquiryService,
} from "../services/enquiry.service.js";
import { USER_ROLES } from "../constants/string.js";
/**
 * Create a new enquiry
 * @route POST /api/enquiries
 */
export const createEnquiry = async (req, res) => {
  try {
    const { name, phone, purpose, status } = req.body;

    // Validation
    if (!name || !phone || !purpose) {
      return errorResponse(res, 400, "Name, phone, and purpose are required");
    }

    if (name.length < 2) {
      return errorResponse(res, 400, "Name must be at least 2 characters");
    }

    if (purpose.length < 10) {
      return errorResponse(res, 400, "Purpose must be at least 10 characters");
    }

    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(phone)) {
      return errorResponse(res, 400, "Invalid phone number format");
    }

    // Valid status values
    const validStatuses = ["PENDING", "BOOKED", "NOT_INTERESTED"];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(res, 400, "Invalid status value");
    }

    const enquiry = await createEnquiryService(
      {
        name,
        phone,
        purpose,
        status: status || "PENDING",
      },
      req.user
    );

    return successResponse(res, 201, "Enquiry created successfully", enquiry);
  } catch (error) {
    console.error("Create enquiry error:", error);
    return errorResponse(res, 500, error.message || "Failed to create enquiry");
  }
};

/**
 * Get all enquiries with pagination
 * @route GET /api/enquiries?page=1&limit=10
 */
export const getAllEnquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};
    if (req.user.role == USER_ROLES.STAFF)
      filters.createdById = req.user.userId;

    if (page < 1 || limit < 1) {
      return errorResponse(res, 400, "Page and limit must be positive numbers");
    }

    if (limit > 100) {
      return errorResponse(res, 400, "Limit cannot exceed 100");
    }

    const result = await getAllEnquiriesService(filters, page, limit);

    return successResponse(res, 200, "Enquiries fetched successfully", result);
  } catch (error) {
    console.error("Get enquiries error:", error);
    return errorResponse(
      res,
      500,
      error.message || "Failed to fetch enquiries"
    );
  }
};

/**
 * Get single enquiry by ID
 * @route GET /api/enquiries/:id
 */
export const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, 400, "Enquiry ID is required");
    }

    const enquiry = await getEnquiryByIdService(id);

    if (!enquiry) {
      return errorResponse(res, 404, "Enquiry not found");
    }

    return successResponse(res, 200, "Enquiry fetched successfully", enquiry);
  } catch (error) {
    console.error("Get enquiry error:", error);
    return errorResponse(res, 500, error.message || "Failed to fetch enquiry");
  }
};

/**
 * Update enquiry
 * @route PUT /api/enquiries/:id
 */
export const updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, purpose, status } = req.body;

    if (!id) {
      return errorResponse(res, 400, "Enquiry ID is required");
    }

    // Check if enquiry exists
    const existingEnquiry = await getEnquiryByIdService(id);
    if (!existingEnquiry) {
      return errorResponse(res, 404, "Enquiry not found");
    }

    // Validation
    if (name && name.length < 2) {
      return errorResponse(res, 400, "Name must be at least 2 characters");
    }

    if (purpose && purpose.length < 10) {
      return errorResponse(res, 400, "Purpose must be at least 10 characters");
    }

    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (phone && !phoneRegex.test(phone)) {
      return errorResponse(res, 400, "Invalid phone number format");
    }

    const validStatuses = ["PENDING", "BOOKED", "NOT_INTERESTED"];
    if (status && !validStatuses.includes(status)) {
      return errorResponse(res, 400, "Invalid status value");
    }

    // Prepare update data (only include fields that are provided)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (purpose !== undefined) updateData.purpose = purpose;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, 400, "No fields to update");
    }

    const updatedEnquiry = await updateEnquiryService(id, updateData, req.user);

    return successResponse(
      res,
      200,
      "Enquiry updated successfully",
      updatedEnquiry
    );
  } catch (error) {
    console.error("Update enquiry error:", error);
    return errorResponse(res, 500, error.message || "Failed to update enquiry");
  }
};

/**
 * Update enquiry status only
 * @route PATCH /api/enquiries/:id/status
 */
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return errorResponse(res, 400, "Enquiry ID is required");
    }

    if (!status) {
      return errorResponse(res, 400, "Status is required");
    }

    const validStatuses = ["PENDING", "BOOKED", "NOT_INTERESTED"];
    if (!validStatuses.includes(status)) {
      return errorResponse(
        res,
        400,
        "Invalid status value. Must be one of: PENDING, BOOKED, NOT_INTERESTED"
      );
    }

    // Check if enquiry exists
    const existingEnquiry = await getEnquiryByIdService(id);
    if (!existingEnquiry) {
      return errorResponse(res, 404, "Enquiry not found");
    }

    const updatedEnquiry = await updateEnquiryStatusService(
      id,
      status,
      req.user
    );

    return successResponse(
      res,
      200,
      "Enquiry status updated successfully",
      updatedEnquiry
    );
  } catch (error) {
    console.error("Update enquiry status error:", error);
    return errorResponse(
      res,
      500,
      error.message || "Failed to update enquiry status"
    );
  }
};

/**
 * Delete enquiry
 * @route DELETE /api/enquiries/:id
 */
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, 400, "Enquiry ID is required");
    }

    // Check if enquiry exists
    const existingEnquiry = await getEnquiryByIdService(id);
    if (!existingEnquiry) {
      return errorResponse(res, 404, "Enquiry not found");
    }

    await deleteEnquiryService(id);

    return successResponse(res, 200, "Enquiry deleted successfully", null);
  } catch (error) {
    console.error("Delete enquiry error:", error);
    return errorResponse(res, 500, error.message || "Failed to delete enquiry");
  }
};
