// middleware/validate.middleware.js
import { ZodError } from "zod";
import { errorResponse } from "../utils/response.js";

/**
 * Middleware to validate request data using Zod schemas
 */
export const validate = (schema, source = "body") => {
  return async (req, res, next) => {
    try {
      // Get the data to validate based on source
      const dataToValidate = req[source];

      // Validate and parse the data
      const validatedData = await schema.parseAsync(dataToValidate);

      // Replace the request data with validated data
      req[source] = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Validation failed",
          errors,
        });
      }

      // Handle other errors
      return errorResponse(res, 500, "Internal server error during validation");
    }
  };
};
