// appointmentController.js
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const mongoose = require("mongoose");

/* ======================================================
   Helpers
====================================================== */
const pushPrescriptionToAppt = (apptDoc, prescriptionObj) => {
  if (!Array.isArray(apptDoc.prescription)) apptDoc.prescription = [];
  apptDoc.prescription.push(prescriptionObj);
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

    if (!user || !user.selectedHospital)
      return res.status(400).json({ message: "User has no hospital" });

    const hospital = await Hospital.findById(user.selectedHospital).select(
      "categories"
    );

    return res.status(200).json(hospital.categories);
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
    console.error("getDoctorsByCategory error:", err);
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

    if (!user || !doctor)
      return res.status(404).json({ message: "User or doctor not found" });

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

    // insert into user's array and doctor's array
    if (!Array.isArray(user.appointments)) user.appointments = [];
    if (!Array.isArray(doctor.appointments)) doctor.appointments = [];

    user.appointments.unshift(appointment);
    doctor.appointments.unshift(appointment);

    await user.save();
    await doctor.save();

    return res.status(200).json({
      message: "Appointment created",
      appointment,
    });
  } catch (err) {
    console.error("CREATE APPT ERROR:", err);
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
        if (a.date === date && a.doctor?.toString() === doctorId) booked.push(a.time);
      });
    });

    const slots = [];
    for (let h = 9; h < 17; h++) {
      slots.push(`${h}:00`);
      slots.push(`${h}:30`);
    }

    return res.status(200).json({
      availableSlots: slots.filter((s) => !booked.includes(s)),
      bookedSlots: booked,
    });
  } catch (err) {
    console.error("getAvailableSlots ERROR:", err);
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
      .populate("appointments.category", "name")
      .populate("appointments.nurse", "name");

    return res.status(200).json(user.appointments);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   6. DELETE APPOINTMENT
====================================================== */
const deleteAppointment = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const apptObj = user.appointments.find(
      (a) => a._id.toString() === req.params.appointmentId
    );
    if (!apptObj) return res.status(404).json({ message: "Appointment not found" });

    const doctor = await User.findById(apptObj.doctor);

    user.appointments = user.appointments.filter(
      (a) => a._id.toString() !== req.params.appointmentId
    );

    if (doctor) {
      doctor.appointments = doctor.appointments.filter(
        (a) => a._id.toString() !== req.params.appointmentId
      );
      await doctor.save();
    }

    await user.save();

    // Also remove from nurse if exists
    if (apptObj.nurse) {
      const nurse = await User.findById(apptObj.nurse);
      if (nurse) {
        nurse.appointments = nurse.appointments.filter(
          (a) => a._id.toString() !== req.params.appointmentId
        );
        await nurse.save();
      }
    }

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
      .populate("appointments.category", "name")
      .populate("appointments.nurse", "name email profilePic");

    return res.status(200).json(doctor.appointments);
  } catch (err) {
    console.error("getDoctorAppointments ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   8. UPDATE APPOINTMENT (STATUS + PRESCRIPTION)
      - role-aware: both doctor and nurse can call add_prescription
      - prescriptions are synced to doctor / user / nurse appointment docs
      - assign_nurse copies existing doctor prescriptions into nurse's appt
====================================================== */
const updateAppointmentStatus = async (req, res) => {
  try {
    const actor = await User.findById(req.user._id); // who is calling (doctor or nurse)
    if (!actor) return res.status(404).json({ message: "Actor not found" });

    const appointmentId = req.params.appointmentId;
    const { action, nurseId, prescription } = req.body;

    // We will need to update 3 places: doctor, user, nurse (if assigned)
    // Locate doctor and the appointment inside doctor's appointments (if exists)
    // Note: if the actor is nurse, we'll find appointment from nurse side

    // Helper to find doctor who owns the appointment
    // In many flows doctor is stored in the appt; but to be safe we search the DB for a user containing that appointment id with role doctor
    const doctorOwner = await User.findOne({
      role: "doctor",
      "appointments._id": appointmentId,
    });

    const userOwner = await User.findOne({
      "appointments._id": appointmentId,
      role: { $in: ["user", "patient", "user"] }, // just match any user document that holds the appt
    });

    // If doctorOwner not found but actor is doctor, then doctorOwner = actor
    const doctor = doctorOwner || (actor.role === "doctor" ? actor : null);

    // if userOwner not found, try to find inside doctor's appointment object (appt.user)
    if (!userOwner && doctor) {
      const apptFromDoctor = doctor.appointments.id(appointmentId);
      if (apptFromDoctor && apptFromDoctor.user) {
        // try to fetch user by id
        const maybeUser = await User.findById(apptFromDoctor.user);
        if (maybeUser) userOwner = maybeUser;
      }
    }

    // find nurse if nurseId provided or if actor is nurse
    const nurseActorId = actor.role === "nurse" ? actor._id : nurseId || null;
    let nurse = null;
    if (nurseActorId) nurse = await User.findById(nurseActorId);

    /* ---------- ACTION HANDLING ---------- */

    // If action requires doctor to exist, validate
    if (["accept", "assign_nurse", "reject", "complete", "add_prescription"].includes(action) &&
        action !== "nurse_complete" &&
        !doctor
    ) {
      return res.status(400).json({ message: "Doctor appointment owner not found" });
    }

    // We'll operate primarily on doctor.appt when it exists, otherwise on nurse.appt
    let apptDoc = null;
    if (doctor) apptDoc = doctor.appointments.id(appointmentId);
    if (!apptDoc && nurse) apptDoc = nurse.appointments.id(appointmentId);

    if (!apptDoc) {
      // Last attempt: find any user that has this appointment
      const any = await User.findOne({ "appointments._id": appointmentId });
      if (any) apptDoc = any.appointments.id(appointmentId);
    }

    if (!apptDoc) return res.status(404).json({ message: "Appointment not found in records" });

    /* ---------- Accept / Reject ---------- */
    if (action === "accept") {
      apptDoc.status = "DOCTOR_ACCEPTED";
    }

    if (action === "reject") {
      apptDoc.status = "REJECTED";
    }

    /* ---------- Assign Nurse ---------- */
    if (action === "assign_nurse") {
      if (!nurseId) return res.status(400).json({ message: "nurseId required" });

      apptDoc.nurse = nurseId;
      apptDoc.status = "NURSE_ASSIGNED";

      // Ensure nurse has an appointments array and insert a copy with same appointmentId
      if (!nurse) return res.status(404).json({ message: "Nurse not found" });

      // Create nurse appointment copy (prescribe doctor prescriptions into nurse copy - Option A: copy all existing)
      // Ensure we don't duplicate if already exists
      const existing = nurse.appointments.id(appointmentId);
      if (!existing) {
        const nurseCopy = {
          _id: appointmentId,
          user: apptDoc.user,
          doctor: apptDoc.doctor,
          nurse: nurseId,
          category: apptDoc.category,
          hospital: apptDoc.hospital,
          date: apptDoc.date,
          time: apptDoc.time,
          description: apptDoc.description,
          status: "NURSE_ASSIGNED",
          prescription: Array.isArray(apptDoc.prescription) ? [...apptDoc.prescription] : [],
        };

        nurse.appointments.unshift(nurseCopy);
      } else {
        // update existing nurse copy's status / ensure prescriptions include doctor's
        existing.status = "NURSE_ASSIGNED";
        if (!Array.isArray(existing.prescription)) existing.prescription = [];
        // merge unique prescriptions from doctor into nurse copy (by createdAt + medicineName)
        const docPres = Array.isArray(apptDoc.prescription) ? apptDoc.prescription : [];
        docPres.forEach((dp) => {
          // naive dedupe: compare medicineName + dosage + duration + notes
          const found = existing.prescription.some(
            (ep) =>
              ep.medicineName === dp.medicineName &&
              ep.dosage === dp.dosage &&
              ep.duration === dp.duration &&
              (ep.notes || "") === (dp.notes || "")
          );
          if (!found) existing.prescription.push(dp);
        });
      }

      await nurse.save();
    }

    /* ---------- Nurse completes (nurse marks completed) ---------- */
    if (action === "nurse_complete") {
      // allow only nurse actor to mark nurse_complete OR doctor/nurse with proper assignment
      if (actor.role !== "nurse" && actor.role !== "doctor") {
        return res.status(403).json({ message: "Only nurse or doctor can mark nurse_complete" });
      }
      apptDoc.status = "NURSE_COMPLETED";
    }

    /* ---------- Doctor completes ---------- */
    if (action === "complete") {
      // allow doctor to finalize; require at least one prescription OR nurse has completed
      const hasPrescription = Array.isArray(apptDoc.prescription) && apptDoc.prescription.length > 0;

      if (!hasPrescription && apptDoc.status !== "NURSE_COMPLETED") {
        return res.status(400).json({
          message:
            "Cannot mark complete: either add prescription first or wait for nurse to complete",
        });
      }

      apptDoc.status = "DOCTOR_COMPLETED";
    }

    /* ---------- Add Prescription (role-aware) ---------- */
    if (action === "add_prescription") {
      if (!prescription || !prescription.medicineName || !prescription.dosage || !prescription.duration) {
        return res.status(400).json({ message: "Incomplete prescription payload" });
      }

      const presObj = {
        medicineName: prescription.medicineName,
        dosage: prescription.dosage,
        duration: prescription.duration,
        notes: prescription.notes || "",
        prescribedBy: actor._id,
        createdAt: new Date(),
      };

      // 1) push into doctor's copy (if doctor exists)
      if (doctor) {
        const dAppt = doctor.appointments.id(appointmentId);
        if (dAppt) {
          if (!Array.isArray(dAppt.prescription)) dAppt.prescription = [];
          dAppt.prescription.push(presObj);
        }
      }

      // 2) push into user's appt
      if (userOwner) {
        const uAppt = userOwner.appointments.id(appointmentId);
        if (uAppt) {
          if (!Array.isArray(uAppt.prescription)) uAppt.prescription = [];
          uAppt.prescription.push(presObj);
        }
        await userOwner.save();
      }

      // 3) if nurse assigned, push into nurse's appt
      if (apptDoc.nurse) {
        const nurseEntity = await User.findById(apptDoc.nurse);
        if (nurseEntity) {
          const nAppt = nurseEntity.appointments.id(appointmentId);
          if (nAppt) {
            if (!Array.isArray(nAppt.prescription)) nAppt.prescription = [];
            nAppt.prescription.push(presObj);
            await nurseEntity.save();
          } else {
            // If nurse doesn't have an appt record yet (shouldn't happen) insert a new copy
            nurseEntity.appointments.unshift({
              _id: appointmentId,
              user: apptDoc.user,
              doctor: apptDoc.doctor,
              nurse: nurseEntity._id,
              category: apptDoc.category,
              hospital: apptDoc.hospital,
              date: apptDoc.date,
              time: apptDoc.time,
              description: apptDoc.description,
              status: apptDoc.status,
              prescription: [presObj],
            });
            await nurseEntity.save();
          }
        }
      }

      // If actor is nurse but doctor copy exists, also push into doctor's appt
      if (actor.role === "nurse" && doctor) {
        const dAppt2 = doctor.appointments.id(appointmentId);
        if (dAppt2) {
          if (!Array.isArray(dAppt2.prescription)) dAppt2.prescription = [];
          dAppt2.prescription.push(presObj);
        }
      }
    }

    // persist changes: save doctor (if modified)
    if (doctor) await doctor.save();

    // After doctor.save() + userOwner save (done in add_prescription), ensure userOwner status reflect apptDoc.status
    if (userOwner) {
      const userAppt = userOwner.appointments.id(appointmentId);
      if (userAppt) {
        userAppt.status = apptDoc.status;
        if (apptDoc.nurse) userAppt.nurse = apptDoc.nurse;
      }
      await userOwner.save();
    }

    // If appointment has a nurse id, update nurse appointment status to match (already done on assign, but do here to be safe)
    if (apptDoc.nurse) {
      const nurseEntity = await User.findById(apptDoc.nurse);
      if (nurseEntity) {
        const nAppt = nurseEntity.appointments.id(appointmentId);
        if (nAppt) {
          nAppt.status = apptDoc.status;
          // if doctor added prescription earlier, ensure nurse copy includes them (merge)
          if (Array.isArray(apptDoc.prescription) && apptDoc.prescription.length > 0) {
            if (!Array.isArray(nAppt.prescription)) nAppt.prescription = [];
            apptDoc.prescription.forEach((dp) => {
              const found = nAppt.prescription.some(
                (ep) =>
                  ep.medicineName === dp.medicineName &&
                  ep.dosage === dp.dosage &&
                  ep.duration === dp.duration &&
                  (ep.notes || "") === (dp.notes || "")
              );
              if (!found) nAppt.prescription.push(dp);
            });
          }
          await nurseEntity.save();
        }
      }
    }

    // Finally, return the authoritative appointment object (from doctor's copy if exists, otherwise from any owner)
    let returnAppt = null;
    if (doctor) {
      returnAppt = doctor.appointments.id(appointmentId);
    } else if (nurse) {
      returnAppt = nurse.appointments.id(appointmentId);
    } else if (userOwner) {
      returnAppt = userOwner.appointments.id(appointmentId);
    }

    return res.status(200).json({
      message: "Appointment updated successfully",
      appointment: returnAppt,
    });
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
      .populate("appointments.doctor", "name email profilePic")
      .populate("appointments.category", "name");

    return res.status(200).json(nurse.appointments || []);
  } catch (err) {
    console.error("Nurse Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET ALL APPOINTMENTS FOR RECEPTIONIST (HOSPITAL WIDE)
====================================================== */
const getReceptionistAppointments = async (req, res) => {
  try {
    const hospitalId = req.user.selectedHospital; // receptionist's hospital

    if (!hospitalId) {
      return res.status(400).json({ message: "Receptionist has no hospital assigned" });
    }

    // Fetch users from this hospital who hold appointments
    const users = await User.find({
      role: "user",
      selectedHospital: hospitalId,
    })
      .populate("appointments.doctor", "name email profilePic")
      .populate("appointments.category", "name")
      .lean();

    let allAppointments = [];

    users.forEach((user) => {
      (user.appointments || []).forEach((appt) => {
        if (appt.hospital?.toString() === hospitalId.toString()) {
          allAppointments.push({
            ...appt,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              profilePic: user.profilePic,
            },
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
