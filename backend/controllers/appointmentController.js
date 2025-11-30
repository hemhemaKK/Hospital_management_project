// controllers/appointmentController.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Hospital = require("../models/Hospital");

/* ========================================================
   1. GET CATEGORY LIST
======================================================== */
const getCategories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.selectedHospital) {
      return res.status(400).json({ message: "User has no hospital" });
    }

    const hospital = await Hospital.findById(user.selectedHospital)
      .select("categories");

    return res.status(200).json(hospital.categories || []);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   2. GET DOCTORS BY CATEGORY
======================================================== */
const getDoctorsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const doctors = await User.find({
      role: "doctor",
      selectedCategory: categoryId,
      selectedHospital: req.user.selectedHospital,
      isVerified: true,
      status: "ACTIVE",
    }).select("firstName lastName name email profilePic selectedCategory");

    return res.status(200).json(doctors);
  } catch (err) {
    console.error("getDoctorsByCategory ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   3. CREATE APPOINTMENT
======================================================== */
const createAppointment = async (req, res) => {
  try {
    const { userId, doctorId, categoryId, date, time, description } = req.body;

    if (!userId || !doctorId || !categoryId || !date || !time) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findById(userId);
    const doctor = await User.findById(doctorId);

    if (!user || !doctor) {
      return res.status(404).json({ message: "User or doctor not found" });
    }

    const apptId = new mongoose.Types.ObjectId();

    const appointment = {
      _id: apptId,
      user: user._id,
      doctor: doctor._id,
      category: new mongoose.Types.ObjectId(categoryId),
      hospital: user.selectedHospital,
      date,
      time,
      description,
      status: "PENDING",
      createdAt: new Date(),
    };

    user.appointments.unshift(appointment);
    doctor.appointments.unshift(appointment);

    await user.save();
    await doctor.save();

    return res.status(200).json({
      message: "Appointment created successfully",
      appointment,
    });
  } catch (err) {
    console.error("CREATE APPT ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   4. GET AVAILABLE SLOTS
======================================================== */
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    const users = await User.find({ "appointments.doctor": doctorId });

    const booked = [];

    users.forEach((u) => {
      u.appointments.forEach((a) => {
        if (a.date === date && String(a.doctor) === String(doctorId)) {
          booked.push(a.time);
        }
      });
    });

    const slots = [];
    for (let h = 9; h < 17; h++) {
      slots.push(`${h}:00`);
      slots.push(`${h}:30`);
    }

    const availableSlots = slots.filter((s) => !booked.includes(s));

    return res.status(200).json({ availableSlots, bookedSlots: booked });
  } catch (err) {
    console.error("getAvailableSlots ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   5. GET USER APPOINTMENTS
======================================================== */
const getUserAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("appointments.doctor", "firstName lastName name email profilePic")
      .populate("appointments.category", "name")
      .populate("appointments.nurse", "firstName lastName name email profilePic");

    return res.status(200).json(user.appointments || []);
  } catch (err) {
    console.error("getUserAppointments ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   6. DELETE USER APPOINTMENT
======================================================== */
const deleteAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.params;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const appt = user.appointments.id(appointmentId);
    const doctorId = appt?.doctor;
    const nurseId = appt?.nurse;

    user.appointments = user.appointments.filter(
      (a) => String(a._id) !== appointmentId
    );
    await user.save();

    if (doctorId) {
      const doc = await User.findById(doctorId);
      if (doc) {
        doc.appointments = doc.appointments.filter(
          (a) => String(a._id) !== appointmentId
        );
        await doc.save();
      }
    }

    if (nurseId) {
      const nurse = await User.findById(nurseId);
      if (nurse) {
        nurse.appointments = nurse.appointments.filter(
          (a) => String(a._id) !== appointmentId
        );
        await nurse.save();
      }
    }

    return res.status(200).json({ message: "Appointment removed" });
  } catch (err) {
    console.error("deleteAppointment ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   7. GET DOCTOR'S OWN APPOINTMENTS
======================================================== */
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id)
      .populate("appointments.user", "firstName lastName name email profilePic")
      .populate("appointments.category", "name")
      .populate("appointments.nurse", "firstName lastName name email profilePic");

    return res.status(200).json(doctor.appointments || []);
  } catch (err) {
    console.error("getDoctorAppointments ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   8. UPDATE APPOINTMENT STATUS
======================================================== */
const updateAppointmentStatus = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);
    const { appointmentId } = req.params;
    const { action, nurseId } = req.body;

    const appt = doctor.appointments.id(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (action === "accept") appt.status = "DOCTOR_ACCEPTED";
    else if (action === "reject") appt.status = "REJECTED";
    else if (action === "assign_nurse") {
      if (!nurseId) return res.status(400).json({ message: "nurseId required" });
      appt.nurse = nurseId;
      appt.status = "NURSE_ASSIGNED";
    } else if (action === "nurse_complete") appt.status = "NURSE_COMPLETED";
    else if (action === "complete") appt.status = "DOCTOR_COMPLETED";

    await doctor.save();

    const user = await User.findById(appt.user);
    if (user) {
      const userCopy = user.appointments.id(appointmentId);
      if (userCopy) {
        userCopy.status = appt.status;
        if (appt.nurse) userCopy.nurse = appt.nurse;
      }
      await user.save();
    }

    return res.status(200).json({ message: "Updated", appointment: appt });
  } catch (err) {
    console.error("updateAppointmentStatus ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   9. RECEPTIONIST: FULL HOSPITAL APPOINTMENTS
======================================================== */
const getReceptionistAppointments = async (req, res) => {
  try {
    const hospitalId = req.user.selectedHospital;

    const users = await User.find({
      role: "user",
      selectedHospital: hospitalId,
    })
      .populate("appointments.doctor", "name email profilePic")
      .populate("appointments.category", "name")
      .lean();

    let allAppointments = [];

    users.forEach((u) => {
      (u.appointments || []).forEach((a) => {
        allAppointments.push({
          ...a,
          user: {
            _id: u._id,
            name: u.name,
            email: u.email,
            profilePic: u.profilePic,
          },
        });
      });
    });

    return res.status(200).json(allAppointments);
  } catch (err) {
    console.error("Receptionist ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   10. NURSE: OWN APPOINTMENTS
======================================================== */
const getNurseAppointments = async (req, res) => {
  try {
    const nurse = await User.findById(req.user._id)
      .populate("appointments.user", "name email profilePic")
      .populate("appointments.doctor", "name email profilePic")
      .populate("appointments.category", "name");

    return res.status(200).json(nurse.appointments || []);
  } catch (err) {
    console.error("getNurseAppointments ERROR:", err);
    return res.status(500).json({ message: err.message });
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
  getReceptionistAppointments,
  getNurseAppointments,
};
