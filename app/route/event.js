const express = require("express");
const router = express.Router();
const Event = require("../../model/event");
const upload = require("../../middleware/multerConfig");
const { jwtAuthMiddleware } = require("../../middleware/auth");
const registration = require("../../model/registration");
const NotificationModel = require("../../model/Notifications/Notification.model");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");
const InstituteModel = require("../../model/Institute/Institute.model");
const course = require("../../model/course");
const {
  getEventsByFilter,
  getEventsByRegisteredUser,
} = require("../../controllers/Event/event.controller");
const { uploadEventImage } = require("../../config/upload.config");
const { formatDate } = require("../../services/servise");

// Create a new event
router.post(
  "/",
  jwtAuthMiddleware,
  uploadEventImage.single("event_thumbnail"),
  async (req, res) => {
    try {
      console.log("api", req.file);
      const {
        event_name,
        event_type,
        event_info,
        event_description,
        event_category,
        event_date,
        event_start_time,
        event_end_time,
        event_location,
        event_languages,
        estimated_seats,
      } = req.body;

      const trainerid = req.user.id;

      // If file is uploaded, get file path from Multer
      const event_thumbnail = req.file
        ? req.file.location
        : "https://ximboatest.s3.us-east-1.amazonaws.com/events/default/event_dummy.jpg";
      // console.log(event_thumbnail);

      const newEvent = new Event({
        event_name,
        event_date,
        event_type,
        event_info,
        event_description,
        event_category,
        event_thumbnail,
        event_start_time,
        event_end_time,
        event_location,
        event_languages,
        estimated_seats,
        trainerid,
      });

      const savedEvent = await newEvent.save();
      res.status(201).json(savedEvent);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Error creating event", error });
    }
  }
);

router.get("/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const eventId = req.params.id;

    // Find the event by its ID and populate category_id with only category_name
    const events = await Event.findById(eventId)
      .populate("event_category", "category_name -_id")
      .lean();

    if (!events) {
      return res.status(404).json({ message: "Event not found" });
    }

    const baseUrl = req.protocol + "://" + req.get("host");

    const event = {
      _id: events?._id,
      event_thumbnail: events?.event_thumbnail || "",
      event_info: events?.event_info || "",
      event_description: events?.event_description || "",
      event_date: formatDate(events?.event_date) || "",
      event_start_time: events?.event_start_time || "",
      event_end_time: events?.event_end_time || "",
      event_name: events?.event_name || "",
      event_category: events?.event_category?.category_name || "",
      event_languages: events?.event_languages || "",
      estimated_seats: events?.estimated_seats || "",
      event_location: events?.event_location || "",
      event_type: events?.event_type || "",
    };

    // Send back the event with the full thumbnail URL and direct category_name
    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching event", error });
  }
});

router.get("/trainer/bytrainer", jwtAuthMiddleware, async (req, res) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");
    const eventsData = await Event.find({ trainerid: req.user.id }).sort({
      createdAt: -1,
    });

    if (eventsData.length === 0) {
      return res
        .status(404)
        .json({ message: "No events found for this trainer" });
    }

    const events = eventsData.map((event) => ({
      _id: event?._id,
      event_name: event?.event_name || "",
      event_date: formatDate(event?.event_date) || "",
      event_category: event?.event_category?.category_name || "",
      event_type: event?.event_type || "",
      trainer_id: event?.trainerid?._id || "",
      registered_users: event?.registered_users.length || "",
      event_thumbnail: event?.event_thumbnail,
      estimated_seats: event.estimated_seats,
    }));

    res.status(200).json({
      events,
      event_thumbnail: `${events.event_thumbnail}`,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error fetching events 71", error });
  }
});

// Update an event by ID
router.put(
  "/:id",
  jwtAuthMiddleware,
  uploadEventImage.single("event_thumbnail"),
  async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;
    const {
      event_name,
      event_type,
      event_info,
      event_description,
      event_category,
      event_date,
      event_start_time,
      event_end_time,
      event_location,
      event_languages,
      estimated_seats,
    } = req.body;
    const event_thumbnail = req.file ? req.file.location : "";

    try {
      // Find the event by ID
      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).json(new ApiError(404, "Event not found."));
      }

      // Check if the current user is the trainer who created the event
      // if (event.trainerid.toString() !== userId) {
      //   return res
      //     .status(403)
      //     .json(
      //       new ApiError(403, "You are not authorized to update this event.")
      //     );
      // }

      // Update event details
      event.event_name = event_name || event.event_name;
      event.event_type = event_type || event.event_type;
      event.event_info = event_info || event.event_info;
      event.event_description = event_description || event.event_description;
      event.event_category = event_category || event.event_category;
      event.event_date = event_date || event.event_date;
      event.event_start_time = event_start_time || event.event_start_time;
      event.event_end_time = event_end_time || event.event_end_time;
      event.event_location = event_location || event.event_location;
      event.event_languages = event_languages || event.event_languages;
      event.estimated_seats = estimated_seats || event.estimated_seats;
      event.event_thumbnail = event_thumbnail || event.event_thumbnail;

      const updatedEvent = await event.save();

      res
        .status(200)
        .json(new ApiResponse(200, "Event updated successfully", updatedEvent));
    } catch (error) {
      console.error("Event update error:", error);
      res
        .status(500)
        .json(
          new ApiError(500, error.message || "Error updating event", error)
        );
    }
  }
);

// Delete an event by ID
router.delete("/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event", error });
  }
});

// Route to register a user for an event
router.post("/registerevent", jwtAuthMiddleware, async (req, res) => {
  try {
    const evnet_id = req.body.event_id;
    const userId = req.user.id;

    const event = await Event.findById(evnet_id);
    if (!event) {
      console.log(event);
      return res.status(404).json({ message: "Event not found" });
    }

    const user = await registration.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (event.registered_users.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already registered for this event" });
    }

    event.registered_users.push(userId);
    await event.save();

    const notification = new NotificationModel({
      recipient: userId,
      message: `You have successfully registered for the event: ${event.event_name}`,
      activityType: "EVENT_REGISTRATION",
      relatedId: event._id,
    });
    await notification.save();

    const notificationToTrainer = new NotificationModel({
      recipient: event.trainerid,
      message: `A ${user.f_Name} ${user.l_Name} has register for event: ${event.event_name}`,
      activityType: "EVENT_REGISTRATION",
      relatedId: userId,
    });
    await notificationToTrainer.save();

    res
      .status(200)
      .json({ message: "User registered for the event successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

router.get("/filter/event", getEventsByFilter);
router.get(
  "/get/my-registered-events",
  jwtAuthMiddleware,
  getEventsByRegisteredUser
);

module.exports = router;
