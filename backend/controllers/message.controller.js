import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";


export const getUsersForSidebar = async (req, res) => {

  try {
    const loggedInUserId = req.user.id;

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);

  } catch (error) {
    console.log("Error in getUsersForSidebar controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {

  try {
    const { id: userToChatId } = req.params;

    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ]
    });

    res.status(200).json(messages);

  } catch (error) {
    console.log("Error in getMessages controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {

  try {
    const { text, image } = req.body;

    const { id: receiverId } = req.params;

    const senderId = req.user.id;

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // realtime functionality goes here -> socket.io
    const receiverSocketIds = getReceiverSocketId(receiverId);
    if (receiverSocketIds) {
      const socketIdsArray = Array.isArray(receiverSocketIds) ? receiverSocketIds : [receiverSocketIds];

      socketIdsArray.forEach(socketId => {
        io.to(socketId).emit("newMessage", newMessage);
      });
    }

    res.status(200).json(newMessage);

  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Find if user already reacted
    const existingReaction = message.reactions.find(r => r.userId.toString() === userId);

    if (existingReaction) {

      if (existingReaction.emoji === emoji) {

        // Same emoji: remove reaction (toggle off)
        message.reactions = message.reactions.filter(r => r.userId.toString() !== userId);
      } else {
        // Different emoji: update to new emoji
        existingReaction.emoji = emoji;
      }
    }
    else {
      // No previous reaction: add new
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Real time update
    const receiverSocketIds = getReceiverSocketId(message.receiverId.toString());

    if (receiverSocketIds) {
      const socketIdsArray = Array.isArray(receiverSocketIds) ? receiverSocketIds : [receiverSocketIds];

      socketIdsArray.forEach(socketId => {
        io.to(socketId).emit("messageReaction", { messageId, reactions: message.reactions });
      });
    }

    io.to(req.user.id).emit("messageReaction", { messageId, reactions: message.reactions });

    res.status(200).json({ messageId, reactions: message.reactions });
  } catch (error) {
    console.log("Error in reactToMessage controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.senderId.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });

    message.text = text;
    message.edited = true;
    message.editedAt = new Date();

    await message.save();

    // Real time update
    const receiverSocketIds = getReceiverSocketId(message.receiverId.toString());

    if (receiverSocketIds) {
      const socketIdsArray = Array.isArray(receiverSocketIds) ? receiverSocketIds : [receiverSocketIds];

      socketIdsArray.forEach(socketId => {
        io.to(socketId).emit("messageEdited", { messageId, test, edited: true, editedAt: message.editedAt });
      });
    }

    io.to(req.user.id).emit("messageEdited", { messageId, text, edited: true, editedAt: message.editedAt });

    res.status(200).json({ messageId, text, edited: true, editedAt: message.editedAt });
  } catch (error) {
    console.log("Error in editMessage controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.senderId.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });

    // soft delete: replace text with 'Message deleted'
    message.text = "Message deleted";
    message.image = undefined;
    message.edited = false;
    message.editedAt = undefined;

    await message.save();

    // Real time update
    const receiverSocketIds = getReceiverSocketId(message.receiverId.toString());

    if (receiverSocketIds) {
      const socketIdsArray = Array.isArray(receiverSocketIds) ? receiverSocketIds : [receiverSocketIds];

      socketIdsArray.forEach(socketId => {
        io.to(socketId).emit("messageDeleted", { messageId: message._id });
      });
    }

    io.to(req.user.id).emit("messageDeleted", { messageid: message._id });

    res.status(200).json({ messageId: message._id });
  } catch (error) {
    console.log("Error in deleteMessage controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};