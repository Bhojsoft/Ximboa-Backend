const express = require("express");
const router = express.Router();
const Appointment = require("../model/Appointment/Appointment");
const NotificationModel = require("../model/Notifications/Notification.model");
const registration = require("../model/registration");
const { formatDate } = require("../services/servise");

// Create a new appointment
router.post("/", async (req, res) => {
  try {
    const user_id = req.user.id; // Trainer ID
    const { t_id, date, time } = req.body;

    const user = await registration
      .findById(user_id)
      .select("f_Name l_Name role");

    const trainer = await registration
      .findById(t_id)
      .select("f_Name l_Name role");

    // Create a new appointment
    const newAppointment = new Appointment({ t_id, user_id, date, time });
    await newAppointment.save();

    // Send notification to the trainer
    const trainerNotification = new NotificationModel({
      recipient: t_id,
      message: `You have a new appointment scheduled with ${user.f_Name} ${user.l_Name}  on ${date} at ${time}.`,
      activityType: "NEW_APPOINTMENT",
      relatedId: newAppointment._id,
    });
    await trainerNotification.save();

    // Send notification to the user
    const userNotification = new NotificationModel({
      recipient: user_id,
      message: `Your appointment with trainer ${trainer.f_Name} ${trainer.l_Name} has been confirmed for ${date} at ${time}.`,
      activityType: "NEW_APPOINTMENT",
      relatedId: newAppointment._id,
    });
    await userNotification.save();

    // Return the new appointment details
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(400).json({ message: "Error creating appointment", error });
  }
});

// Get all appointments
router.get("/", async (req, res) => {
  try {
    const result = await Appointment.find()
      .populate("t_id", "f_Name l_Name email_id") // Populate trainer details
      .populate("user_id", "f_Name l_Name email_id"); // Populate user details

    const appointments = result.map((appointment) => {
      return {
        _id: appointment._id || "",
        user_id: appointment?.user_id?._id || "",
        user_name: appointment?.user_id?.f_Name
          ? `${appointment?.user_id?.f_Name} ${appointment?.user_id?.l_Name}`
          : "" || "",
        date: formatDate(appointment?.date) || "",
        time: appointment?.time || "",
        createdAt: formatDate(appointment?.createdAt) || "",
        updatedAt: formatDate(appointment?.updatedAt) || "",
      };
    });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error });
  }
});

// Get appointments by trainer ID
router.get("/trainer", async (req, res) => {
  try {
    const appointments = await Appointment.find({ t_id: req.user.id })
      .populate("t_id", "name email")
      .populate("user_id", "name email");

    console.log(appointments);
    res.status(200).json(appointments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching appointments by trainer ID", error });
  }
});

// Get appointments by user ID
router.get("/user/:user_id", async (req, res) => {
  try {
    const appointments = await Appointment.find({ user_id: req.params.user_id })
      .populate("t_id", "name email")
      .populate("user_id", "name email");
    res.status(200).json(appointments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching appointments by user ID", error });
  }
});

// Update an appointment
router.put("/:appointment_id", async (req, res) => {
  try {
    const { t_id, user_id, date, time } = req.body;
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.appointment_id,
      { t_id, user_id, date, time },
      { new: true }
    );
    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: "Error updating appointment", error });
  }
});

// Delete an appointment
router.delete("/:appointment_id", async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(
      req.params.appointment_id
    );
    if (!deletedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting appointment", error });
  }
});

module.exports = router;
