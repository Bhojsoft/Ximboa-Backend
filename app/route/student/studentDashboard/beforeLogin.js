const express = require("express");
const router = express.Router();
const Category = require("../../../../model/category");
const Trainer = require("../../../../model/registration");

const Course = require("../../../../model/course");
const Event = require("../../../../model/event");
const Product = require("../../../../model/product");
const { ApiError } = require("../../../../utils/ApiError");
const InstituteModel = require("../../../../model/Institute/Institute.model");
const Review = require("../../../../model/Review");
const product = require("../../../../model/product");
const { getRoleOrInstitute } = require("../../../../utils/helper");

const NodeCache = require("node-cache");
const { ApiResponse } = require("../../../../utils/ApiResponse");
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

router.get("/home", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const startIndex = (page - 1) * limit;
    const cacheKey = `homeData_page_${page}_limit_${limit}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).send(cachedData);
    }

    const baseUrl = req.protocol + "://" + req.get("host");

    // Fetching courses, categories, trainers, products, events in parallel
    const [courses, categories, trainers, products, events] = await Promise.all(
      [
        Course.find()
          .sort({ createdAt: -1 })
          .skip(startIndex)
          .limit(limit)
          .populate("category_id", "category_name")
          .populate(
            "trainer_id",
            "f_Name l_Name trainer_image business_Name role"
          ),

        Category.find().sort({ createdAt: -1 }).skip(startIndex).limit(9),

        Trainer.aggregate([
          {
            $match: { role: { $in: ["TRAINER", "SELF_EXPERT", "INSTITUTE"] } },
          },
          {
            $lookup: {
              from: "courses",
              localField: "_id",
              foreignField: "trainer_id",
              as: "courses",
            },
          },
          {
            $project: {
              business_Name: 1,
              f_Name: 1,
              l_Name: 1,
              trainer_image: 1,
              role: 1,
              course_count: { $size: "$courses" },
              date_of_birth: 1,
            },
          },
        ])
          .sort({ createdAt: -1 })
          .skip(startIndex)
          .limit(limit),

        product
          .find()
          .sort({ createdAt: -1 })
          .skip(startIndex)
          .limit(limit)
          .populate("categoryid", "category_name")
          .populate("t_id", "role")
          .select(
            "product_image product_name product_selling_prize product_prize product_flag"
          ),

        Event.find()
          .sort({ createdAt: -1 })
          .skip(startIndex)
          .limit(limit)
          .populate("trainerid")
          .select(
            "event_thumbnail event_date event_name event_type event_start_time registered_users event_end_time"
          ),
      ]
    );

    const coursesWithFullImageUrl = courses.map((course) => {
      const reviews = course.reviews || [];
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = reviews.length
        ? (totalStars / reviews.length).toFixed(1)
        : "0";

      return {
        _id: course._id,
        course_name: course.course_name || "",
        category_name: course.category_id?.category_name || "",
        online_offline: course.online_offline || "",
        thumbnail_image: course.thumbnail_image,
        business_Name:
          course.trainer_id?.business_Name ||
          `${course.trainer_id?.f_Name} ${course.trainer_id?.l_Name}`.trim(),
        trainer_image: course.trainer_id?.trainer_image,
        course_rating: averageRating,
        tags: course.tags || "",
        course_duration:
          Math.floor(
            Math.round(
              ((course.end_date - course.start_date) /
                (1000 * 60 * 60 * 24 * 7)) *
                100
            ) / 100
          ) || 1,
        course_price: course.price || "",
        course_offer_prize: course.offer_prize || "",
        course_flag: getRoleOrInstitute(course.trainer_id?.role) || "",
      };
    });

    // Process Categories
    const categoriesWithFullImageUrl = categories.map((category) => ({
      _id: category._id,
      category_name: category.category_name,
      Sub_title: category.sub_title,
      category_image: category.category_image || "",
    }));

    const trainersWithFullImageUrl = await Promise.all(
      trainers.map(async (trainer) => {
        const institute = await InstituteModel.findOne({
          trainers: trainer._id,
        }).select("institute_name social_Media");
        const stcount = await Review.aggregate([
          { $match: { t_id: trainer._id } },
          { $group: { _id: "$t_id", averageRating: { $avg: "$star_count" } } },
        ]);

        return {
          t_id: trainer._id,
          Business_Name: trainer?.business_Name
            ? trainer?.business_Name
            : `${trainer.f_Name} ${trainer.l_Name}`,
          f_Name: trainer.f_Name,
          l_Name: trainer.l_Name,
          role: trainer.role,
          flag: getRoleOrInstitute(trainer.role),
          course_count: trainer.course_count,
          ratings: stcount[0]?.averageRating
            ? stcount[0]?.averageRating?.toFixed(1)
            : "0",
          trainer_image: trainer.trainer_image,
        };
      })
    );

    const productDetails = products.map((product) => ({
      _id: product._id,
      productImage: product.product_image,
      productName: product.product_name || "",
      productPrice: product.product_prize || "",
      productSellingPrice: product.product_selling_prize || "",
      categoryName: product.categoryid?.category_name || "",
      identityFlag: getRoleOrInstitute(product.t_id?.role) || "",
      productFlag: product.product_flag || "",
    }));

    const eventDetails = events.map((event) => ({
      _id: event._id,
      eventImage: event.event_thumbnail,
      eventDate: formatDate(event.event_date) || "",
      eventStartTime: event.event_start_time || "",
      eventEndTime: event.event_end_time || "",
      eventName: event.event_name || "",
      mode: event.event_type || "",
      identityFlag: getRoleOrInstitute(event?.trainerid?.role) || "",
      enrollments: event.registered_users?.length || "",
    }));

    const responseData = {
      trainersWithFullImageUrl,
      categoriesWithFullImageUrl,
      coursesWithFullImageUrl,
      productDetails,
      eventDetails,
    };

    cache.set(cacheKey, responseData);

    res.status(200).send(responseData);
  } catch (err) {
    console.log(err);
    res.status(500).json(new ApiError(500, err.message || "", err));
  }
});

// ========================-- allcategory ------------------------------=======
router.get("/allcategory", async (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");

  try {
    const categories = await Category.find();

    const categoriesWithFullImageUrl = categories.map((category) => {
      return {
        _id: category._id,
        category_name: category?.category_name,
        Sub_title: category?.sub_title,
        category_image: category?.category_image || "",
        __v: category.__v,
        trainer_id: category.trainer_id,
      };
    });

    res.status(200).json(categoriesWithFullImageUrl);
  } catch (err) {
    console.log(err);
    res.status(500).json(new ApiError(500, err?.message || "", err));
  }
});

// ====================================== all Courses ===================----------
router.get("/allcourses", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const startIndex = (page - 1) * limit;
    const totalCourses = await Course.countDocuments();

    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image id city role");

    const baseUrl = req.protocol + "://" + req.get("host");

    const coursesWithFullImageUrl = courses.map((course) => {
      const reviews = course.reviews;
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = totalStars / reviews.length;
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
        course_flag: getRoleOrInstitute(course?.trainer_id?.role) || "",
      };
      return result;
    });

    res.status(200).send({
      coursesWithFullImageUrl,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCourses / limit),
        totalItems: totalCourses,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(
        new ApiError(500, error.message || "Error fetching courses", error)
      );
  }
});

// ========================= All Trainers with pagination ====================================
const InstituteDummyModel = require("../../../../model/InstituteDummy/InstituteDummy.model");
const { defaultCourseImage } = require("../../../../constants");
const { formatDate } = require("../../../../services/servise");

router.get("/trainers", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const baseUrl = req.protocol + "://" + req.get("host");
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  try {
    const [trainers, totalTrainers] = await Promise.all([
      Trainer.aggregate([
        {
          $match: {
            role: { $in: ["TRAINER", "SELF_EXPERT", "INSTITUTE"] },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "trainer_id",
            as: "courses",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categories",
            foreignField: "_id",
            as: "categories",
          },
        },
        {
          $project: {
            business_Name: 1,
            f_Name: 1,
            l_Name: 1,
            trainer_image: 1,
            role: 1,
            course_count: { $size: "$courses" },
            categories: 1,
          },
        },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },
      ]).exec(),
      Trainer.countDocuments({
        role: { $in: ["TRAINER", "SELF_EXPERT"] },
      }).exec(),
    ]);

    // Prepare trainers with institutes and ratings
    const trainersWithDetails = await Promise.all(
      trainers.map(async (trainer) => {
        const [institute, stcount] = await Promise.all([
          InstituteDummyModel.findOne({
            trainers: trainer._id,
          })
            .select("institute_name social_Media")
            .lean(),
          Review.aggregate([
            { $match: { t_id: trainer._id } },
            {
              $group: {
                _id: "$t_id",
                averageRating: { $avg: "$star_count" },
              },
            },
          ]),
        ]);

        return {
          _id: trainer?._id,
          Business_Name: institute
            ? institute.institute_name
            : trainer.business_Name || `${trainer.f_Name} ${trainer.l_Name}`,
          f_Name: trainer.f_Name,
          l_Name: trainer.l_Name,
          role: trainer.role,
          flag: getRoleOrInstitute(trainer.role),
          course_count: trainer.course_count,
          categories: trainer?.categories?.map(
            (category) => category.category_name
          ),
          social_Media: institute ? institute.social_Media : "",
          ratings: stcount[0]?.averageRating
            ? stcount[0]?.averageRating?.toFixed(1)
            : "No ratings yet",
          trainer_image: trainer.trainer_image,
        };
      })
    );

    const Inatitutes = await InstituteDummyModel.find()
      .sort({ createdAt: -1 })
      .limit(limit / 2);

    const Institute = Inatitutes.map((insti) => ({
      _id: insti._id,
      Business_Name: insti?.institute_name || "",
      role: "INSTITUTE",
      flag: "INSTITUTE",
      course_count: insti?.course?.length || "",
      categories: insti?.training_type?.split("|") || "",
      trainer_image: insti?.institute_image
        ? `${baseUrl}/${insti?.institute_image?.replace(/\\/g, "/")}`
        : `${baseUrl}/${defaultCourseImage.replace(/\\/g, "/")}`,
    }));

    // Send the response with trainers and pagination details
    res.status(200).json({
      trainers: [...trainersWithDetails, ...Institute],
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalTrainers / limitNum),
        totalItems: totalTrainers,
        pageSize: limitNum,
      },
    });
  } catch (err) {
    console.error("Error fetching beforlogin/trainers:", err);
    res
      .status(500)
      .json(new ApiError(500, err.message || "Error fetching data", err));
  }
});

// ========================= course/:id ====================================
router.get("/course/:id", async (req, res, next) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");

    const course = await Course.findOne({ _id: req.params.id })
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image business_Name role");

    const reviews = course.reviews;
    const totalStars = reviews.reduce(
      (sum, review) => sum + review.star_count,
      0
    );
    const averageRating = totalStars / reviews.length;

    const coursesWithFullImageUrl = {
      _id: course?._id,
      course_name: course?.course_name || "",
      course_brief_info: course?.course_brief_info || "",
      course_information: course?.course_information || "",
      category_name: course?.category_id?.category_name || "",
      online_offline: course?.online_offline || "",
      thumbnail_image: course?.thumbnail_image,
      start_date: formatDate(course?.start_date) || "",
      end_date: formatDate(course?.end_date) || "",
      start_time: course?.start_time || "",
      end_time: course?.end_time || "",
      business_Name: course?.trainer_id?.business_Name
        ? course?.trainer_id?.business_Name
        : `${course?.trainer_id?.f_Name || ""} ${
            course?.trainer_id?.l_Name || ""
          }`.trim() || "",
      trainer_image: course?.trainer_id?.trainer_image,
      trainer_id: course?.trainer_id?._id,
      course_rating: averageRating ? averageRating?.toFixed(1) : "",
      tags: course?.tags?.split(" ").map((tag) => tag.trim()) || "",
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const startIndex = (page - 1) * limit;
    const result = await Course.find({
      category_id: course?.category_id?.id,
    })
      .skip(startIndex)
      .limit(limit)
      .populate("category_id", "category_name")
      .populate("trainer_id", "f_Name l_Name trainer_image business_Name role");

    if (!result) return res.status(404).json({ message: "Course not found" });
    else {
      const relatedCourses = result.map((course) => {
        const reviews = course.reviews;
        const totalStars = reviews.reduce(
          (sum, review) => sum + review.star_count,
          0
        );
        const averageRating = totalStars / reviews.length;
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
          course_flag: getRoleOrInstitute(course?.trainer_id?.role) || "",
        };
        return result;
      });
      res.status(200).json({ course: coursesWithFullImageUrl, relatedCourses });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(
        new ApiError(
          500,
          err?.message || "Error Getting Course and Related courses",
          err
        )
      );
  }
});

// ========================= event/:id ====================================
router.get("/event/:id", async (req, res) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");
    const eventWithFullImageUrls = await Event.findById(req.params.id)
      .populate(
        "trainerid",
        "f_Name l_Name trainer_image business_Name social_Media role"
      )
      .populate("event_category", "category_name");
    if (!eventWithFullImageUrls) {
      res
        .status(404)
        .json(
          new ApiError(404, "Event NOT Found!", [
            "Check Event is exist or not.",
          ])
        );
    } else {
      const courseCount = await Course.countDocuments({
        trainer_id: eventWithFullImageUrls?.trainerid,
      });

      const stcount = await Review.aggregate([
        { $match: { t_id: eventWithFullImageUrls?.trainerid } },
        {
          $group: {
            _id: "$t_id",
            averageRating: { $avg: "$star_count" },
          },
        },
      ]);

      const institute = await InstituteModel.findOne({
        trainers: eventWithFullImageUrls?.trainerid?._id,
      }).select("institute_name social_Media");

      const event = {
        _id: eventWithFullImageUrls?._id,
        event_thumbnail: eventWithFullImageUrls?.event_thumbnail || "",
        event_info: eventWithFullImageUrls?.event_info || "",
        event_description: eventWithFullImageUrls?.event_description || "",
        event_date: formatDate(eventWithFullImageUrls?.event_date) || "",
        event_start_time: eventWithFullImageUrls?.event_start_time || "",
        event_end_time: eventWithFullImageUrls?.event_end_time || "",
        event_name: eventWithFullImageUrls?.event_name || "",
        event_category:
          eventWithFullImageUrls?.event_category?.category_name || "",
        event_languages: eventWithFullImageUrls?.event_languages || "",
        estimated_seats: eventWithFullImageUrls?.estimated_seats || "",
        event_location: eventWithFullImageUrls?.event_location || "",
        event_type: eventWithFullImageUrls?.event_type || "",
        event_flag:
          getRoleOrInstitute(eventWithFullImageUrls?.traienrid?.role) || "",
        registered_users: eventWithFullImageUrls?.registered_users.length || "",
        trainer_image: eventWithFullImageUrls?.trainerid?.trainer_image,
        trainer_id: eventWithFullImageUrls?.trainerid?._id,
        business_Name: eventWithFullImageUrls?.trainerid?.business_Name
          ? eventWithFullImageUrls?.trainerid?.business_Name
          : `${eventWithFullImageUrls?.trainerid?.f_Name || ""} ${
              eventWithFullImageUrls?.trainerid?.l_Name || ""
            }`.trim() || "",
        social_media: institute?.social_Media
          ? institute?.social_Media
          : eventWithFullImageUrls?.trainerid?.social_Media || "",
        trainier_rating: stcount[0]?.averageRating
          ? stcount[0]?.averageRating?.toFixed(1)
          : "",
        total_course: courseCount || "",
      };
      if (!event) {
        return res.status(404).json(new ApiError(404, "Event not found"));
      }
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 4;

      const startIndex = (page - 1) * limit;
      const result = await Event.find({
        event_category: eventWithFullImageUrls?.event_category?.id,
      })
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit)
        .populate("trainerid", "f_Name l_Name role business_Name")
        .populate("event_category", "category_name");

      const relatedEvent = result.map((event) => ({
        _id: event?._id,
        event_name: event?.event_name || "",
        event_date: formatDate(event?.event_date) || "",
        event_type: event?.event_type || "",
        event_category: event?.event_category?.category_name || "",
        event_flag: eventWithFullImageUrls?.trainerid?.role || "",
        trainer_id: event?.trainerid?._id || "",
        registered_users: event?.registered_users.length || "",
        event_thumbnail: event?.event_thumbnail,
      }));
      res.status(200).json({ event, relatedEvent });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching event", error });
  }
});

// ========================= All Event ====================================
router.get("/allevents", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;

  const startIndex = (page - 1) * limit;
  const totalEvents = await Event.countDocuments();
  const baseUrl = req.protocol + "://" + req.get("host");

  try {
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("event_category", "category_name -_id")
      .populate("trainerid", "f_Name l_Name role business_Name");
    if (!events || events.length === 0) {
      return res.status(404).json(new ApiError(404, "Events not found"));
    }

    const eventsWithThumbnails = events.map((event) => {
      const reviews = event.reviews;
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating = totalStars / reviews.length;

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
        event_thumbnail: event?.event_thumbnail,
      };
      return result;
    });

    // res.status(200).json(eventsWithThumbnails);

    res.status(200).json(
      new ApiResponse(200, "All Events", eventsWithThumbnails, {
        currentPage: page,
        totalPages: Math.ceil(totalEvents / limit),
        totalItems: totalEvents,
        pageSize: limit,
      })
    );
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(new ApiError(500, err.message || "Error fetching Events", err));
  }
});

// ========================= product/:id ====================================
// Get a single product by ID
router.get("/product/:id", async function (req, res, next) {
  const baseUrl = req.protocol + "://" + req.get("host");

  const product = await Product.findOne({ _id: req.params.id })
    .populate("categoryid", "category_name")
    .populate("t_id", "f_Name l_Name business_Name role");

  const reviews = product.reviews;
  const totalStars = reviews.reduce(
    (sum, review) => sum + review.star_count,
    0
  );
  const averageRating = totalStars / reviews.length;

  const productDetail = {
    _id: product?._id,
    product_image: product?.product_image,
    products_info: product?.products_info || "",
    products_description: product?.products_description || "",
    products_rating: averageRating ? averageRating?.toFixed(1) : "",
    products_category: product?.categoryid?.category_name || "",
    products_name: product?.product_name || "",
    products_price: product?.product_prize || "",
    products_selling_price: product?.product_selling_prize || "",
    business_Name: product?.t_id?.business_Name
      ? product?.t_id?.business_Name
      : `${product?.t_id?.f_Name || ""} ${
          product?.t_id?.l_Name || ""
        }`.trim() || "",
    identityFlag: getRoleOrInstitute(product?.t_id?.role) || "",
    product_flag: product?.product_flag || "",
    traienrid: product?.t_id?._id || "",
  };
  if (!product) {
    return res.status(404).json(new ApiError(404, "Event not found"));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;

  const startIndex = (page - 1) * limit;
  const result = await Product.find({
    categoryid: product?.categoryid?._id,
  })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate("t_id", "_id f_Name l_Name")
    .populate("categoryid", "category_name");

  if (!result)
    return res.status(404).json({ message: "Related Products not found" });
  const relatedProducts = result?.map((product) => {
    const reviews = product.reviews;
    const totalStars = reviews.reduce(
      (sum, review) => sum + review.star_count,
      0
    );
    const averageRating = totalStars / reviews.length;

    const result = {
      _id: product?._id,
      product_image: product?.product_image,
      products_category: product?.categoryid?.category_name || "",
      products_rating: averageRating ? averageRating?.toFixed(1) : "",
      products_category: product?.categoryid?.category_name || "",
      products_name: product?.product_name || "",
      products_price: product?.product_prize || "",
      products_selling_price: product?.product_selling_prize || "",
      identityFlag: getRoleOrInstitute(product?.t_id?.role) || "",
      product_flag: product?.product_flag || "",
    };
    return result;
  });
  res.status(200).json({ productDetail, relatedProducts });
});

router.get("/allproduct", async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const baseUrl = req.protocol + "://" + req.get("host");

    // Run both count and find queries in parallel using Promise.all()
    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(),
      Product.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .populate("categoryid", "category_name")
        .populate("t_id", "f_Name l_Name role")
        .select(
          "product_image categoryid product_name product_prize product_selling_prize reviews product_flag"
        ),
    ]);

    // Map the products to the required format
    const productsWithFullImageUrls = products.map((product) => {
      const reviews = product.reviews || [];
      const totalStars = reviews.reduce(
        (sum, review) => sum + review.star_count,
        0
      );
      const averageRating =
        reviews.length > 0 ? totalStars / reviews.length : null;

      return {
        _id: product._id,
        product_image: product.product_image,
        products_category: product.categoryid?.category_name || "",
        products_rating: averageRating
          ? averageRating?.toFixed(1)
          : "No reviews",
        products_name: product.product_name || "",
        products_price: product.product_prize || "",
        products_selling_price: product.product_selling_prize || "",
        identityFlag: getRoleOrInstitute(product.t_id?.role) || "",
        product_flag: product.product_flag || "",
      };
    });

    // Respond with products and pagination info
    res.status(200).json({
      productsWithFullImageUrls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalItems: totalProducts,
        pageSize: limit,
      },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res
      .status(500)
      .json(new ApiError(500, "Server Error fetching all products", err));
  }
});

module.exports = router;
