import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // ----- CASE 1: Hospital Admin -----
    if (payload.role === "admin") {

      const hospital = await Hospital.findById(payload.id).select("-password");
      if (!hospital)
        return res.status(401).json({ message: "Hospital not found" });

      req.user = {
        id: hospital._id,
        email: hospital.email,
        role: "admin",
        name: hospital.hospitalName,
        tenantId: hospital.tenantId // ⭐ SUPER IMPORTANT
      };

      return next();
    }

    // ----- CASE 2: Regular Users -----
    const user = await User.findById(payload.id).select("-password -otp");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
