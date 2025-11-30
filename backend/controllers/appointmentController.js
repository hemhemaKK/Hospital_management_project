const User = require("../models/User");
const Hospital = require("../models/Hospital");

/* -------------------------------------------
   1. GET ALL CATEGORIES (TENANT FILTERED)
-------------------------------------------- */
const getCategories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.selectedHospital) {
      return res.status(400).json({ message: "User has no hospital" });
    }

    const hospital = await Hospital.findById(user.selectedHospital)
      .select("categories");

    res.status(200).json(hospital.categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/* -------------------------------------------
   2. GET DOCTORS BY CATEGORY
-------------------------------------------- */
const getDoctorsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const tenantId = req.user.selectedHospitalTenantId;  // 🔥 important

    const doctors = await User.find({
      role: "doctor",
      selectedCategory: categoryId,
      selectedHospitalTenantId: tenantId,   // 🔥 required
      isVerified: true,
      status: "ACTIVE"
    })
    .select("name email profilePic selectedCategory");
    console.log(doctors)
    res.status(200).json(doctors);
  } catch (err) {
    console.error("getDoctorsByCategory error:", err);
    res.status(500).json({ message: err.message });
  }
};


/* -------------------------------------------
   3. CREATE APPOINTMENT
-------------------------------------------- */
const createAppointment = async (req, res) => {
  try {
    const { userId, doctorId, categoryId, date, time, description } = req.body;

    if (!userId || !doctorId || !categoryId || !date || !time)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findById(userId);
    const doctor = await User.findById(doctorId);

    if (!user || !doctor) return res.status(404).json({ message: "User or doctor not found" });

    const appointment = {
      user: userId,
      doctor: doctorId,
      category: categoryId,
      hospital: user.selectedHospital,
      date,
      time,
      description,
      status: "PENDING"
    };

    user.appointments.unshift(appointment);
    await user.save();

    res.status(200).json({ message: "Appointment Booked", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------
   4. GET AVAILABLE SLOTS
-------------------------------------------- */
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    const users = await User.find({ "appointments.doctor": doctorId });

    const booked = [];
    users.forEach(u => {
      u.appointments.forEach(a => {
        if (a.date === date && a.doctor.toString() === doctorId) {
          booked.push(a.time);
        }
      });
    });

    const slots = [];
    for (let h = 9; h < 17; h++) {
      slots.push(`${h}:00`);
      slots.push(`${h}:30`);
    }

    const free = slots.filter(s => !booked.includes(s));

    res.status(200).json(free);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------
   5. GET USER APPOINTMENTS
-------------------------------------------- */
const getUserAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("appointments.doctor", "name email profilePic")
      .populate("appointments.category", "name");

    res.status(200).json(user.appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------
   6. DELETE APPOINTMENT
-------------------------------------------- */
const deleteAppointment = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    user.appointments = user.appointments.filter(
      a => a._id.toString() !== req.params.appointmentId
    );

    await user.save();

    res.status(200).json({ message: "Appointment removed" });
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
