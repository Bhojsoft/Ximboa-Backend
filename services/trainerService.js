const course = require("../model/course");
const registration = require("../model/registration");
const socialMedia = require("../model/socialMedia");

async function getTrainerDetails(trainerId) {
  return registration
    .findById(trainerId)
    .select(
      "-password -resetPasswordExpires -resetPasswordToken -requested_Role"
    );
}

async function getCourses(trainerId, page, limit) {
  const startIndex = (page - 1) * limit;
  return course
    .find({ trainer_id: trainerId })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate("category_id", "category_name")
    .populate("trainer_id", "f_Name l_Name trainer_image business_Name role");
}

async function getProducts(trainerId, page, limit) {
  const startIndex = (page - 1) * limit;
  return Product.find({ t_id: trainerId })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate("categoryid", "category_name")
    .populate("t_id", "f_Name l_Name role");
}

async function getEvents(trainerId, page, limit) {
  const startIndex = (page - 1) * limit;
  return Event.find({ trainerid: trainerId })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate("event_category", "category_name -_id")
    .populate("trainerid", "f_Name l_Name");
}

async function getSocialMedia(trainerId) {
  return socialMedia.find({ trainer_id: trainerId });
}

module.exports = {
  getTrainerDetails,
  getCourses,
  getProducts,
  getEvents,
  getSocialMedia,
};
