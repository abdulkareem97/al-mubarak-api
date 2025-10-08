import * as authService from "../services/auth.service.js";

import { successResponse, errorResponse } from "../utils/response.js";

export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const user = await authService.registerUser(email, password, name, role);
    successResponse(res, 201, "User created", { id: user.id, email: user.email, role: user.role });
  } catch (err) {
    errorResponse(res, 400, err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    successResponse(res, 200, "User logged in", result);
  } catch (err) {
    errorResponse(res, 401, err.message);
  }
};

