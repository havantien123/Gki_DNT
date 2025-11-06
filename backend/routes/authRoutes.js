// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

// ===== CẤU HÌNH UPLOAD ẢNH (avatar) =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ====== CÁC ROUTE AUTH ======

// Đăng ký
router.post("/register", upload.single("avatar"), registerUser);

// Đăng nhập
router.post("/login", loginUser);

// Lấy thông tin profile người dùng (yêu cầu token)
router.get("/profile", protect, getProfile);

// Cập nhật thông tin hoặc avatar
router.put("/profile", protect, upload.single("avatar"), updateProfile);

// ====== ADMIN ROUTES ======

// Lấy danh sách toàn bộ user (admin mới xem được)
router.get("/users", protect, admin, getAllUsers);

// Xoá user (admin)
router.delete("/users/:id", protect, admin, deleteUser);

module.exports = router;
