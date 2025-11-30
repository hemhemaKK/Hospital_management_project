// appointmentController.js
const User = require("../models/User");
const Hospital = require("../models/Hospital");

/* ======================================================
   Helpers
====================================================== */
const pushPrescriptionToAppt = (apptDoc, prescriptionObj) => {
  if (!Array.isArray(apptDoc.prescription)) apptDoc.prescription = [];
  // deduplicate by medicineName + dosage + duration + notes
  const exists = apptDoc.prescription.some(
    (p) =>
      p.medicineName === prescriptionObj.medicineName &&
      p.dosage === prescriptionObj.dosage &&
      p.duration === prescriptionObj.duration &&
      (p.notes || "") === (prescriptionObj.notes || "")
  );
  if (!exists) apptDoc.prescription.push(prescriptionObj);
};

const findAndUpdateApptInUser = async (userId, appointmentId, updaterFn) => {
  const user = await User.findById(userId);
  if (!user) return null;
  const appt = user.appointments.id(appointmentId);
  if (!appt) return null;
  updaterFn(appt, user);
  await user.save();
  return appt;
};

/* ======================================================
   1. GET CATEGORIES BASED ON HOSPITAL
====================================================== */
const getCategories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.selectedHospital)
      return res.status(400).json({ message: "User has no hospital" });

    const hospital = await Hospital.findById(user.selectedHospital).select("categories");
    return res.status(200).json(hospital?.categories || []);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   2. GET DOCTORS BY CATEGORY
====================================================== */
const getDoctorsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const doctors = await User.find({
      role: "doctor",
      selectedCategory: categoryId,
      isVerified: true,
      status: "ACTIVE",
    }).select("name email profilePic selectedCategory");
    return res.status(200).json(doctors);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   3. CREATE APPOINTMENT
