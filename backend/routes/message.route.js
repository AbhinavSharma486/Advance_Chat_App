import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import { deleteMessage, editMessage, getMessages, getUsersForSidebar, markMessagesAsSeen, reactToMessage, sendMessage, getLastMessagesForSidebar, clearChatForUser } from "../controllers/message.controller.js";


const router = express.Router();

router.get("/user", protectRoute, getUsersForSidebar);

router.get("/last-messages", protectRoute, getLastMessagesForSidebar);

router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

router.post("/react/:messageId", protectRoute, reactToMessage);

router.put("/edit/:messageId", protectRoute, editMessage);

router.delete("/delete/:messageId", protectRoute, deleteMessage);

router.post("/seen", protectRoute, markMessagesAsSeen);

router.delete("/clear/:chatId", protectRoute, clearChatForUser);

export default router;