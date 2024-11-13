const Trainer = require("../../model/registration");
const InstituteModel = require("../../model/Institute/Institute.model");
const Review = require("../../model/reviews.model");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { getRoleOrInstitute } = require("../../utils/helper");

// Get trainers filtered by multiple categories
const getTrainersByFilter = async (req, res) => {
  try {
    const { categories, role } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const baseUrl = req.protocol + "://" + req.get("host");

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        message: "Categories parameter is required",
      });
    }

    const categoryArray = categories.split(",").map((cat) => cat.trim());

    const matchFilter = {
      role: {
        $in: role ? role.split(",") : ["TRAINER", "SELF_EXPERT", "INSTITUTE"],
      },
    };

    const trainers = await Trainer.aggregate([
      {
        $match: matchFilter,
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
          categories: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]).exec();

    // Filter trainers by category_name
    const filteredTrainers = trainers.filter((trainer) => {
      return categoryArray.some((cat) =>
        trainer?.categories?.some((category) =>
          new RegExp(
            `^${cat.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$")}$`,
            "i"
          ).test(category.category_name)
        )
      );
    });

    if (!filteredTrainers || filteredTrainers.length === 0) {
      return res.status(404).json({
        message: "No trainers found for the selected categories",
      });
    }

    const trainersWithDetails = await Promise.all(
      filteredTrainers
        .slice(startIndex, startIndex + limit)
        .map(async (trainer) => {
          const [institute, stcount] = await Promise.all([
            InstituteModel.findOne({
              trainers: trainer._id,
            })
              .select("institute_name social_Media")
              .lean(),
            //   Review.aggregate([
            //     { $match: { t_id: trainer._id } },
            //     {
            //       $group: {
            //         _id: "$t_id",
            //         averageRating: { $avg: "$star_count" },
            //       },
            //     },
            //   ]),
          ]);

          return {
            _id: trainer?._id,
            Business_Name: institute
              ? institute.institute_name
              : trainer.business_Name ||
                `${trainer.f_Name} ${trainer.l_Name}`.trim(),
            f_Name: trainer.f_Name,
            l_Name: trainer.l_Name,
            role: trainer.role,
            flag: getRoleOrInstitute(trainer.role),
            course_count: trainer.course_count,
            categories: trainer?.categories?.map(
              (category) => category.category_name
            ),
            social_Media: institute ? institute.social_Media : "",
            ratings: "No ratings yet",
            trainer_image: trainer.trainer_image,
          };
        })
    );

    res.status(200).json(
      new ApiResponse(200, "Filter Trainers Success", trainersWithDetails, {
        currentPage: page,
        totalPages: Math.ceil(filteredTrainers?.length / limit),
        totalItems: filteredTrainers?.length,
        pageSize: limit,
      })
    );
  } catch (error) {
    console.error("Error fetching trainers:", error);
    res.status(500).json(new ApiError(500, "Server Error", error));
  }
};

module.exports = {
  getTrainersByFilter,
};
