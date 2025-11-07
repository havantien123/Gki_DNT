const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// ====== Đăng ký ======
exports.registerUser = async (req, res) => {
  console.log(" File:", req.file);
  console.log(" Body:", req.body);
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      avatar: req.file ? `/uploads/${req.file.filename}` : "",
    });

    await newUser.save();

    res.json({ message: "Đăng ký thành công", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ====== Đăng nhập ======
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ====== Lấy profile ======
exports.getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====== Cập nhật profile ======
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      if (req.file) user.avatar = `/uploads/${req.file.filename}`;
      await user.save();

      res.json({ message: "Cập nhật thành công", user });
    } else {
      res.status(404).json({ message: "Không tìm thấy user" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====== Admin: Lấy danh sách user ======
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ====== Admin: Xóa user ======
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    await user.deleteOne();
    res.json({ message: "Đã xóa user thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ====== Admin: Lấy thông tin user theo ID ======
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  console.log("Yêu cầu lấy user với ID:", id);

  // Kiểm tra ID có hợp lệ không
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("ID không hợp lệ:", id);
    return res.status(400).json({ message: "ID không hợp lệ" });
  }

  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      console.log("Không tìm thấy user với ID:", id);
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    console.log("Tìm thấy user:", user.username);
    res.json(user);
  } catch (error) {
    console.log("Lỗi khi lấy user:", error.message);
    res.status(500).json({ message: error.message });
  }
};
// ====== Admin: Cập nhật thông tin user theo ID ======
exports.updateUserById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID không hợp lệ" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.file) {
      if (user.avatar) {
        const oldPath = path.join(__dirname, "..", user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.json({ message: "Cập nhật thành công", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
