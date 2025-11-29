const User = require("../models/User");
const Hospital = require("../models/Hospital");

/* ---------------------------------------------------
   1. GET ALL CATEGORIES FROM ALL HOSPITALS
--------------------------------------------------- */
const getCategories = async (req, res) => {
  try {
    const hospitals = await Hospital.find().select("categories name");

    const allCategories = [];

    hospitals.forEach(h => {
      h.categories.forEach(c => {
        allCategories.push({
          _id: c._id,
          name: c.name,
          description: c.description,
          hospitalId: h._id,
          hospitalName: h.name
        });
      });
    });

    res.status(200).json(allCategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   2. GET DOCTORS BY CATEGORY
--------------------------------------------------- */
const getDoctorsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) return res.status(400).json({ message: "CategoryId required" });

    const doctors = await User.find({
      role: "doctor",
      selectedCategory: categoryId,
      status: "ACTIVE"
    }).select("_id firstName lastName email profilePic specialization");

    const formatted = doctors.map(d => ({
      _id: d._id,
      name: d.name || `${d.firstName || ""} ${d.lastName || ""}`.trim(),
      email: d.email,
      profilePic: d.profilePic || "",
      specialization: d.specialization || ""
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   3. CREATE APPOINTMENT
--------------------------------------------------- */
const createAppointment = async (req, res) => {
  try {
    const { userId, doctorId, categoryId, hospitalId, date, time, description } = req.body;

    if (!userId || !doctorId || !categoryId || !date || !time)
      return res.status(400).json({ message: "Missing required fields" });

    const user = await User.findById(userId);
    const doctor = await User.findById(doctorId);

    if (!user || !doctor) return res.status(404).json({ message: "User or Doctor not found" });

    const appointment = {
      user: user._id,
      doctor: doctor._id,
      category: categoryId,
      hospital: hospitalId || null,
      date,
      time,
      description,
      status: "PENDING"
    };

    user.appointments.unshift(appointment);
    await user.save();

    res.status(200).json({ message: "Appointment booked", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   4. GET AVAILABLE SLOTS FOR DOCTOR ON DATE
--------------------------------------------------- */
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    if (!doctorId || !date) return res.status(400).json({ message: "DoctorId & date required" });

    const userWithAppointments = await User.find({ "appointments.doctor": doctorId });
    const bookedSlots = [];

    userWithAppointments.forEach(u => {
      u.appointments.forEach(a => {
        if (a.doctor.toString() === doctorId && a.date === date) {
          bookedSlots.push(a.time);
        }
      });
    });

    const allSlots = [];
    for (let h = 9; h < 17; h++) {
      allSlots.push(`${h.toString().padStart(2, "0")}:00`);
      allSlots.push(`${h.toString().padStart(2, "0")}:30`);
    }

    const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));

    res.status(200).json({ date, availableSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   5. GET USER'S APPOINTMENTS
--------------------------------------------------- */
const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "UserId required" });

    const user = await User.findById(userId)
      .populate("appointments.doctor", "name email profilePic specialization")
      .populate("appointments.category", "name")
      .populate("appointments.hospital", "name");

    res.status(200).json(user.appointments || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   6. DELETE APPOINTMENT
--------------------------------------------------- */
const deleteAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.params;
    if (!userId || !appointmentId) return res.status(400).json({ message: "Missing ids" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.appointments = user.appointments.filter(a => a._id.toString() !== appointmentId);
    await user.save();

    res.status(200).json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCategories,
  getDoctorsByCategory,
  createAppointment,
  getAvailableSlots,
  getUserAppointments,
  deleteAppointment
};
