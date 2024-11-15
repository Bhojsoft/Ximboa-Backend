const express = require("express");
const router = express.Router();
const Trainer = require("../../../model/registration");
const Course = require("../../../model/course");
const Review = require("../../../model/Review");
const Product = require("../../../model/product");
const Event = require("../../../model/event");
const about = require("../../../model/about");
const Education = require("../../../model/education");
const SocialMedia = require("../../../model/socialMedia");
const testemonial = require("../../../model/testemonial");
const gallary = require("../../../model/gallary");
const { ApiError } = require("../../../utils/ApiError");
const InstituteModel = require("../../../model/Institute/Institute.model");
const { default: mongoose } = require("mongoose");
const registration = require("../../../model/registration");
const InstituteDummyModel = require("../../../model/InstituteDummy/InstituteDummy.model");
const { getRoleOrInstitute } = require("../../../utils/helper");
const { defaultCourseImage } = require("../../../constants");
const { formatDate } = require("../../../services/servise");

router.get("/:id", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const startIndex = (page - 1) * limit;

    const trainerId = req.params.id;
    let trainer;

    const stcount = await Review.aggregate([
      { $match: { t_id: trainerId } },
      { $group: { _id: "$t_id", averageRating: { $avg: "$star_count" } } },
    ]);

    let trainers = await InstituteDummyModel.findById(trainerId).select(
      "-password -resetPasswordExpires -resetPasswordToken -requested_Role"
    );
    if (!trainers) {
      trainer = await registration
        .findById(trainerId)
        .select(
          "-password -resetPasswordExpires -resetPasswordToken -requested_Role"
        );

      if (trainer.role === "TRAINER") {
        const institute = await InstituteModel.findOne({
          trainers: { $in: [trainerId] },
        }).select("admins");

        trainer = await registration.findById(institute?.admins[0]);
      }
    } else {
      trainer = {
        _id: trainers._id || "",
        f_Name: "",
        l_Name: "",
        business_Name: trainers?.institute_name || "",
        address1: trainers?.location !== "NA" ? trainers?.location : "",
        address2: "",
        mobile_number:
          trainers?.Whatsapp_number !== "NA"
            ? trainers?.Whatsapp_number
            : "" || "",
        whatsapp_no:
          trainers?.Whatsapp_number !== "NA"
            ? trainers?.Whatsapp_number
            : "" || "",
        ratings: stcount[0]?.averageRating
          ? stcount[0]?.averageRating?.toFixed(1)
          : "0",
        About:
          trainers?.About[0]?.about_us !== "NA" ? trainers?.About : "" || "",
      };
    }

    if (!trainer) return res.status(400).json({ message: "No Data Available" });

    const institutes = await InstituteDummyModel.findOne({
      trainers: trainerId,
    });

    const baseUrl = req.protocol + "://" + req.get("host");

    const Products = await Product.find({ t_id: trainerId })
      .sort({ createdAt: -1 })
      .populate("categoryid", "category_name")
      .populate("t_id", "f_Name l_Name role");

    const productsWithFullImageUrl = Products.map((product) => {
      const reviews = product.reviews;
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = totalStars / reviews.length;
      return {
        _id: product?._id,
        product_image: product?.product_image || "",
        products_category: product?.categoryid?.category_name || "",
        products_rating: averageRating ? averageRating?.toFixed(1) : "",
        products_category: product?.categoryid?.category_name || "",
        products_name: product?.product_name || "",
        products_price: product?.product_prize || "",
        products_selling_price: product?.product_selling_prize || "",
        identityFlag: product?.t_id?.role
          ? getRoleOrInstitute(product?.t_id?.role)
          : "",
        product_flag: product?.product_flag || "",
      };
    });

    const onlineEvents = await Event.find({
      trainerid: trainerId,
      event_type: "Online",
    })
      .sort({ createdAt: -1 })
      .populate("event_category", "category_name -_id")
      .populate("trainerid", "f_Name l_Name");

    const onlineEventsThumbnailUrl = onlineEvents.map((event) => {
      const reviews = event.reviews;
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = totalStars / reviews.length;
      return {
        _id: event?._id,
        event_name: event?.event_name || "",
        event_date: formatDate(event?.event_date) || "",
        event_category: event?.event_category?.category_name || "",
        event_type: event?.event_type || "",
        trainer_id: event?.trainerid?._id || "",
        event_rating: averageRating ? averageRating?.toFixed(1) : "",
        registered_users: event?.registered_users.length || "",
        event_thumbnail: event?.event_thumbnail,
      };
    });
    const offlienEvents = await Event.find({
      trainerid: trainerId,
      event_type: "Offline",
    })
      .sort({ createdAt: -1 })
      .populate("event_category", "category_name -_id")
      .populate("trainerid", "f_Name l_Name");
    const offlienEventsThumbnailUrl = offlienEvents.map((event) => {
      const reviews = event?.reviews;
      const totalStars = reviews?.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = totalStars / reviews.length;
      return {
        _id: event?._id,
        event_name: event?.event_name || "",
        event_date: formatDate(event?.event_date) || "",
        event_category: event?.event_category?.category_name || "",
        event_type: event?.event_type || "",
        trainer_id: event?.trainerid?._id || "",
        event_rating: averageRating ? averageRating?.toFixed(1) : "",
        registered_users: event?.registered_users.length || "",
        event_thumbnail: event?.event_thumbnail,
      };
    });

    const About = await about.find({ trainer: trainerId });

    const reviewsData = institutes
      ? await Review.findOne({ institute_id: institutes._id })
      : await Review.find({ t_id: trainerId })
          .sort({
            createdAt: -1,
          })
          .populate("user_id", "f_Name l_Name trainer_image");

    // console.log(institutes._id);
    const reviews = institutes
      ? reviewsData
      : reviewsData.map((review) => {
          return {
            _id: review?._id,
            user_id: review?.user_id?._id,
            f_Name: review?.user_id?.f_Name,
            l_Name: review?.user_id?.l_Name,
            user_image: review?.user_id?.trainer_image,
            review: review?.review,
            star_count: review?.star_count,
            createdAt: review?.createdAt,
          };
        });
    const Educations = await Education.find({ trainer_id: { $in: trainerId } });

    const SocialMedias = await SocialMedia.find({
      trainer_id: { $in: trainerId },
    });

    const testimonials = await testemonial
      .find({
        trainer_id: { $in: trainerId },
      })
      .sort({
        createdAt: -1,
      });

    const gallarysWithoutImages = await gallary
      .find({
        trainer_id: { $in: trainerId },
      })
      .sort({
        createdAt: -1,
      });
    const gallarys = await gallarysWithoutImages[0]?.photos?.map((photo) => {
      return {
        photos: photo ? `${baseUrl}/${photo.replace(/\\/g, "/")}` : "",
      };
    });

    const currentDate = new Date().toISOString();

    const ongoingCourses = await Course.find({
      trainer_id: trainerId,
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
    })
      ?.sort({
        createdAt: -1,
      })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image business_Name role");

    const OnGoingBatches = ongoingCourses.map((course) => {
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
        course_rating: averageRating ? averageRating?.toFixed(1) : "",
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
      };
    });

    const upcomingCourses = await Course.find({
      trainer_id: { $in: trainerId },
      start_date: { $gt: currentDate },
    })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image business_Name role");

    const UpcomingBatches = upcomingCourses.map((course) => {
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
        course_rating: averageRating ? averageRating?.toFixed(1) : "",
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
      };
    });

    res.status(200).json({
      gallarys: gallarys || "",
      Business_Name: `${trainer?.business_Name}`,
      trainer,
      skills:
        trainer?.skills ||
        trainers?.courses?.map((course) => course?.split("|"))[0] ||
        "",
      About: trainers ? [trainers].map((i) => i?.About) : About || "",
      Educations,
      testimonials,
      SocialMedias: institutes ? institutes?.SocialMedias : SocialMedias,
      OnGoingBatches,
      UpcomingBatches,
      onlineEventsThumbnailUrl,
      offlienEventsThumbnailUrl,
      productsWithFullImageUrl,
      reviews,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json(new ApiError(400, "Validation Error", error.errors));
    } else {
      res.status(500).json(new ApiError(500, "Server Error", error));
    }
  }
});

module.exports = router;
