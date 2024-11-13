const express = require("express");
const router = express.Router();
const Course = require("../../model/course");
const multer = require("multer");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ApiError } = require("../../utils/ApiError");
const registration = require("../../model/registration");
const NotificationModel = require("../../model/Notifications/Notification.model");
const { checkUserRole } = require("../../middleware/auth");
const {
  getCourses,
  postCourse,
  getCourseById,
  updateCourseById,
} = require("../../controllers/Course/course.controller");
const { uploadCourseThumbnail } = require("../../config/upload.config");

// // Multer configuration for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1024 * 1024 * 5 },
//   fileFilter: fileFilter,
// });

// ========================= get courses ====================================
router.get("/", getCourses);

// ========================= add course ====================================
router.post(
  "/",
  uploadCourseThumbnail.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "gallary_image", maxCount: 5 },
    { name: "trainer_materialImage", maxCount: 1 },
  ]),
  checkUserRole,
  postCourse
);

// ========================= course/:id ====================================
router.get("/:id", getCourseById);

// ========================= Update course/:id =============================
router.put(
  "/:id",
  uploadCourseThumbnail.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "gallary_image", maxCount: 5 },
    { name: "trainer_materialImage", maxCount: 1 },
  ]),
  checkUserRole,
  updateCourseById
);

// ========================= Update course/:id =============================
router.delete("/:id", async (req, res, next) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");
    const data = await Course.deleteOne({ _id: req.params.id });
    if (!data.deletedCount) res.status(400).json({ msg: "Not Found" });
    else {
      res
        .status(200)
        .json({ msg: "Course data successfully deleted", result: data });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// router.delete("/:id", async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id);

//     if (!course) {
//       return res.status(404).json(new ApiError(404, "Course not found"));
//     }

//     await Course.deleteOne({ _id: req.params.id });

//     const attendees = course.registered_users;

//     const notifications = attendees.map((attendee) => ({
//       recipient: attendee,
//       message: `The course "${course.course_name}" has been deleted.`,
//       notificationType: "COURSE_DELETE",
//       course: course._id,
//     }));
//     await notifications.save();

//     const notification = new NotificationModel({
//       recipient: req.user.id,
//       message: `Your course "${deletedCourse.course_name}" has been deleted successfully.`,
//       activityType: "COURSE_DELETE",
//       relatedId: deletedCourse._id,
//     });

//     await notification.save();

//     res.status(200).json({
//       message: "Course deleted successfully and notifications sent.",
//     });
//   } catch (error) {
//     res.status(500).json(new ApiError(500, error.message || "Server Error"));
//   }
// });

router.get("/trainer", async (req, res) => {
  const trainerId = req.user.id;

  if (!trainerId) res.send("No courses");
  try {
    const courses = await Course.find({ trainerid: trainerId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image business_Name role");

    const baseUrl = req.protocol + "://" + req.get("host");

    const coursesWithFullImageUrls = await Promise.all(
      courses.map((course) => {
        const reviews = course.reviews;
        const totalStars = reviews.reduce(
          (sum, review) => sum + review.star_count,
          0
        );
        const averageRating = totalStars / reviews.length;

        return {
          _id: course?._id,
          course_name: course?.course_name || "",
          category_name: course?.category_id?.category_name || "",
          online_offline: course?.online_offline || "",
          thumbnail_image: course?.thumbnail_image,
          business_Name: course?.trainer_id?.business_Name
            ? course?.trainer_id?.business_Name
            : `${course?.trainer_id?.f_Name || ""} ${
                course?.trainer_id?.l_Name || ""
              }`.trim() || "",
          trainer_image: course?.trainer_id?.trainer_image,
          course_rating: averageRating || "",
          tags: course?.tags || "",
          course_duration: Math.floor(
            Math.round(
              ((course?.end_date - course?.start_date) /
                (1000 * 60 * 60 * 24 * 7)) *
                100
            ) / 100
          ),
          course_price: course?.price || "",
          course_offer_prize: course?.offer_prize || "",
          course_flag: getRoleOrInstitute(course?.trainer_id?.role) || "",
        };
      })
    );

    res.status(200).json(coursesWithFullImageUrls);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
      error: err.message || "An error occurred while fetching courses.",
    });
  }
});

module.exports = router;
