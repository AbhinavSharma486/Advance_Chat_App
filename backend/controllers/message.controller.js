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
      ],
      deletedFor: { $ne: myId }
    }).populate([
      { path: 'replyTo', select: 'text image senderId', populate: { path: 'senderId', select: 'fullName _id' } }
    ]);

    res.status(200).json(messages);

  } catch (error) {
    console.log("Error in getMessages controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, video, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let imageUrl, videoUrl;
    // Validate and upload image
    if (image) {
      // Check base64 header for type and size
      const matches = image.match(/^data:(image\/(png|jpeg|jpg|gif|webp));base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ message: 'Invalid image format' });
      }
      // Estimate size in bytes
      const sizeInBytes = Math.ceil((matches[3].length * 3) / 4);
      if (sizeInBytes > 5 * 1024 * 1024) {
        return res.status(400).json({ message: 'Image size must be less than 5MB' });
      }
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    // Validate and upload video
    if (video) {
      // Check base64 header for type and size
      const matches = video.match(/^data:(video\/(mp4|webm|ogg));base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ message: 'Invalid video format' });
      }
      // Estimate size in bytes
      const sizeInBytes = Math.ceil((matches[3].length * 3) / 4);
      if (sizeInBytes > 5 * 1024 * 1024) {
        return res.status(400).json({ message: 'Video size must be less than 5MB' });
      }
      const uploadResponse = await cloudinary.uploader.upload(video, { resource_type: 'video' });
      videoUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
      replyTo: replyTo || null,
    });

    await newMessage.save();

    await newMessage.populate([
      { path: 'replyTo', select: 'text image video senderId', populate: { path: 'senderId', select: 'fullName _id' } }
    ]);

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
        io.to(socketId).emit("messageEdited", {
          messageId,
          text,
          edited: true,
          editedAt: message.editedAt,
          senderId: message.senderId,
          receiverId: message.receiverId
        });
      });
    }

    io.to(req.user.id).emit("messageEdited", {
      messageId,
      text,
      edited: true,
      editedAt: message.editedAt,
      senderId: message.senderId,
      receiverId: message.receiverId
    });

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

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: "No message Ids provided" });
    }

    await Message.updateMany(
      { _id: { $in: messageIds }, seen: { $ne: userId } },
      { $push: { seen: userId }, $set: { seenAt: new Date() } }
    );

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    console.log("Error in markMessagesAsSeen controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get last message for each user for sidebar preview
export const getLastMessagesForSidebar = async (req, res) => {
  try {
    const myId = req.user.id;
    // Get all users except self
    const users = await User.find({ _id: { $ne: myId } }).select('_id');
    // For each user, get the last message between myId and user._id
    const results = await Promise.all(users.map(async (user) => {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: myId, receiverId: user._id },
          { senderId: user._id, receiverId: myId }
        ]
      })
        .sort({ createdAt: -1 })
        .lean();
      return { userId: user._id, lastMessage };
    }));
    res.status(200).json(results);
  } catch (error) {
    console.log('Error in getLastMessagesForSidebar', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Clear chat for a user (delete all messages in a chat for the sender only)
export const clearChatForUser = async (req, res) => {
  try {
    const { chatId } = req.params; // chatId is the other user's id
    const userId = req.user.id;

    // Find all messages between userId and chatId
    const result = await Message.updateMany(
      {
        $or: [
          { senderId: userId, receiverId: chatId },
          { senderId: chatId, receiverId: userId }
        ],
        deletedFor: { $ne: userId }
      },
      { $addToSet: { deletedFor: userId } }
    );

    res.status(200).json({ message: 'Chat cleared for user', modifiedCount: result.modifiedCount });
  } catch (error) {
    console.log('Error in clearChatForUser controller', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};