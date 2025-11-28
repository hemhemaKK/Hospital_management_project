import jwt from "jsonwebtoken";
import User from "../models/User.js"; // import your User model

export const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch full user from DB
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // now req.user._id exists
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
