const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messages");
const { CheckLogin } = require("../utils/authHandler"); // Middleware kiểm tra đăng nhập
const { uploadAll } = require("../utils/uploadHandler"); // Cấu hình upload file

// 1. LẤY LỊCH SỬ CHAT VỚI MỘT NGƯỜI (GET /api/v1/messages/:userID)
router.get("/:userID", CheckLogin, async (req, res) => {
  try {
    // Gọi hàm lấy tin nhắn giữa mình (req.user._id) và người kia (req.params.userID)
    const messages = await messageController.getMessagesWithUser(req.user._id, req.params.userID);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GỬI TIN NHẮN (POST /api/v1/messages)
// Hỗ trợ cả text (văn bản) và file (tệp tin)
router.post("/", CheckLogin, uploadAll.single("file"), async (req, res) => {
  try {
    const from = req.user._id; // Mình là người gửi
    const to = req.body.to;    // Người nhận (ID truyền từ body)
    let type = "text";         // Mặc định kiểu là văn bản
    let content = req.body.text; // Nội dung tin nhắn văn bản

    // Nếu có file đính kèm thì đổi kiểu thành "file" và lấy đường dẫn file
    if (req.file) {
      type = "file";
      content = req.file.path; 
    }

    // Lưu vào database
    const newMessage = await messageController.sendMessage(from, to, type, content);
    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. XEM TỔNG QUAN DANH SÁCH CHAT (GET /api/v1/messages)
// Hiện tin nhắn cuối cùng với mỗi người
router.get("/", CheckLogin, async (req, res) => {
  try {
    const overview = await messageController.getLastMessages(req.user._id);
    res.json(overview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
