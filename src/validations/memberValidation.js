import { z } from "zod";
import { id } from "zod/locales";

export const memberCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),

  mobileNo: z
    .string()
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),

  address: z
    .string()
    .min(1, "Address must be at least 1 characters long")
    .max(500, "Address must not exceed 500 characters"),

  user: z.any(),
  extra: z.record(z.any()).optional(),
});

export const memberUpdateSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must not exceed 100 characters")
      .optional(),

    mobileNo: z
      .string()
      .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
      .optional(),

    address: z
      .string()
      .min(5, "Address must be at least 5 characters long")
      .max(500, "Address must not exceed 500 characters")
      .optional(),

    extra: z.record(z.any()).optional(),

    replaceDocuments: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const memberQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  name: z.string().optional(),
  mobileNo: z.string().optional(),
  userid: z.string().optional(),
});
