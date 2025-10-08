// validators/user.validator.js
import { z } from "zod";

// Enum for user roles
const UserRoleEnum = z.enum(["ADMIN", "MANAGER", "STAFF", "MEMBER"]);

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  role: UserRoleEnum.optional().default("MEMBER"),
});

/**
 * Schema for updating a user
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters")
    .optional(),
  role: UserRoleEnum.optional(),
});

/**
 * Schema for resetting password
 */
export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

/**
 * Schema for query parameters when getting users
 */
export const getUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Page must be a positive number",
    }),
  limit: z
    .string()
    .optional()
    .default("10")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100,
      {
        message:
          "Limit must be a positive number and less than or equal to 100",
      }
    ),
  search: z.string().optional().default(""),
  role: UserRoleEnum.optional(),
});
