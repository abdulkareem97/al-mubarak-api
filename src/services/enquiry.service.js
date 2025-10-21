// services/enquiry.service.js

import prisma from "../config/prisma.js";

/**
 * Create a new enquiry
 * @param {Object} data - Enquiry data
 * @returns {Promise<Object>} Created enquiry
 */
export const createEnquiryService = async (data, createdBy) => {
  try {
    const enquiry = await prisma.enquiryForm.create({
      data: {
        name: data.name,
        phone: data.phone,
        purpose: data.purpose,
        status: data.status || "PENDING",
        createdById: createdBy.userId,
      },
    });

    return enquiry;
  } catch (error) {
    console.error("Create enquiry service error:", error);
    throw new Error("Failed to create enquiry in database");
  }
};

/**
 * Get all enquiries with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Paginated enquiries
 */
export const getAllEnquiriesService = async (filters, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const [enquiries, total] = await Promise.all([
      prisma.enquiryForm.findMany({
        where: { ...filters },
        include: {
          createdBy: {
            select: { id: true, email: true, name: true },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.enquiryForm.count(),
    ]);

    return {
      data: enquiries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Get all enquiries service error:", error);
    throw new Error("Failed to fetch enquiries from database");
  }
};

/**
 * Get enquiry by ID
 * @param {string} id - Enquiry ID
 * @returns {Promise<Object|null>} Enquiry or null
 */
export const getEnquiryByIdService = async (id) => {
  try {
    const enquiry = await prisma.enquiryForm.findUnique({
      where: { id },
    });

    return enquiry;
  } catch (error) {
    console.error("Get enquiry by ID service error:", error);
    throw new Error("Failed to fetch enquiry from database");
  }
};

/**
 * Update enquiry
 * @param {string} id - Enquiry ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated enquiry
 */
export const updateEnquiryService = async (id, data, createdBy) => {
  try {
    const enquiry = await prisma.enquiryForm.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.purpose !== undefined && { purpose: data.purpose }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.createdById !== undefined && {
          createdById: createdBy.userId,
        }),
      },
    });

    return enquiry;
  } catch (error) {
    console.error("Update enquiry service error:", error);
    if (error.code === "P2025") {
      throw new Error("Enquiry not found");
    }
    throw new Error("Failed to update enquiry in database");
  }
};

/**
 * Update enquiry status only
 * @param {string} id - Enquiry ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated enquiry
 */
export const updateEnquiryStatusService = async (id, status, createdBy) => {
  try {
    const enquiry = await prisma.enquiryForm.update({
      where: { id },
      data: { status, createdById: createdBy.userId },
    });

    return enquiry;
  } catch (error) {
    console.error("Update enquiry status service error:", error);
    if (error.code === "P2025") {
      throw new Error("Enquiry not found");
    }
    throw new Error("Failed to update enquiry status in database");
  }
};

/**
 * Delete enquiry
 * @param {string} id - Enquiry ID
 * @returns {Promise<Object>} Deleted enquiry
 */
export const deleteEnquiryService = async (id) => {
  try {
    const enquiry = await prisma.enquiryForm.delete({
      where: { id },
    });

    return enquiry;
  } catch (error) {
    console.error("Delete enquiry service error:", error);
    if (error.code === "P2025") {
      throw new Error("Enquiry not found");
    }
    throw new Error("Failed to delete enquiry from database");
  }
};

/**
 * Get enquiries by status
 * @param {string} status - Enquiry status
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Filtered enquiries
 */
export const getEnquiriesByStatusService = async (
  status,
  page = 1,
  limit = 10
) => {
  try {
    const skip = (page - 1) * limit;

    const [enquiries, total] = await Promise.all([
      prisma.enquiryForm.findMany({
        where: { status },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.enquiryForm.count({
        where: { status },
      }),
    ]);

    return {
      data: enquiries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Get enquiries by status service error:", error);
    throw new Error("Failed to fetch enquiries by status from database");
  }
};

/**
 * Get enquiry statistics
 * @returns {Promise<Object>} Statistics
 */
export const getEnquiryStatsService = async () => {
  try {
    const [total, pending, booked, notInterested] = await Promise.all([
      prisma.enquiryForm.count(),
      prisma.enquiryForm.count({ where: { status: "PENDING" } }),
      prisma.enquiryForm.count({ where: { status: "BOOKED" } }),
      prisma.enquiryForm.count({ where: { status: "NOT_INTERESTED" } }),
    ]);

    return {
      total,
      pending,
      booked,
      notInterested,
    };
  } catch (error) {
    console.error("Get enquiry stats service error:", error);
    throw new Error("Failed to fetch enquiry statistics from database");
  }
};
