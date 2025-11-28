const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOtpEmail = async (to, otp) => {
  const msg = {
    to,
    from: process.env.EMAIL_FROM, // verified sender
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
    html: `<p>Your OTP code is <strong>${otp}</strong></p>`,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ OTP sent to", to);
  } catch (err) {
    console.error("❌ SendGrid error:", err);
  }
};

module.exports = { sendOtpEmail };