====================================================== */
const createAppointment = async (req, res) => {
  try {
    const { userId, doctorId, categoryId, date, time, description } = req.body;
    if (!userId || !doctorId || !categoryId || !date || !time)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findById(userId);
    const doctor = await User.findById(doctorId);
    if (!user || !doctor) return res.status(404).json({ message: "User or doctor not found" });

    const appointment = {
      user: user._id,
      doctor: doctor._id,
      category: categoryId,
      hospital: user.selectedHospital,
      date,
      time,
      description,
      status: "PENDING",
      prescription: [],
      createdAt: new Date(),
    };

    user.appointments.unshift(appointment);
    doctor.appointments.unshift(appointment);

    await user.save();
    await doctor.save();

    return res.status(200).json({ message: "Appointment created", appointment });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   4. GET AVAILABLE SLOTS
====================================================== */
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const users = await User.find({ "appointments.doctor": doctorId });
    const booked = [];
    users.forEach((u) => {
      (u.appointments || []).forEach((a) => {
        if (a.date === date && String(a.doctor) === doctorId) booked.push(a.time);
      });
    });

    const slots = [];
    for (let h = 9; h < 17; h++) {
      slots.push(`${h}:00`, `${h}:30`);
    }

    return res.status(200).json({
      availableSlots: slots.filter((s) => !booked.includes(s)),
      bookedSlots: booked,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   5. GET USER APPOINTMENTS
====================================================== */
const getUserAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("appointments.doctor", "name email profilePic")
      .populate("appointments.nurse", "name email profilePic");

    if (!user) return res.status(404).json({ message: "User not found" });

    const hospital = await Hospital.findById(user.selectedHospital).select("categories");

    const finalAppointments = user.appointments.map((appt) => {
      const categoryObj = hospital?.categories.find(
        (c) => String(c._id) === String(appt.category)
      );
      return { ...appt.toObject(), category: categoryObj || { name: "Unknown Category" } };
    });

    return res.status(200).json(finalAppointments);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   6. DELETE APPOINTMENT
====================================================== */
const deleteAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const appt = user.appointments.id(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    const doctor = await User.findById(appt.doctor);
    const nurse = appt.nurse ? await User.findById(appt.nurse) : null;

    user.appointments.id(appointmentId).remove();
    if (doctor) doctor.appointments.id(appointmentId)?.remove();
    if (nurse) nurse.appointments.id(appointmentId)?.remove();

    await Promise.all([user.save(), doctor?.save(), nurse?.save()]);

    return res.status(200).json({ message: "Appointment removed" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   7. GET DOCTOR APPOINTMENTS
====================================================== */
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id)
      .populate("appointments.user", "name email profilePic")
      .populate("appointments.nurse", "name email profilePic");

    const hospital = doctor.selectedHospital
      ? await Hospital.findById(doctor.selectedHospital).select("categories")
      : null;

    const modifiedAppointments = (doctor.appointments || []).map((appt) => {
      const categoryObj = hospital?.categories.find(
        (c) => String(c._id) === String(appt.category)
      );
      return { ...appt.toObject(), category: categoryObj || { name: "Unknown Category" } };
    });

    return res.status(200).json(modifiedAppointments);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   8. UPDATE APPOINTMENT STATUS + PRESCRIPTION
====================================================== */
const updateAppointmentStatus = async (req, res) => {
  try {
    const actor = await User.findById(req.user._id);
    if (!actor) return res.status(404).json({ message: "Actor not found" });

    const { appointmentId } = req.params;
    const { action, nurseId, prescription } = req.body;

    // Find doctor, user, nurse (if exists)
    const doctor = await User.findOne({ role: "doctor", "appointments._id": appointmentId }) || (actor.role === "doctor" ? actor : null);
    const userOwner = await User.findOne({ "appointments._id": appointmentId, role: { $in: ["user", "patient"] } });
    const nurse = nurseId ? await User.findById(nurseId) : actor.role === "nurse" ? actor : null;

    if (!doctor && ["accept","reject","assign_nurse","complete","add_prescription"].includes(action)) {
      return res.status(400).json({ message: "Doctor appointment not found" });
    }

    // Helper to update appointments in all relevant users
    const updateAllAppts = async (updater) => {
      const tasks = [];
      if (doctor) tasks.push(findAndUpdateApptInUser(doctor._id, appointmentId, updater));
      if (userOwner) tasks.push(findAndUpdateApptInUser(userOwner._id, appointmentId, updater));
      if (nurse) tasks.push(findAndUpdateApptInUser(nurse._id, appointmentId, updater));
      await Promise.all(tasks);
    };

    switch (action) {
      case "accept":
        await updateAllAppts((appt) => (appt.status = "DOCTOR_ACCEPTED"));
        break;

      case "reject":
        await updateAllAppts((appt) => (appt.status = "REJECTED"));
        break;

      case "assign_nurse":
        if (!nurse) return res.status(404).json({ message: "Nurse not found" });
        await updateAllAppts((appt) => { appt.nurse = nurse._id; appt.status = "NURSE_ASSIGNED"; });
        break;

      case "nurse_complete":
        await updateAllAppts((appt) => (appt.status = "NURSE_COMPLETED"));
        break;

      case "complete":
        await updateAllAppts((appt) => {
          if (!appt.prescription?.length && appt.status !== "NURSE_COMPLETED")
            throw new Error("Add prescription first or wait for nurse completion");
          appt.status = "DOCTOR_COMPLETED";
        });
        break;

      case "add_prescription":
        if (!prescription?.medicineName || !prescription.dosage || !prescription.duration)
          return res.status(400).json({ message: "Incomplete prescription payload" });

        const presObj = {
          ...prescription,
          prescribedBy: actor._id,
          createdAt: new Date(),
        };

        await updateAllAppts((appt) => pushPrescriptionToAppt(appt, presObj));
        break;

      default:
        return res.status(400).json({ message: "Unknown action" });
    }

    // Return latest appointment from doctor's copy
    const updatedAppt = doctor?.appointments.id(appointmentId) || userOwner?.appointments.id(appointmentId) || nurse?.appointments.id(appointmentId);

    return res.status(200).json({ message: "Appointment updated successfully", appointment: updatedAppt });
  } catch (err) {
    console.error("updateAppointmentStatus ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   9. GET NURSE APPOINTMENTS
====================================================== */
const getNurseAppointments = async (req, res) => {
  try {
    const nurse = await User.findById(req.user._id)
      .populate("appointments.user", "name email profilePic")
      .populate("appointments.doctor", "name email profilePic");
    return res.status(200).json(nurse.appointments || []);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   10. GET RECEPTIONIST APPOINTMENTS
====================================================== */
const getReceptionistAppointments = async (req, res) => {
  try {
    const hospitalId = req.user.selectedHospital;
    if (!hospitalId) return res.status(400).json({ message: "Receptionist has no hospital assigned" });

<<<<<<< HEAD
    if (!hospitalId) {
      return res.status(400).json({ message: "Receptionist has no hospital assigned" });
    }

    // Load hospital to access its categories
    const hospital = await Hospital.findById(hospitalId).select("categories");

    // Fetch users from this hospital who hold appointments
    const users = await User.find({
      role: "user",
      selectedHospital: hospitalId,
    })
=======
    const users = await User.find({ role: "user", selectedHospital: hospitalId })
>>>>>>> 4503436a (san1)
      .populate("appointments.doctor", "name email profilePic")
      .lean();

    let allAppointments = [];
<<<<<<< HEAD

    users.forEach((user) => {
      (user.appointments || []).forEach((appt) => {
        if (appt.hospital?.toString() === hospitalId.toString()) {
          
          // 🔥 Attach full category object manually
          let categoryObj = null;
          if (hospital && Array.isArray(hospital.categories)) {
            categoryObj =
              hospital.categories.find(
                (c) => String(c._id) === String(appt.category)
              ) || null;
          }

          allAppointments.push({
            ...appt,
            // attach patient data
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              profilePic: user.profilePic,
            },
            // doctor already populated
            doctor: appt.doctor || null,

            // category we fixed manually
            category: categoryObj
              ? categoryObj
              : { _id: appt.category, name: "Unknown" },
          });
=======
    users.forEach((u) => {
      (u.appointments || []).forEach((appt) => {
        if (String(appt.hospital) === String(hospitalId)) {
          allAppointments.push({ ...appt, user: { _id: u._id, name: u.name, email: u.email, profilePic: u.profilePic } });
>>>>>>> 4503436a (san1)
        }
      });
    });

    return res.status(200).json(allAppointments);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   EXPORT
====================================================== */
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
