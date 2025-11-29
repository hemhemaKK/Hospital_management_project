const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Helper to send email
const sendEmail = async (to, subject, html) => {
  await sgMail.send({ to, from: process.env.EMAIL_FROM, subject, html });
};

// ---------- FORGOT PASSWORD ----------
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

  // Check both User and Hospital
  let account = await User.findOne({ email }) || await Hospital.findOne({ email });
  if (!account) return res.status(404).json({ msg: "Email not found" });

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  account.resetPasswordToken = token;
  account.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await account.save();

  // Send email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const html = `<p>Click <a href="${resetUrl}">here</a> to reset your password. Token valid for 1 hour.</p>`;
  await sendEmail(account.email, "Reset Your Password", html);

  res.json({ msg: "Password reset email sent" });
};

// ---------- RESET PASSWORD ----------
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ msg: "Token and new password required" });

  // Find account with token and valid expiry
  let account = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }) ||
                await Hospital.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

  if (!account) return res.status(400).json({ msg: "Invalid or expired token" });

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  account.password = hashedPassword;

  // Clear token
  account.resetPasswordToken = undefined;
  account.resetPasswordExpires = undefined;

  await account.save();

  res.json({ msg: "Password reset successful" });
};
