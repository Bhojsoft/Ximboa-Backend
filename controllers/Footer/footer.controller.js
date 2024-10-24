// const Categories = require("../../model/category");
// const Course = require("../../model/course");
// const { asyncHandler } = require("../../utils/asyncHandler");
// const { ApiError } = require("../../utils/ApiError");
// const registration = require("../../model/registration");
// const Product = require("../../model/product");
// const Event = require("../../model/event");

// const Footer = asyncHandler(async (req, res) => {
//   try {
//     const courses = await Course.find().select("course_name");
//     const Category = await Categories.find().select("category_name");
//     const trainers = await registration.find(
//       { role: { $in: ["TRAINER", "SELF_TRAINER"] } },
//       "f_Name l_Name"
//     );
//     const products = await Product.find().select("product_name");
//     const events = await Event.find().select("event_name");
//     res.status(200).json({
//       Category,
//       courses,
//       trainers,
//       products,
//       events,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json(new ApiError(500, error.message || "Server error", error));
//   }
// });

// module.exports = { Footer };

const NodeCache = require("node-cache");
const Categories = require("../../model/category");
const Course = require("../../model/course");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");
const registration = require("../../model/registration");
const Product = require("../../model/product");
const Event = require("../../model/event");

// Initialize cache (stdTTL is the time-to-live for cached items in seconds)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // Cache for 10 minutes

const Footer = asyncHandler(async (req, res) => {
  const cacheKey = "footerData";

  // Check if data is in the cache
  let cachedData = cache.get(cacheKey);

  if (cachedData) {
    // Return cached data immediately for fast response
    res.status(200).json(cachedData);

    // In the background, update the cache with fresh data
    updateFooterData(cacheKey);
  } else {
    // If no cached data, fetch from the database
    try {
      const freshData = await fetchFooterData();
      cache.set(cacheKey, freshData); // Cache the fresh data
      res.status(200).json(freshData);
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, error.message || "Server error", error));
    }
  }
});

// Function to fetch data from the database
const fetchFooterData = async () => {
  const [courses, Category = categories, trainers, products, events] =
    await Promise.all([
      Course.find().select("course_name").lean(),
      Categories.find().select("category_name").lean(),
      registration
        .find({ role: { $in: ["TRAINER", "SELF_TRAINER"] } }, "f_Name l_Name")
        .lean(),
      Product.find().select("product_name").lean(),
      Event.find().select("event_name").lean(),
    ]);

  return { Category, courses, trainers, products, events };
};

// Function to asynchronously update cache in the background
const updateFooterData = async (cacheKey) => {
  try {
    const freshData = await fetchFooterData();
    cache.set(cacheKey, freshData);
  } catch (error) {
    console.error(`Error updating footer data cache: ${error.message}`);
  }
};

module.exports = { Footer };
