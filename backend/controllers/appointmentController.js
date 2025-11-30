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

    if (!userId || !doctorId || !categoryId || !date || !time) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 1️⃣ Find both user and doctor
    const user = await User.findById(userId);
    const doctor = await User.findById(doctorId);

    if (!user || !doctor) {
      return res.status(404).json({ message: "User or doctor not found" });
    }

    // 2️⃣ Build appointment object
    const appointment = {
      user: user._id,
      doctor: doctor._id,
      category: categoryId,
      hospital: user.selectedHospital,
      date,
      time,
      description,
      status: "PENDING",
      createdAt: new Date(),
    };

    // 3️⃣ SAFETY CHECK: If arrays do not exist, create them
    if (!Array.isArray(user.appointments)) user.appointments = [];
    if (!Array.isArray(doctor.appointments)) doctor.appointments = [];

    // 4️⃣ Save inside USER
    user.appointments.unshift(appointment);
    await user.save();

    // 5️⃣ Save inside DOCTOR
    doctor.appointments.unshift(appointment);
    await doctor.save();

    return res.status(200).json({
      message: "Appointment successfully saved",
      appointment,
    });

  } catch (err) {
    console.error("CREATE APPT ERROR:", err);
    return res.status(500).json({ message: err.message });
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
      .populate("appointments.category", "name")
      .populate("appointments.nurse", "name email profilePic");  // ⭐ FIXED

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
    const { action, nurseId } = req.body;

    const doctor = await User.findById(doctorId);
    const appt = doctor.appointments.id(appointmentId);

    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    /* ---- APPOINTMENT LOGIC ---- */

    if (action === "accept") appt.status = "DOCTOR_ACCEPTED";

    if (action === "reject") appt.status = "REJECTED";

    /* ⭐ ASSIGN NURSE */
    if (action === "assign_nurse") {
      appt.nurse = nurseId;
      appt.status = "NURSE_ASSIGNED";

      const nurse = await User.findById(nurseId);

      if (nurse) {
        // Store SAME appointment ID inside nurse
        nurse.appointments.unshift({
          _id: appointmentId,
          user: appt.user,
          doctor: appt.doctor,
          nurse: nurseId,
          category: appt.category,
          hospital: appt.hospital,
          date: appt.date,
          time: appt.time,
          description: appt.description,
          status: "NURSE_ASSIGNED",
        });

        await nurse.save();
      }
    }

    if (action === "nurse_complete") appt.status = "NURSE_COMPLETED";

    if (action === "complete") appt.status = "DOCTOR_COMPLETED";

    await doctor.save();

    /* ---- UPDATE USER ---- */
    const user = await User.findById(appt.user);
    const userAppt = user.appointments.id(appointmentId);

    if (userAppt) {
      userAppt.status = appt.status;

      if (nurseId) {
        userAppt.nurse = nurseId;
      }
    }

    await user.save();

    return res.status(200).json({ message: "Updated", appointment: appt });

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
    const hospitalId = req.user.selectedHospital;  // receptionist's hospital

    if (!hospitalId) {
      return res.status(400).json({ message: "Receptionist has no hospital assigned" });
    }

    // ⭐ Fetch only USERS from this hospital
    const users = await User.find({
      role: "user",
      selectedHospital: hospitalId
    })
      .populate("appointments.doctor", "name email profilePic")
      .populate("appointments.category", "name")
      .lean();

    let allAppointments = [];

    users.forEach(user => {
      (user.appointments || []).forEach(appt => {
        if (appt.hospital?.toString() === hospitalId.toString()) {
          allAppointments.push({
            ...appt,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              profilePic: user.profilePic
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

/* -------------------------------------------
   GET NURSE APPOINTMENTS (ONLY THEIR OWN)
-------------------------------------------- */
const getNurseAppointments = async (req, res) => {
  try {
    const nurseId = req.user._id;

    const nurse = await User.findById(nurseId)
      .populate("appointments.user", "name email profilePic")
      .populate("appointments.doctor", "name email profilePic")
      .populate("appointments.category", "name");

    res.status(200).json(nurse.appointments || []);
  } catch (err) {
    console.error("getNurseAppointments ERROR:", err);
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
  getReceptionistAppointments,
  getNurseAppointments
};
