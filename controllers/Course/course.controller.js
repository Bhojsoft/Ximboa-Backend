// const Course = require("../../model/course");
// const { ApiError } = require("../../utils/ApiError");
// const { default: mongoose } = require("mongoose");
// const { ApiResponse } = require("../../utils/ApiResponse");
// const { getRoleOrInstitute } = require("../../utils/helper");

// // Get courses filtered by multiple categories
// const getCoursesByFilter = async (req, res) => {
//   try {
//     const { categories } = req.query;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const startIndex = (page - 1) * limit;

//     if (!categories || categories.length === 0) {
//       return res.status(400).json({
//         message: "Categories parameter is required",
//       });
//     }

//     const categoryArray = categories.split(",");

//     const courses = await Course.find({ category_id: { $in: categoryArray } })
//       .sort({ createdAt: -1 })
//       .skip(startIndex)
//       .limit(limit)
//       .populate("category_id", "category_name")
//       .populate("trainer_id", "f_Name l_Name trainer_image business_Name role");

//     if (!courses || courses.length === 0) {
//       return res.status(404).json({
//         message: "No courses found for the selected categories",
//       });
//     }

//     const baseUrl = req.protocol + "://" + req.get("host");

//     const coursesWithFullImageUrl = courses.map((course) => {
//       const reviews = course.reviews;
//       const totalStars = reviews.reduce(
//         (sum, review) => sum + review.star_count,
//         0
//       );
//       const averageRating = totalStars / reviews.length;
//       const result = {
//         _id: course?._id,
//         category_name: course?.category_id?.category_name || "",
//         course_name: course?.course_name || "",
//         online_offline: course?.online_offline || "",
//         thumbnail_image: course?.thumbnail_image
//           ? `${baseUrl}/${course?.thumbnail_image?.replace(/\\/g, "/")}`
//           : "",
//         trainer_image: course?.trainer_id?.trainer_image
//           ? `${baseUrl}/${course?.trainer_id?.trainer_image?.replace(
//               /\\/g,
//               "/"
//             )}`
//           : "",
//         trainer_id: course?.trainer_id?._id,
//         business_Name: course?.trainer_id?.business_Name
//           ? course?.trainer_id?.business_Name
//           : `${course?.trainer_id?.f_Name || ""} ${
//               course?.trainer_id?.l_Name || ""
//             }`.trim() || "",
//         course_rating: averageRating || "",
//         course_duration: Math.floor(
//           Math.round(
//             ((course?.end_date - course?.start_date) /
//               (1000 * 60 * 60 * 24 * 7)) *
//               100
//           ) / 100
//         ),
//         course_price: course?.price || "",
//         course_offer_prize: course?.offer_prize || "",
//         course_flag: getRoleOrInstitute(course?.trainer_id?.role) || "",
//       };
//       return result;
//     });

//     res.status(200).json(
//       new ApiResponse(200, "Filter Courses Success", coursesWithFullImageUrl, {
//         currentPage: page,
//         totalPages: Math.ceil(courses?.length / limit),
//         totalItems: courses?.length,
//         pageSize: limit,
//       })
//     );
//   } catch (error) {
//     console.log(error);
//     if (error instanceof mongoose.Error.ValidationError) {
//       res.status(400).json(new ApiError(400, "Validation Error", error.errors));
//     } else {
//       res.status(500).json(new ApiError(500, "Server Error", error));
//     }
//   }
// };

// module.exports = {
//   getCoursesByFilter,
// };

const Course = require("../../model/course");
const { ApiError } = require("../../utils/ApiError");
const { default: mongoose } = require("mongoose");
const { ApiResponse } = require("../../utils/ApiResponse");
const { getRoleOrInstitute } = require("../../utils/helper");

// Get courses filtered by multiple categories (using category_name)
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

    // Find courses based on populated category_name
    const courses = await Course.find({})
      .populate("category_id", "category_name") // Populate category_name
      .populate("trainer_id", "f_Name l_Name trainer_image business_Name role")
      .lean(); // Use lean for better performance

    // Filter courses by category_name (case-insensitive match)
    const filteredCourses = courses.filter((course) =>
      categoryArray.includes(course?.category_id?.category_name)
    );

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
          thumbnail_image: course?.thumbnail_image
            ? `${baseUrl}/${course?.thumbnail_image?.replace(/\\/g, "/")}`
            : "",
          trainer_image: course?.trainer_id?.trainer_image
            ? `${baseUrl}/${course?.trainer_id?.trainer_image?.replace(
                /\\/g,
                "/"
              )}`
            : "",
          trainer_id: course?.trainer_id?._id,
          business_Name: course?.trainer_id?.business_Name
            ? course?.trainer_id?.business_Name
            : `${course?.trainer_id?.f_Name || ""} ${
                course?.trainer_id?.l_Name || ""
              }`.trim() || "",
          course_rating: averageRating || "",
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
};

module.exports = {
  getCoursesByFilter,
};
