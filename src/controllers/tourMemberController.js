// File: src/controllers/tourMemberController.js

import tourMemberService from "../services/tourMemberService.js";
import { successResponse } from "../utils/response.js";
import {
  getTourMembersQuerySchema,
  createTourMemberSchema,
  updateTourMemberSchema,
  addPaymentSchema,
  updatePaymentSchema,
} from "../validations/tourMemberValidator.js";

class TourMemberController {
  async getAllTourMembers(req, res, next) {
    try {
      //   console.log("called", req.query);
      const validatedQuery = getTourMembersQuerySchema.parse(req.query);
      validatedQuery.user = req.user;
      const result = await tourMemberService.getAllTourMembers(validatedQuery);

      return successResponse(res, 200, "Tour members retrieved successfully", {
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTourMemberById(req, res, next) {
    try {
      const { id } = req.params;
      const tourMember = await tourMemberService.getTourMemberById(id);

      return successResponse(
        res,
        200,
        "Tour member retrieved successfully",
        tourMember
      );
    } catch (error) {
      next(error);
    }
  }

  async createTourMember(req, res, next) {
    try {
      const validatedData = createTourMemberSchema.parse(req.body);
      const tourMember = await tourMemberService.createTourMember(
        validatedData,
        req.user
      );

      return successResponse(
        res,
        201,
        "Tour member created successfully",
        tourMember
      );
    } catch (error) {
      next(error);
    }
  }

  async updateTourMember(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateTourMemberSchema.parse(req.body);
      const tourMember = await tourMemberService.updateTourMember(
        id,
        validatedData,
        req.user
      );

      return successResponse(
        res,
        200,
        "Tour member updated successfully",
        tourMember
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteTourMember(req, res, next) {
    try {
      const { id } = req.params;
      const result = await tourMemberService.deleteTourMember(id);

      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async addPayment(req, res, next) {
    try {
      const { tourMemberId } = req.params;
      const validatedData = addPaymentSchema.parse(req.body);
      const payment = await tourMemberService.addPayment(
        tourMemberId,
        validatedData,
        req.user
      );

      return successResponse(res, 201, "Payment added successfully", payment);
    } catch (error) {
      next(error);
    }
  }

  async updatePayment(req, res, next) {
    try {
      const { tourMemberId, paymentId } = req.params;
      const validatedData = updatePaymentSchema.parse(req.body);
      const payment = await tourMemberService.updatePayment(
        tourMemberId,
        paymentId,
        validatedData,
        req.user
      );

      return successResponse(res, 200, "Payment updated successfully", payment);
    } catch (error) {
      next(error);
    }
  }

  async deletePayment(req, res, next) {
    try {
      const { tourMemberId, paymentId } = req.params;
      const result = await tourMemberService.deletePayment(
        tourMemberId,
        paymentId
      );

      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getTourMemberStats(req, res, next) {
    try {
      const stats = await tourMemberService.getTourMemberStats();

      return successResponse(
        res,
        200,
        "Statistics retrieved successfully",
        stats
      );
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req, res, next) {
    try {
      const prisma = require("../config/database");
      const members = await prisma.member.findMany({
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
        orderBy: { name: "asc" },
      });

      return successResponse(
        res,
        200,
        "Members retrieved successfully",
        members
      );
    } catch (error) {
      next(error);
    }
  }

  async getTourPackages(req, res, next) {
    try {
      const prisma = require("../config/database");
      const tourPackages = await prisma.tourPackage.findMany({
        select: {
          id: true,
          packageName: true,
          tourPrice: true,
          totalSeat: true,
          coverPhoto: true,
          desc: true,
        },
        orderBy: { packageName: "asc" },
      });

      return successResponse(
        res,
        200,
        "Tour packages retrieved successfully",
        tourPackages
      );
    } catch (error) {
      next(error);
    }
  }

  async getTourPackageById(req, res, next) {
    try {
      const { id } = req.params;
      const prisma = require("../config/database");
      const tourPackage = await prisma.tourPackage.findUnique({
        where: { id },
        select: {
          id: true,
          packageName: true,
          tourPrice: true,
          totalSeat: true,
          coverPhoto: true,
          desc: true,
          extra: true,
        },
      });

      if (!tourPackage) {
        return successResponse(res, 404, "Tour package not found");
      }

      return successResponse(
        res,
        200,
        "Tour package retrieved successfully",
        tourPackage
      );
    } catch (error) {
      next(error);
    }
  }

  async getTourMemberStatsByTourId(req, res, next) {
    try {
      const { tourId } = req.params;
      const stats = await tourMemberService.getTourMemberStatsByTourId(tourId);

      //   console.log("stats", stats);

      return successResponse(
        res,
        200,
        "Statistics retrieved successfully",
        stats
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new TourMemberController();
