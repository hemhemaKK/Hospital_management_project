const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");

dotenv.config();
// Import routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes"); 
const reviewRoutes = require("./routes/reviewRoutes")
const employeeRoutes = require("./routes/doctorRoutes")
const complaintsRoutes = require("./routes/complaintRoutes")
const chatbotRoutes = require("./routes/chatRoutes")
const superadminRoutes = require("./routes/superadminRoutes")
const hospitalRoutes = require("./routes/hospitalRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const nurseRoutes = require("./routes/nurseRoutes");

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // ADD THIS!
  })
);


app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes); 
app.use("/api/review", reviewRoutes);
app.use("/api/doctor", employeeRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.use("/api/superadmin", superadminRoutes)
app.use("/api/hospital", hospitalRoutes);
app.use("/api/password", passwordRoutes);

app.use("/api/nurse", nurseRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("✅ Make my city Backend is running!");
});

// MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
  });
})
.catch((err) => {
  console.error("❌ DB connection failed:", err.message);
});