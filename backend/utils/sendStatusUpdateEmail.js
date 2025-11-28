const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendStatusUpdateEmail = async (to, complaint, newStatus) => {
  const msg = {
    to,
    from: process.env.EMAIL_FROM, // your verified sender
    subject: `Update: Your Complaint Status Changed`,
    text: `Hello ${complaint.userName},\nThe status of your complaint "${complaint.problem}" has been updated to "${newStatus}".`,
    html: `<p>Hello <strong>${complaint.userName}</strong>,</p>
           <p>The status of your complaint "<strong>${complaint.problem}</strong>" has been updated to "<strong>${newStatus}</strong>".</p>
           <p>Thank you for using our service.</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Status update email sent to ${to}`);
  } catch (err) {
    console.error("❌ SendGrid error:", err.response ? err.response.body : err);
  }
};

module.exports = { sendStatusUpdateEmail };
