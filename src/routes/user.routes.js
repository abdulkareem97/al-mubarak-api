import express from "express";
import * as authController from "../controllers/auth.controller.js";


const router = express.Router();



router.post("/register", authController.register);
router.post("/login", authController.login);

// Only logged-in users can see this
// router.get("/", authMiddleware, userController.getUsers);



// router.post("/", userController.);

// Only ADMIN can delete users
// router.delete("/:id", authMiddleware, authorizeRoles(USER_ROLES.ADMIN), userController.deleteUser);

export default router;
