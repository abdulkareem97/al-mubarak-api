// ===== MEMBER CONTROLLER =====
// controllers/memberController.js
import memberService from "../services/memberService.js";
import {
  memberCreateSchema,
  memberUpdateSchema,
} from "../validations/memberValidation.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to clean up uploaded files
const cleanupFiles = async (files) => {
  if (files && files.length > 0) {
    const cleanupPromises = files.map(async (file) => {
      try {
        await fs.unlink(file.path);
        console.log(`Cleaned up file: ${file.filename}`);
      } catch (unlinkError) {
        console.error(
          `Error deleting file ${file.filename}:`,
          unlinkError.message
        );
      }
    });
    await Promise.all(cleanupPromises);
  }
};

// Helper function to format validation errors
const formatValidationErrors = (errors) => {
  return errors
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
};

class MemberController {
  // Create member
  async createMember(req, res) {
    try {
      const validationResult = memberCreateSchema.safeParse(req.body);

      console.log(validationResult.error);

      if (!validationResult.success) {
        await cleanupFiles(req.files);
        const errorMessage = formatValidationErrors(
          validationResult.error.issues
        );
        return errorResponse(res, 400, `Validation failed: ${errorMessage}`);
      }

      // Create member with validated data
      const member = await memberService.createMember(
        validationResult.data,
        req.files,
        req.user
      );

      return successResponse(res, 201, "Member created successfully", member);
    } catch (error) {
      await cleanupFiles(req.files);
      console.error("Error creating member:", error);
      return errorResponse(
        res,
        500,
        error.message || "Failed to create member"
      );
    }
  }

  // Get all members with pagination and filters
  async getAllMembers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        name,
        mobileNo,
        userid,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Build filters object
      const filters = {};
      if (name) filters.name = name;
      if (mobileNo) filters.mobileNo = mobileNo;
      if (userid) filters.userid = userid;

      const options = {
        sortBy,
        sortOrder,
      };

      const result = await memberService.getAllMembers(
        page,
        limit,
        filters,
        options
      );

