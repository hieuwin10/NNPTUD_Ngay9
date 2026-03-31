const messageModel = require("../schemas/messages");
const mongoose = require("mongoose");

module.exports = {
  // get all messages between current user and target user
  getMessagesWithUser: async function (currentUserId, targetUserId) {
    try {
      return await messageModel.find({
        $or: [
          { from: currentUserId, to: targetUserId },
          { from: targetUserId, to: currentUserId }
        ]
      }).sort({ createdAt: 1 });
    } catch (error) {
      throw error;
    }
  },

  // send a message (text or file)
  sendMessage: async function (from, to, type, content) {
    try {
      const newMessage = new messageModel({
        from: from,
        to: to,
        messageContent: {
          type: type,
          text: content
        }
      });
      return await newMessage.save();
    } catch (error) {
      throw error;
    }
  },

  // LẤY DANH SÁCH HỘI THOẠI MỚI NHẤT (Dùng JavaScript thuần cho dễ hiểu)
  getLastMessages: async function (currentUserId) {
    try {
      // 1. Lấy toàn bộ tin nhắn liên quan đến bạn
      // .populate('from' và 'to') để lấy luôn thông tin (tên, avatar) của người đó
      const allMessages = await messageModel.find({
        $or: [
          { from: currentUserId },
          { to: currentUserId }
        ]
      })
      .sort({ createdAt: -1 }) // Sắp xếp mới nhất lên đầu
      .populate('from to', 'username fullName avatarUrl');

      const conversations = new Map();

      // 2. Lặp qua từng tin nhắn để lọc ra tin cuối cùng với mỗi người
      allMessages.forEach(msg => {
        // Xác định xem ai là "người kia" trong cuộc hội thoại này
        const otherUser = msg.from._id.toString() === currentUserId.toString() ? msg.to : msg.from;
        const otherUserId = otherUser._id.toString();

        // Nếu chưa có tin nhắn nào với người này trong Map (vì đã xếp mới nhất lên đầu)
        // thì đây chính là tin nhắn CUỐI CÙNG với họ.
        if (!conversations.has(otherUserId)) {
          conversations.set(otherUserId, {
            user: otherUser,
            lastMessage: msg
          });
        }
      });

      // 3. Chuyển Map thành Array để trả về cho Postman
      return Array.from(conversations.values());

    } catch (error) {
      throw error;
    }
  }
};
