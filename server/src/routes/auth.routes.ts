import { Router } from "express";
import { body } from "express-validator";
import { forgotPassword, login, register, resetPassword, verifyEmail } from "../controllers/auth.controller.js";
import { loginRules, registerRules } from "../validators/auth.validator.js";

export const authRouter = Router();

authRouter.post("/register", registerRules, register);
authRouter.post("/login", loginRules, login);
authRouter.post("/forgot-password", body("email").isEmail(), forgotPassword);
authRouter.post("/reset-password", body("token").notEmpty(), body("password").isLength({ min: 8 }), resetPassword);
authRouter.post("/verify-email", body("token").notEmpty(), verifyEmail);