      return successResponse(
        res,
        200,
        "Members retrieved successfully",
        result
      );
    } catch (error) {
      console.error("Error fetching members:", error);
      return errorResponse(
        res,
        500,
        error.message || "Failed to fetch members"
      );
    }
  }

  // Get member by ID
  async getMemberById(req, res) {
    try {
      const { id } = req.params;

      if (!id || id.trim() === "") {
        return errorResponse(res, 400, "Member ID is required");
      }

      const member = await memberService.getMemberById(id);

      return successResponse(res, 200, "Member retrieved successfully", member);
    } catch (error) {
      console.error("Error fetching member by ID:", error);

      if (error.message === "Member not found") {
        return errorResponse(res, 404, "Member not found");
      }

      return errorResponse(res, 500, "Failed to fetch member");
    }
  }

  // Update member
  async updateMember(req, res) {
    try {
      const { id } = req.params;

      if (!id || id.trim() === "") {
        await cleanupFiles(req.files);
        return errorResponse(res, 400, "Member ID is required");
      }

      // Validate request body
      const validationResult = memberUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        await cleanupFiles(req.files);
        const errorMessage = formatValidationErrors(
          validationResult.error.issues
        );
        return errorResponse(res, 400, `Validation failed: ${errorMessage}`);
      }

      // Update member with validated data
      const member = await memberService.updateMember(
        id,
        validationResult.data,
        req.files,
        req.user
      );

      return successResponse(res, 200, "Member updated successfully", member);
    } catch (error) {
      await cleanupFiles(req.files);
      console.error("Error updating member:", error);

      if (error.message === "Member not found") {
        return errorResponse(res, 404, "Member not found");
      }

      return errorResponse(res, 500, "Failed to update member");
    }
  }

  // Delete member
  async deleteMember(req, res) {
    try {
      const { id } = req.params;

      if (!id || id.trim() === "") {
        return errorResponse(res, 400, "Member ID is required");
      }

      const result = await memberService.deleteMember(id);

      return successResponse(
        res,
        200,
        result.message || "Member deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting member:", error);

      if (error.message === "Member not found") {
        return errorResponse(res, 404, "Member not found");
      }

      return errorResponse(res, 500, "Failed to delete member");
    }
  }

  // Get members by user ID
  async getMembersByUserId(req, res) {
    try {
      const { userid } = req.params;

      if (!userid || userid.trim() === "") {
        return errorResponse(res, 400, "User ID is required");
      }

      const members = await memberService.getMembersByUserId(userid);

      const message =
        members.length > 0
          ? `Found ${members.length} member(s) for user`
          : "No members found for this user";

      return successResponse(res, 200, message, members);
    } catch (error) {
      console.error("Error fetching members by user ID:", error);
      return errorResponse(res, 500, "Failed to fetch user members");
    }
  }

  // Download document
  async downloadDocument(req, res) {
    try {
      const { id, filename } = req.params;

      if (!id || id.trim() === "") {
        return errorResponse(res, 400, "Member ID is required");
      }

      if (!filename || filename.trim() === "") {
        return errorResponse(res, 400, "Filename is required");
      }

      // Get member data
      const member = await memberService.getMemberById(id);

      // Find the requested document
      const document = Array.isArray(member.document)
        ? member.document.find((doc) => doc.filename === filename)
        : null;

      if (!document) {
        return errorResponse(res, 404, "Document not found");
      }

      // Construct file path
      const filePath = path.resolve(__dirname, "..", document.path);

      // Check if file exists on filesystem
      try {
        await fs.access(filePath);
      } catch (fileError) {
        console.error(`File not found on filesystem: ${filePath}`);
        return errorResponse(res, 404, "File not found on server");
      }

      // Set appropriate headers
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${document.originalName}"`
      );
      res.setHeader(
        "Content-Type",
        document.mimetype || "application/octet-stream"
      );

      // Download the file
      return res.download(filePath, document.originalName, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          if (!res.headersSent) {
            return errorResponse(res, 500, "Failed to download file");
          }
        }
      });
    } catch (error) {
      console.error("Error in download document:", error);

      if (error.message === "Member not found") {
        return errorResponse(res, 404, "Member not found");
      }

      if (!res.headersSent) {
        return errorResponse(res, 500, "Failed to download document");
      }
    }
  }

  // Get member documents list
  async getMemberDocuments(req, res) {
    try {
      const { id } = req.params;

      if (!id || id.trim() === "") {
        return errorResponse(res, 400, "Member ID is required");
      }

      const member = await memberService.getMemberById(id);

      const documents = Array.isArray(member.document)
        ? member.document.map((doc) => ({
            filename: doc.filename,
            originalName: doc.originalName,
            mimetype: doc.mimetype,
            size: doc.size,
            uploadedAt: doc.uploadedAt || member.createdAt,
          }))
        : [];

      const message =
        documents.length > 0
          ? `Found ${documents.length} document(s)`
          : "No documents found for this member";

      return successResponse(res, 200, message, {
        memberId: member.id,
        memberName: member.name,
        documents: documents,
      });
    } catch (error) {
      console.error("Error fetching member documents:", error);

      if (error.message === "Member not found") {
        return errorResponse(res, 404, "Member not found");
      }

      return errorResponse(res, 500, "Failed to fetch member documents");
    }
  }

  // Delete specific document
  async deleteDocument(req, res) {
    try {
      const { id, filename } = req.params;

      if (!id || id.trim() === "") {
        return errorResponse(res, 400, "Member ID is required");
      }

      if (!filename || filename.trim() === "") {
        return errorResponse(res, 400, "Filename is required");
      }

      const result = await memberService.deleteDocument(id, filename);

      return successResponse(res, 200, "Document deleted successfully", result);
    } catch (error) {
      console.error("Error deleting document:", error);

      if (error.message === "Member not found") {
        return errorResponse(res, 404, "Member not found");
      }

      if (error.message === "Document not found") {
        return errorResponse(res, 404, "Document not found");
      }

      return errorResponse(res, 500, "Failed to delete document");
    }
  }

  // Get member statistics
  async getMemberStats(req, res) {
    try {
      const stats = await memberService.getMemberStats();

      return successResponse(
        res,
        200,
        "Member statistics retrieved successfully",
        stats
      );
    } catch (error) {
      console.error("Error fetching member statistics:", error);
      return errorResponse(res, 500, "Failed to fetch member statistics");
    }
  }

  // Bulk delete members
  async bulkDeleteMembers(req, res) {
    try {
      const { memberIds } = req.body;

      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return errorResponse(res, 400, "Member IDs array is required");
      }

      const result = await memberService.bulkDeleteMembers(memberIds);

      return successResponse(
        res,
        200,
        `Successfully deleted ${result.deletedCount} member(s)`,
        {
          deletedCount: result.deletedCount,
          failedIds: result.failedIds || [],
        }
      );
    } catch (error) {
      console.error("Error bulk deleting members:", error);
      return errorResponse(res, 500, "Failed to delete members");
    }
  }
}

export default new MemberController();
