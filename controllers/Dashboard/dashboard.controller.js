const Course = require("../../model/course");
const Event = require("../../model/event");
const Product = require("../../model/product");
const registration = require("../../model/registration");
const Enrollment = require("../../model/Student/Enrollment");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

exports.getDashboardCountsForUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let dashboardData = {};

    if (
      userRole === "TRAINER" ||
      userRole === "SELF_EXPERT" ||
      userRole === "INSTITUTE"
    ) {
      const totalCourses = await Course.countDocuments({ trainer_id: userId });

      const totalEvents = await Event.countDocuments({ trainerid: userId });

      const totalProducts = await Product.countDocuments({ t_id: userId });

      dashboardData = {
        totalCourses,
        totalEvents,
        totalProducts,
      };
    } else {
      const enrolledCourses = await Enrollment.countDocuments({
        user_id: userId,
      });
      const registeredEvents = await Event.countDocuments({
        registered_users: userId,
      });
      const purchasedProducts = await Product.countDocuments({
        purchased_by: userId,
      });

      dashboardData = {
        enrolledCourses,
        registeredEvents,
        purchasedProducts,
      };
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Dashboard data fetched successfully",
          dashboardData
        )
      );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res
      .status(500)
      .json(new ApiError(500, "Error fetching dashboard data", error));
  }
});

exports.getBreadcrumb = async (req, res) => {
  try {
    const { category, type, id } = req.query; // Get category, type, and id from the query parameters

    let breadcrumb = [
      { label: "Home", url: "/" }, // Home is always present
    ];

    // Handle the "Category" part of the breadcrumb
    if (category) {
      breadcrumb.push({ label: category, url: `/category/${category}` });
    } else {
      breadcrumb.push({ label: "All", url: "/category/all" });
    }

    let totalCount;
    let selectedItem = null;

    // Handle different types (course, product, event, trainers)
    switch (type) {
      case "course":
        totalCount = await Course.countDocuments();
        breadcrumb.push({
          label: `Courses (${totalCount})`,
          url: "/category/courses",
        });
        if (id) {
          selectedItem = await Course.findById(id, "name");
          if (selectedItem) {
            breadcrumb.push({ label: selectedItem.name, url: `/course/${id}` });
          }
        }
        break;

      case "product":
        totalCount = await Product.countDocuments();
        breadcrumb.push({
          label: `Products (${totalCount})`,
          url: "/category/products",
        });
        if (id) {
          selectedItem = await Product.findById(id, "name");
          if (selectedItem) {
            breadcrumb.push({
              label: selectedItem.name,
              url: `/product/${id}`,
            });
          }
        }
        break;

      case "event":
        totalCount = await Event.countDocuments();
        breadcrumb.push({
          label: `Events (${totalCount})`,
          url: "/category/events",
        });
        if (id) {
          selectedItem = await Event.findById(id, "name");
          if (selectedItem) {
            breadcrumb.push({ label: selectedItem.name, url: `/event/${id}` });
          }
        }
        break;

      case "trainers":
        totalCount = await registration.countDocuments();
        breadcrumb.push({
          label: `Trainers (${totalCount})`,
          url: "/category/trainers",
        });
        if (id) {
          selectedItem = await registration.findById(id, "f_Name l_Name");
          if (selectedItem) {
            breadcrumb.push({
              label: `${selectedItem.f_Name} ${selectedItem.l_Name}`,
              url: `/trainer/${id}`,
            });
          }
        }
        break;

      default:
        return res.status(400).json({ message: "Invalid type provided" });
    }

    res.json({ breadcrumb });
  } catch (error) {
    console.error("Error generating breadcrumb:", error);
    res.status(500).json({ message: "Error generating breadcrumb" });
  }
};
