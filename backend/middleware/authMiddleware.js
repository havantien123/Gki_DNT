const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("Token decoded:", decoded);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.log("Không tìm thấy user từ token");
        return res.status(401).json({ message: "Token không hợp lệ" });
      }

      console.log(
        "User từ token:",
        req.user.username,
        "| Role:",
        req.user.role
      );
      next();
    } catch (error) {
      console.error("Token error:", error.message);
      return res
        .status(401)
        .json({ message: "Không hợp lệ hoặc hết hạn token" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, truy cập bị từ chối" });
  }
};

exports.admin = (req, res, next) => {
  console.log("Kiểm tra quyền admin:", req.user?.role);
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Chỉ admin mới được phép truy cập" });
  }
};
