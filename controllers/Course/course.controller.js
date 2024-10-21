const Course = require("../../model/course");
const { ApiError } = require("../../utils/ApiError");
const { default: mongoose } = require("mongoose");

// Get courses filtered by multiple categories
const getCoursesByFilter = async (req, res) => {
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

    const categoryArray = categories.split(",");

    const courses = await Course.find({ category_id: { $in: categoryArray } })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image business_Name");

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        message: "No courses found for the selected categories",
      });
    }

    const baseUrl = req.protocol + "://" + req.get("host");

    const coursesWithFullImageUrl = courses.map((course) => ({
      _id: course?._id,
      course_name: course?.course_name || "",
      category_name: course?.category_id?.category_name || "",
      online_offline: course?.online_offline || "",
      thumbnail_image: course?.thumbnail_image
        ? `${baseUrl}/${course?.thumbnail_image?.replace(/\\/g, "/")}`
        : "",
      business_Name: course?.trainer_id?.business_Name
        ? course?.trainer_id?.business_Name
        : `${course?.trainer_id?.f_Name || ""} ${
            course?.trainer_id?.l_Name || ""
          }`.trim() || "",
      trainer_image: course?.trainer_id?.trainer_image
        ? `${baseUrl}/${course?.trainer_id?.trainer_image?.replace(/\\/g, "/")}`
        : "",
      course_duration:
        Math.floor(
          Math.round(
            ((course?.end_date - course?.start_date) /
              (1000 * 60 * 60 * 24 * 7)) *
              100
          ) / 100
        ) || 1,
      course_price: course?.price || "",
      course_offer_price: course?.offer_prize || "",
    }));

    res.status(200).json({
      totalResults: courses.length,
      page,
      limit,
      courses: coursesWithFullImageUrl,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json(new ApiError(400, "Validation Error", error.errors));
    } else {
      res.status(500).json(new ApiError(500, "Server Error", error));
    }
  }
};

module.exports = {
  getCoursesByFilter,
};
