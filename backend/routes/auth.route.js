import express from "express";
import { checkAuth, google, login, logout, signup, forgetPassword, resetPassword, verifyEmail } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/google", google);

router.post("/forget-password", forgetPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/verify-email", verifyEmail);

router.get("/check", protectRoute, checkAuth);

export default router;