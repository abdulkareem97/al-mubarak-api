// routes/user.routes.ts
import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  getUsersQuerySchema,
} from "../validations/user.validator.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination, search, and filters
 * @access  Private
 */
router.get(
  "/",
  validate(getUsersQuerySchema, "query"),
  userController.getUsers
);

/**
 * @route   GET /api/users/export
 * @desc    Export users to CSV
 * @access  Private
 */
router.get("/export", userController.exportUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get("/:id", userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin/Manager only)
 */
router.post("/", validate(createUserSchema), userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin/Manager only)
 */
router.put("/:id", validate(updateUserSchema), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete("/:id", userController.deleteUser);

/**
 * @route   POST /api/users/:id/reset-password
 * @desc    Reset user password
 * @access  Private (Admin/Manager only)
 */
router.post(
  "/:id/reset-password",
  validate(resetPasswordSchema),
  userController.resetPassword
);

export default router;
