const Event = require("../../model/event");
const { ApiError } = require("../../utils/ApiError");
const { default: mongoose } = require("mongoose");
const { ApiResponse } = require("../../utils/ApiResponse");
const { getRoleOrInstitute } = require("../../utils/helper");
const { asyncHandler } = require("../../utils/asyncHandler");
const { formatDate } = require("../../services/servise");

// Get events filtered by multiple categories (using category_name and handling special characters)
const getEventsByFilter = asyncHandler(async (req, res) => {
  try {
    const { categories } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        message: "Categories parameter is required",
      });
    }

    // Split categories and sanitize them (trim and escape special characters)
    const categoryArray = categories.split(",").map((cat) => cat.trim());

    // Find events based on populated category_name using case-insensitive regex
    const events = await Event.find({})
      .populate("event_category", "category_name") // Populate category_name
      .populate("trainerid", "f_Name l_Name organizer_image business_Name role")
      .lean(); // Use lean for better performance

    // Use regex to handle spaces and special characters, and perform case-insensitive search
    const filteredEvents = events.filter((event) => {
      return categoryArray.some((cat) =>
        new RegExp(
          `^${cat.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`,
          "i"
        ).test(event?.event_category?.category_name)
      );
    });

    if (!filteredEvents || filteredEvents.length === 0) {
      return res.status(404).json({
        message: "No events found for the selected categories",
      });
    }

    const baseUrl = req.protocol + "://" + req.get("host");

    const eventsWithFullImageUrl = filteredEvents
      .slice(startIndex, startIndex + limit)
      .map((event) => {
        const reviews = event?.reviews;
        const totalStars = reviews?.reduce(
          (sum, review) => sum + review.star_count,
          0
        );
        const averageRating = totalStars / reviews?.length;

        const result = {
          _id: event?._id,
          event_name: event?.event_name || "",
          event_date: formatDate(event?.event_date) || "",
          event_category: event?.event_category?.category_name || "",
          event_type: event?.event_type || "",
          event_flag: event?.trainerid?.role || "",
          trainer_id: event?.trainerid?._id || "",
          event_rating: averageRating ? averageRating?.toFixed(1) : "",
          registered_users: event?.registered_users?.length || "",
          event_thumbnail: event?.event_thumbnail || "",
        };
        return result;
      });

    res.status(200).json(
      new ApiResponse(200, "Filter Events Success", eventsWithFullImageUrl, {
        currentPage: page,
        totalPages: Math.ceil(filteredEvents.length / limit),
        totalItems: filteredEvents.length,
        pageSize: limit,
      })
    );
  } catch (error) {
    console.log(error);
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json(new ApiError(400, "Validation Error", error.errors));
    } else {
      res.status(500).json(new ApiError(500, "Server Error", error));
    }
  }
});

// Controller to get events where registered_users includes req.user.id
const getEventsByRegisteredUser = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  console.log(page, limit);
  try {
    // Fetch events where registered_users contains req.user.id
    const events = await Event.find({ registered_users: req.user.id })
      .populate("event_category", "category_name") // Populating event_category with category details
      .populate("trainerid", "f_Name l_Name role") // Populating trainer details
      .populate("registered_users", "f_Name l_Name") // Optional: Populating the registered users' names
      .exec();

    if (!events || events.length === 0) {
      return res.status(404).json({
        message: "No events found for the registered user.",
      });
    }

    const eventsWithFullImageUrl = events
      .slice(startIndex, startIndex + limit)
      .map((event) => {
        const reviews = event?.reviews;
        const totalStars = reviews?.reduce(
          (sum, review) => sum + review.star_count,
          0
        );
        const averageRating = totalStars / reviews?.length;

        const result = {
          _id: event?._id,
          event_name: event?.event_name || "",
          event_date: formatDate(event?.event_date) || "",
          event_category: event?.event_category?.category_name || "",
          event_type: event?.event_type || "",
          event_flag: event?.trainerid?.role || "",
          trainer_id: event?.trainerid?._id || "",
          event_rating: averageRating ? averageRating?.toFixed(1) : "",
          registered_users: event?.registered_users?.length || "",
          event_thumbnail: event?.event_thumbnail || "",
        };
        return result;
      });

    res.status(200).json(
      new ApiResponse(200, "Events", eventsWithFullImageUrl, {
        currentPage: page,
        totalPages: Math.ceil(events.length / limit),
        totalItems: events.length,
        pageSize: limit,
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch events",
      error: error.message,
    });
  }
});

module.exports = {
  getEventsByFilter,
  getEventsByRegisteredUser,
};
