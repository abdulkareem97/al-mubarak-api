// ===== VALIDATION =====
// validations/tourPackageValidation.js
import { z } from "zod";

export const tourPackageCreateSchema = z.object({
  packageName: z
    .string()
    .min(2, "Package name must be at least 2 characters long")
    .max(200, "Package name must not exceed 200 characters"),

  tourPrice: z.union([
    z.number().positive("Tour price must be positive"),
    z.string().regex(/^\d+\.?\d*$/, "Tour price must be a valid number"),
  ]),

  totalSeat: z.union([
    z.number().int().positive("Total seats must be a positive integer"),
    z.string().regex(/^\d+$/, "Total seats must be a valid integer"),
  ]),

  desc: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(2000, "Description must not exceed 2000 characters"),
});

export const tourPackageUpdateSchema = z
  .object({
    packageName: z
      .string()
      .min(2, "Package name must be at least 2 characters long")
      .max(200, "Package name must not exceed 200 characters")
      .optional(),

    tourPrice: z
      .union([
        z.number().positive("Tour price must be positive"),
        z.string().regex(/^\d+\.?\d*$/, "Tour price must be a valid number"),
      ])
      .optional(),

    totalSeat: z
      .union([
        z.number().int().positive("Total seats must be a positive integer"),
        z.string().regex(/^\d+$/, "Total seats must be a valid integer"),
      ])
      .optional(),

    desc: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .max(2000, "Description must not exceed 2000 characters")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const tourPackageQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  packageName: z.string().optional(),
  minPrice: z
    .string()
    .regex(/^\d+\.?\d*$/)
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+\.?\d*$/)
    .optional(),
  minSeats: z.string().regex(/^\d+$/).optional(),
  maxSeats: z.string().regex(/^\d+$/).optional(),
  sortBy: z
    .enum(["packageName", "tourPrice", "totalSeat", "createdAt"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
