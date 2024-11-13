const Course = require("../../model/course");
const { ApiError } = require("../../utils/ApiError");
const { default: mongoose } = require("mongoose");
const { ApiResponse } = require("../../utils/ApiResponse");
const { getRoleOrInstitute } = require("../../utils/helper");
const { asyncHandler } = require("../../utils/asyncHandler");
const registration = require("../../model/registration");
const NotificationModel = require("../../model/Notifications/Notification.model");
const InstituteModel = require("../../model/Institute/Institute.model");

const getCourses = asyncHandler(async (req, res, next) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const skip = (page - 1) * limit;
    const currentDate = new Date().toISOString();

    const courses = await Course.find({ end_date: { $gte: currentDate } })
      .sort({ createdAt: -1 })
      .populate("category_id")
      .populate("trainer_id", "f_Name l_Name role business_Name")
      .limit(limit)
      .skip(skip);

    const coursesWithFullImageUrls = courses.map((course) => ({
      _id: course?._id,
      category_name: course?.category_id?.category_name || "",
      course_name: course?.course_name || "",
      online_offline: course?.online_offline || "",
      thumbnail_image: course?.thumbnail_image,
      trainer_image: course?.trainer_id?.trainer_image,
      trainer_id: course?.trainer_id?._id,
      business_Name: course?.trainer_id?.business_Name
        ? course?.trainer_id?.business_Name
        : `${course?.trainer_id?.f_Name || ""} ${
            course?.trainer_id?.l_Name || ""
          }`.trim() || "",
      course_rating: "",
      course_duration: Math.floor(
        Math.round(
          ((course?.end_date - course?.start_date) /
            (1000 * 60 * 60 * 24 * 7)) *
            100
        ) / 100
      ),
      course_price: course?.price || "",
      course_offer_prize: course?.offer_prize || "",
      course_flag: course?.trainer_id?.role || "",
    }));

    const totalCourses = await Course.countDocuments();
    const totalPages = Math.ceil(totalCourses / limit);

    res.status(200).json({
      courses: coursesWithFullImageUrls,
      currentPage: page,
      totalPages,
      totalCourses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiError(500, err.message || "Server Error", err));
  }
});

const getCourseById = asyncHandler(async (req, res, next) => {
  const baseUrl = req.protocol + "://" + req.get("host");

  try {
    const courseData = await Course.findById(req.params.id)
      .populate("category_id", "category_name -_id")
      .populate("trainer_id", "f_Name l_Name business_Name trainer_image role");

    if (!courseData) {
      return res
        .status(404)
        .json(new ApiError(404, "Course not found", "Invalid course ID"));
    }

    const reviews = courseData.reviews;
    const totalStars = reviews.reduce(
      (sum, review) => sum + review.star_count,
      0
    );
    const averageRating = totalStars / reviews.length;

    const courseWithFullImageUrls = {
      _id: courseData?._id,
      course_name: courseData?.course_name || "",
      course_brief_info: courseData?.course_brief_info || "",
      course_information: courseData?.course_information || "",
      category_name: courseData?.category_id?.category_name || "",
      online_offline: courseData?.online_offline || "",
      thumbnail_image: courseData?.thumbnail_image,
      // ? `${baseUrl}/${courseData?.thumbnail_image.replace(/\\/g, "/")}`
      // : "",
      start_date: courseData?.start_date || "",
      end_date: courseData?.end_date || "",
      start_time: courseData?.start_time || "",
      end_time: courseData?.end_time || "",
      business_Name:
        courseData?.trainer_id?.business_Name ||
        `${courseData?.trainer_id?.f_Name || ""} ${
          courseData?.trainer_id?.l_Name || ""
        }`.trim() ||
        "",
      trainer_image: courseData?.trainer_id?.trainer_image,
      trainer_id: courseData?.trainer_id?._id,
      course_rating: averageRating || "",
      course_duration: Math.floor(
        Math.round(
          ((courseData?.end_date - courseData?.start_date) /
            (1000 * 60 * 60 * 24 * 7)) *
            100
        ) / 100
      ),
      price: courseData?.price || "",
      tags: courseData?.tags || "",
      offer_prize: courseData?.offer_prize || "",
      course_flag: courseData?.trainer_id?.role || "",
    };

    res.status(200).json(courseWithFullImageUrls);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json(new ApiError(500, "Server Error", err));
  }
});

