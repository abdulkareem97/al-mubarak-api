// File: src/validators/tourMemberValidator.js
import { z } from "zod";

const createTourMemberSchema = z.object({
  memberIds: z.array(z.string()).min(1, "At least one member must be selected"),
  tourPackageId: z.string().cuid("Invalid tour package ID"),
  packagePrice: z.number().min(0, "Package price must be positive"),
  memberCount: z.number().int().min(1, "Member count must be at least 1"),
  netCost: z.number().min(0, "Net cost must be positive"),
  discount: z.number().min(0).optional(),
  totalCost: z.number().min(0, "Total cost must be positive"),
  paymentType: z.enum(["ONE_TIME", "EMI", "PARTIAL"]),
  nextReminder: z.string().datetime().optional(),
  status: z.string().optional(),
  extra: z.object().optional(),
});

const updateTourMemberSchema = z.object({
  memberIds: z.array(z.string()).min(1).optional(),
  tourPackageId: z.string().optional(),
  packagePrice: z.number().min(0).optional(),
  memberCount: z.number().int().min(1).optional(),
  netCost: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  paymentType: z.enum(["ONE_TIME", "EMI", "PARTIAL"]).optional(),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "FAILED"]).optional(),
  nextReminder: z.string().datetime().optional(),
  lastReminder: z.string().datetime().optional(),
  reminderCount: z.number().int().min(0).optional(),
  extra: z.object().optional(),
  status: z.string().optional(),
});

const addPaymentSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  note: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "FAILED"]).default("PAID"),
});

const updatePaymentSchema = z.object({
  amount: z.number().min(0.01).optional(),
  paymentMethod: z.string().min(1).optional(),
  note: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "FAILED"]).optional(),
});

const getTourMembersQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().int().min(1))
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().int().min(1).max(100))
    .default("10"),
  sortBy: z
    .enum(["createdAt", "updatedAt", "totalCost", "memberCount"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "FAILED"]).optional(),
  paymentType: z.enum(["ONE_TIME", "EMI", "PARTIAL"]).optional(),
  search: z.string().optional(),
  tourPackageId: z.string().optional(),
  status: z.string().optional(),
});

export {
  createTourMemberSchema,
  updateTourMemberSchema,
  addPaymentSchema,
  updatePaymentSchema,
  getTourMembersQuerySchema,
};
