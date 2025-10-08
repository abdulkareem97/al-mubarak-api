// controllers/user.controller.js
import { errorResponse, successResponse } from "../utils/response.js";
import { UserService } from "../services/user.service.js";
class UserController {
  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get all users with pagination, search, and filters
   */
  getUsers = async (req, res, next) => {
    try {
      const { page = "1", limit = "10", search = "", role } = req.query;

      const result = await this.userService.getUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search: search,
        role: role,
      });

      return successResponse(res, 200, "Users fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID
   */
  getUserById = async (req, res, next) => {
    try {
      const { id } = req.params;

      const user = await this.userService.getUserById(id);

      if (!user) {
        return errorResponse(res, 404, "User not found");
      }

      return successResponse(res, 200, "User fetched successfully", user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new user
   */
  createUser = async (req, res, next) => {
    try {
      // Check if user has permission (Admin or Manager)
      const currentUser = req.user;
      if (!["ADMIN", "MANAGER"].includes(currentUser.role)) {
        return errorResponse(
          res,
          403,
          "You don't have permission to create users"
        );
      }

      const userData = req.body;

      // Check if email already exists
      const existingUser = await this.userService.getUserByEmail(
        userData.email
      );
      if (existingUser) {
        return errorResponse(res, 409, "User with this email already exists");
      }

      const user = await this.userService.createUser(userData);

      return successResponse(res, 201, "User created successfully", user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user
   */
  updateUser = async (req, res, next) => {
    try {
      // Check if user has permission (Admin or Manager)
      const currentUser = req.user;
      if (!["ADMIN", "MANAGER"].includes(currentUser.role)) {
        return errorResponse(
          res,
          403,
          "You don't have permission to update users"
        );
      }

      const { id } = req.params;
      const updateData = req.body;

      // Check if user exists
      const existingUser = await this.userService.getUserById(id);
      if (!existingUser) {
        return errorResponse(res, 404, "User not found");
      }

      // If updating email, check if new email is already taken
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await this.userService.getUserByEmail(
          updateData.email
        );
        if (emailExists) {
          return errorResponse(res, 409, "Email already in use");
        }
      }

      const user = await this.userService.updateUser(id, updateData);

      return successResponse(res, 200, "User updated successfully", user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user
   */
  deleteUser = async (req, res, next) => {
    try {
      // Check if user has permission (Admin only)
      const currentUser = req.user;
      if (currentUser.role !== "ADMIN") {
        return errorResponse(res, 403, "Only admins can delete users");
      }

      const { id } = req.params;

      // Prevent deleting self
      if (currentUser.id === id) {
        return errorResponse(res, 400, "You cannot delete your own account");
      }

      // Check if user exists
      const existingUser = await this.userService.getUserById(id);
      if (!existingUser) {
        return errorResponse(res, 404, "User not found");
      }

      await this.userService.deleteUser(id);

      return successResponse(res, 200, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset user password
   */
  resetPassword = async (req, res, next) => {
    try {
      // Check if user has permission (Admin or Manager)
      const currentUser = req.user;
      if (!["ADMIN", "MANAGER"].includes(currentUser.role)) {
        return errorResponse(
          res,
          403,
          "You don't have permission to reset passwords"
        );
      }

      const { id } = req.params;
      const { newPassword } = req.body;

      // Check if user exists
      const existingUser = await this.userService.getUserById(id);
      if (!existingUser) {
        return errorResponse(res, 404, "User not found");
      }

      await this.userService.resetPassword(id, newPassword);

      return successResponse(res, 200, "Password reset successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export users to CSV
   */
  exportUsers = async (req, res, next) => {
    try {
      const { search = "", role } = req.query;

      const csv = await this.userService.exportUsers({
        search: search,
        role: role,
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=users-${Date.now()}.csv`
      );

      return res.send(csv);
    } catch (error) {
      next(error);
    }
  };
}

export { UserController };