const updateCourseById = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const updateData = {
    course_name: req.body.course_name,
    online_offline: req.body.online_offline,
    price: req.body.price,
    offer_prize: req.body.offer_prize,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    tags: req.body.tags,
    course_brief_info: req.body.course_brief_info,
    course_information: req.body.course_information,
    thumbnail_image: req.files["thumbnail_image"]
      ? req?.files["thumbnail_image"][0]?.location
      : "",
    gallary_image: req.files["gallary_image"]
      ? req.files["gallary_image"][0].path
      : "",
    trainer_materialImage: req.files["trainer_materialImage"]
      ? req.files["trainer_materialImage"][0].path
      : "",
    category_id: req.body.category_id,
    trainer_id: req.user.id,
  };

  try {
    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCourse) {
      return res.status(404).json(new ApiError(404, "Course not found"));
    }

    const notification = new NotificationModel({
      recipient: req.user.id,
      message: `Your course "${updatedCourse.course_name}" has been updated successfully.`,
      activityType: "COURSE_UPDATE",
      relatedId: updatedCourse._id,
    });

    await notification.save();

    const attendees = updatedCourse.registered_users;

    if (attendees) {
      const notifications = attendees?.map((attendee) => ({
        recipient: attendee,
        message: `The course "${updatedCourse.course_name}" has been updated.`,
        activityType: "COURSE_UPDATE",
        relatedId: updatedCourse._id,
      }));
      await NotificationModel.insertMany(notifications);
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Course updated successfully", updatedCourse));
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiError(500, err.message || "Server Error", err));
  }
});

const postCourse = asyncHandler(async (req, res) => {
  // console.log("file ", req?.files["thumbnail_image"]?.location);
  const course = new Course({
    course_name: req.body.course_name,
    online_offline: req.body.online_offline,
    price: req.body.price,
    offer_prize: req.body.offer_prize,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    tags: req.body.tags,
    course_brief_info: req.body.course_brief_info,
    course_information: req.body.course_information,
    thumbnail_image: req.files["thumbnail_image"]
      ? req.files["thumbnail_image"][0].location
      : "public/ximboa_default.jpg",
    gallary_image: req.files["gallary_image"]
      ? req.files["gallary_image"][0].path
      : "",
    trainer_materialImage: req.files["trainer_materialImage"]
      ? req.files["trainer_materialImage"][0].path
      : "",
    category_id: req.body.category_id,
    trainer_id: req.user.id,
  });

  try {
    const savedCourse = await course.save();

    const trainerId = req.user.id;

    const trainer = await registration.findByIdAndUpdate(
      trainerId,
      {
        $addToSet: {
          categories: savedCourse?.category_id,
        },
      },
      { new: true }
    );

    if (trainer?.role === "TRAINER") {
      const institute = await InstituteModel.findOneAndUpdate(
        {
          trainers: { $in: [trainerId] },
        },
        {
          $push: {
            courses: { course_id: course?._id, trainer_id: trainer?._id },
          },
        },
        { new: true }
      );
    }

    const notification = new NotificationModel({
      recipient: req.user.id,
      message: `Your course "${savedCourse.course_name}" has been created successfully.`,
      activityType: "COURSE_CREATE",
      relatedId: savedCourse._id,
    });
    await notification.save();
    res.status(200).json(
      new ApiResponse(200, "Course Added Successfully", {
        _id: savedCourse._id,
        course_name: savedCourse.course_name,
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiError(500, err.message || "Server Error", err));
  }
});

const getCoursesByFilter = asyncHandler(async (req, res) => {
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

    const courses = await Course.find({})
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image business_Name role")
      .lean();

    const filteredCourses = courses.filter((course) => {
      return categoryArray.some((cat) =>
        new RegExp(
          `^${cat.replace(/[-[\]{}()*+?.&,\\^$|#\s]/g, "\\$&")}$`,
          "i"
        ).test(course?.category_id?.category_name)
      );
    });

    if (!filteredCourses || filteredCourses.length === 0) {
      return res.status(404).json({
        message: "No courses found for the selected categories",
      });
    }

    const baseUrl = req.protocol + "://" + req.get("host");

    const coursesWithFullImageUrl = filteredCourses
      .slice(startIndex, startIndex + limit)
      .map((course) => {
        const reviews = course.reviews || [];
        const totalStars = reviews.reduce(
          (sum, review) => sum + review.star_count,
          0
        );
        const averageRating =
          reviews.length > 0 ? totalStars / reviews.length : 0;
        const result = {
          _id: course?._id,
          category_name: course?.category_id?.category_name || "",
          course_name: course?.course_name || "",
          online_offline: course?.online_offline || "",
          thumbnail_image: course?.thumbnail_image,
          trainer_image: course?.trainer_id?.trainer_image,
          trainer_id: course?.trainer_id?._id,
          business_Name: course?.trainer_id?.business_Name
            ? course?.trainer_id?.business_Name
            : `${course?.trainer_id?.f_Name || ""} ${
                course?.trainer_id?.l_Name || ""
              }`.trim() || "",
          course_rating: averageRating || "",
          course_duration:
            Math.floor(
              Math.round(
                ((course?.end_date - course?.start_date) /
                  (1000 * 60 * 60 * 24 * 7)) *
                  100
              ) / 100
            ) || 1,
          course_price: course?.price || "",
          course_offer_prize: course?.offer_prize || "",
          course_flag: getRoleOrInstitute(course?.trainer_id?.role) || "",
        };
        return result;
      });

    res.status(200).json(
      new ApiResponse(200, "Filter Courses Success", coursesWithFullImageUrl, {
        currentPage: page,
        totalPages: Math.ceil(filteredCourses.length / limit),
        totalItems: filteredCourses.length,
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

module.exports = {
  getCourses,
  getCourseById,
  updateCourseById,
  postCourse,
  getCoursesByFilter,
};
