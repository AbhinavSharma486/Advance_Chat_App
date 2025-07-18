import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import { editMessage, getMessages, getUsersForSidebar, reactToMessage, sendMessage } from "../controllers/message.controller.js";


const router = express.Router();

router.get("/user", protectRoute, getUsersForSidebar);

router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

router.post("/react/:messageId", protectRoute, reactToMessage);

router.put("/edit/:messageId", protectRoute, editMessage);

export default router;