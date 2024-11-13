const Course = require("../../model/course");
const InstituteDummyModel = require("../../model/InstituteDummy/InstituteDummy.model");
const InstituteDummy = require("../../model/InstituteDummy/InstituteDummy.model");
const registration = require("../../model/registration");
const { ApiError } = require("../../utils/ApiError");

// Bulk insert controller for institutes
const bulkInsertInstitutes = async (req, res) => {
  try {
    const institutes = req.body.institutes;

    if (!institutes || institutes.length === 0) {
      return res.status(400).json({ message: "No institutes provided" });
    }

    const result = await InstituteDummy.insertMany(institutes);

    return res.status(201).json({
      message: "Institutes added successfully",
    });
  } catch (error) {
    console.error("Bulk insert error:", error);
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          error.message | "An error occurred while inserting institutes",
          error
        )
      );
  }
};

const multer = require("multer");
const XLSX = require("xlsx");

// Configure multer for file uploads
const upload1 = multer({
  storage: multer.memoryStorage(), // Store file in memory to avoid file system usage
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

const bulkInsertInstitutesFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No Excel file provided" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const institutes = XLSX.utils.sheet_to_json(sheet);

    if (institutes.length === 0) {
      return res.status(400).json({ message: "No data found in Excel sheet" });
    }

    // Insert the data into MongoDB
    const result = await InstituteDummy.insertMany(institutes);

    institutes.map(async (insti, i) =>
      insti.courses.split(" |\n").map(async (course) => {
        console.log(result[i]._id);
        return;
        // if (!course) return;
        // const cour = new Course({
        //   course_name: course,
        //   online_offline: "null",
        //   price: 0,
        //   offer_prize: 0,
        //   start_date: Date.now(),
        //   end_date: Date.now(),
        //   start_time: 0,
        //   end_time: 0,
        //   tags: course,
        //   thumbnail_image: "public/ximboa_default.jpg",
        //   course_brief_info: "null",
        //   course_information: null,
        //   category_id: "66ab41e6140842cf792196d1",
        //   trainer_id: result[i]._id,
        // });
        // return await cour.save();
      })
    );

    return res.status(201).json({
      message: "Institutes added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Bulk insert from Excel error:", error);
    return res.status(500).json({
      message: "An error occurred while inserting institutes",
      error: error.message,
    });
  }
};

const getInstitutes = async (req, res) => {
  try {
    const { page = 1, limit = 10, verified } = req.query;
    const query = {};

    if (verified) {
      query.isVerifiedBySuperAdmin = verified === "true";
    }

    const skip = (page - 1) * limit;

    const institutes = await InstituteDummy.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const totalInstitutes = await InstituteDummy.countDocuments(query);

    return res.status(200).json({
      message: "Institutes fetched successfully",
      institutes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalInstitutes / limit),
        totalItems: totalInstitutes,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching institutes:", error);
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          error.message || "An error occurred while fetching institutes",
          error
        )
      );
  }
};

// Add Trainer to the Institute
const addTrainer = async (req, res) => {
  try {
    const { instituteId, trainerId } = req.body;

    // Check if the trainer exists
    const trainer = await registration.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Add trainer to the institute
    const institute = await InstituteDummyModel.findByIdAndUpdate(
      instituteId,
      { $addToSet: { trainers: trainerId } },
      { new: true }
    );

    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    return res
      .status(200)
      .json({ message: "Trainer added successfully", institute });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding trainer", error: error.message });
  }
};

// Add Admin to the Institute
const addAdmin = async (req, res) => {
  try {
    const { instituteId, adminId } = req.body;

    // Check if the admin exists
    const admin = await registration.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Add admin to the institute
    const institute = await InstituteDummyModel.findByIdAndUpdate(
      instituteId,
      { $addToSet: { admins: adminId } }, // $addToSet prevents duplicate entries
      { new: true } // Return the updated document
    );

    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    return res
      .status(200)
      .json({ message: "Admin added successfully", institute });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding admin", error: error.message });
  }
};

module.exports = {
  upload1,
  bulkInsertInstitutes,
  bulkInsertInstitutesFromExcel,
  getInstitutes,
  addTrainer,
  addAdmin,
};
