const User = require("../models/User");
const Hospital = require("../models/Hospital");

/* -------------------------------------------
   1. GET ALL CATEGORIES FOR USER
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
    const tenantId = req.user.selectedHospitalTenantId;

    const doctors = await User.find({
      role: "doctor",
      selectedCategory: categoryId,
      selectedHospitalTenantId: tenantId,
      isVerified: true,
      status: "ACTIVE"
    }).select("name email profilePic selectedCategory");

    res.status(200).json(doctors);
  } catch (err) {
    console.error("getDoctorsByCategory error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------
   3. CREATE APPOINTMENT (SAVE TO BOTH)
-------------------------------------------- */
const createAppointment = async (req, res) => {
  try {
    const { userId, doctorId, categoryId, date, time, description } = req.body;

    if (!userId || !doctorId || !categoryId || !date || !time)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findById(userId);
    const doctor = await User.findById(doctorId);

    if (!user || !doctor)
      return res.status(404).json({ message: "User or doctor not found" });

    const appointment = {
      user: userId,
      doctor: doctorId,
      category: categoryId,
      hospital: user.selectedHospital,
      date,
      time,
      description,
      status: "PENDING",
    };

    // ⭐ Save in USER and DOCTOR
    user.appointments.unshift(appointment);
    doctor.appointments.unshift(appointment);

    await user.save();
    await doctor.save();

    res.status(200).json({
      message: "Appointment booked successfully",
      appointment,
    });

  } catch (err) {
    console.error("CREATE APPT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------
   4. GET AVAILABLE SLOTS
-------------------------------------------- */
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // Find all users who have appointments with this doctor
    const users = await User.find({ "appointments.doctor": doctorId });

    const booked = [];
    users.forEach((u) => {
      u.appointments.forEach((a) => {
        if (a.date === date && a.doctor.toString() === doctorId) {
          booked.push(a.time);
        }
      });
    });

    // All possible slots (9:00 - 16:30)
    const slots = [];
    for (let h = 9; h < 17; h++) {
      slots.push(`${h}:00`);
      slots.push(`${h}:30`);
    }

    // Available slots = slots not booked
    const availableSlots = slots.filter((s) => !booked.includes(s));

    res.status(200).json({
      availableSlots,
      bookedSlots: booked, // 🔥 new field for frontend to disable booked ones
    });
  } catch (err) {
    console.error("getAvailableSlots ERROR:", err);
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
   6. DELETE APPOINTMENT (USER SIDE)
-------------------------------------------- */
const deleteAppointment = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const doctor = await User.findById(user.appointments.find(a => a._id.toString() === req.params.appointmentId)?.doctor);

    user.appointments = user.appointments.filter(
      a => a._id.toString() !== req.params.appointmentId
    );

    if (doctor) {
      doctor.appointments = doctor.appointments.filter(
        a => a._id.toString() !== req.params.appointmentId
      );
      await doctor.save();
    }

    await user.save();

    res.status(200).json({ message: "Appointment removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------
   7. GET LOGGED-IN DOCTOR APPOINTMENTS
-------------------------------------------- */
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id)
      .populate("appointments.user", "name email profilePic")
      .populate("appointments.category", "name");

    return res.status(200).json(doctor.appointments);
  } catch (err) {
    console.error("getDoctorAppointments ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------
   8. UPDATE APPOINTMENT STATUS
-------------------------------------------- */
const updateAppointmentStatus = async (req, res) => {
  try {
    const doctorId = req.user._id.toString();
    const appointmentId = req.params.appointmentId;
    const { action } = req.body;

    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Find appointment in doctor array
    const appt = doctor.appointments.id(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    // Update status
    if (action === "accept") appt.status = "DOCTOR_ACCEPTED";
    if (action === "reject") appt.status = "REJECTED";
    if (action === "complete") appt.status = "DOCTOR_COMPLETED";

    await doctor.save();

    // Update same appointment for USER
    const user = await User.findById(appt.user);
    const userAppt = user.appointments.id(appointmentId);
    if (userAppt) userAppt.status = appt.status;
    await user.save();

    res.status(200).json({
      message: "Status updated successfully",
      appointment: appt,
    });

  } catch (err) {
    console.error("updateAppointmentStatus ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ----------------------------------------------------
   GET ALL APPOINTMENTS FOR RECEPTIONIST (HOSPITAL WIDE)
----------------------------------------------------- */
const getReceptionistAppointments = async (req, res) => {
  try {
    const hospitalId = req.user.selectedHospital;   // ⭐ Receptionist hospital

    if (!hospitalId) {
      return res.status(400).json({ message: "Receptionist has no hospital assigned" });
    }

    // Find all users who have appointments under the same hospital
    const users = await User.find({ "appointments.hospital": hospitalId })
      .populate("appointments.user", "name email profilePic")
      .populate("appointments.doctor", "name email")
      .populate("appointments.category", "name");

    let allAppointments = [];

    users.forEach(user => {
      user.appointments.forEach(appt => {
        if (appt.hospital && appt.hospital.toString() === hospitalId.toString()) {
          allAppointments.push({
            ...appt.toObject(),
            user: {
              _id: user._id,
              name: user.name,
              email: user.email
            }
          });
        }
      });
    });

    res.status(200).json(allAppointments);
  } catch (err) {
    console.error("Receptionist Appointment Fetch ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getCategories,
  getDoctorsByCategory,
  createAppointment,
  getAvailableSlots,
  getUserAppointments,
  deleteAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getReceptionistAppointments 
};
