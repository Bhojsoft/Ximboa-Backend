const course = require("../../model/course");
const Event = require("../../model/event");
const product = require("../../model/product");
const registration = require("../../model/registration");

const unifiedSearch = async (req, res) => {
  try {
    const {
      type,
      category_id,
      name,
      min_price,
      max_price,
      level,
      date,
      availability,
    } = req.query;

    let query = {};

    if (category_id) {
      query.category_id = category_id;
    }

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if ((min_price || max_price) && (type === "course" || type === "product")) {
      query.price = {};
      if (min_price) query.price.$gte = parseFloat(min_price);
      if (max_price) query.price.$lte = parseFloat(max_price);
    }

    if (level && type === "course") {
      query.level = level;
    }

    if (date && type === "event") {
      query.date = { $gte: new Date(date) };
    }

    if (availability && type === "product") {
      query.availability = availability === "true";
    }

    let results;
    switch (type) {
      case "course":
        results = await course
          .find(query)
          .populate("category_id", "name")
          .exec();
        break;
      case "product":
        results = await product
          .find(query)
          .populate("categoryid", "category_name")
          .exec();
        break;
      case "event":
        results = await Event.find(query)
          .populate("event_category", "category_name")
          .exec();
        break;
      case "trainer":
        results = await registration
          .find(query)
          .populate("categories", "category_name")
          .exec();
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid type provided" });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

module.exports = { unifiedSearch };
