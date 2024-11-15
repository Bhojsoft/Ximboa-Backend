const InstituteModel = require("../../model/Institute/Institute.model");
const Registration = require("../../model/registration");
const Course = require("../../model/course"); // Course model
const Enrollment = require("../../model/Student/Enrollment"); // Enrollment model
const Product = require("../../model/product"); // Product model

const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { sendEmail } = require("../../utils/email");
const NotificationModel = require("../../model/Notifications/Notification.model");
const { sendMail } = require("../../utils/email"); // Existing sendMail function
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userRegistration = asyncHandler(async (req, res) => {
  const {
    f_Name,
    middle_Name,
    l_Name,
    email_id,
    password,
    isTrainer,
    mobile_number,
    date_of_birth,
    whatsapp_no,
    rating_count,
    address1,
    address2,
    city,
    country,
    state,
    pincode,
  } = req.body;

  const trainer_image = req.file ? req.file.path : "";

  const newRegistration = new Registration({
    f_Name,
    middle_Name,
    l_Name,
    email_id,
    password,
    isTrainer,
    mobile_number,
    trainer_image,
    date_of_birth,
    whatsapp_no,
    rating_count,
    address1,
    address2,
    city,
    country,
    state,
    pincode,
  });

  // Check if user already exists
  const existingUser = await Registration.findOne({ email_id });
  if (existingUser) {
    return res.status(409).json(new ApiError(409, "email_id already exists"));
  }

  const existingMobileNumber = await Registration.findOne({
    mobile_number: mobile_number,
  });
  if (existingMobileNumber) {
    return res
      .status(409)
      .json(new ApiError(409, "Mobile number is already registered"));
  }

  newRegistration
    .save()
    .then((result) => {
      sendSuccessEmail(email_id, f_Name);
      res
        .status(200)
        .json(new ApiResponse(200, "Registration Success", result.f_Name));
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json(new ApiError(500, err.message || "Server Error", err));
    });
});

// POST route to validate user login ----------------------------------------------------------------

const { generateToken } = require("../../utils/tokenHelper"); // Token generation helper
const registration = require("../../model/registration");
const { formatDate } = require("../../services/servise");

const loginController = async (req, res) => {
  try {
    const { email_id, password } = req.body;

    // Step 1: Find the user by email
    const user = await Registration.findOne({ email_id });
    if (!user) {
      return res
        .status(400)
        .json(new ApiError(400, "Invalid email or password"));
    }

    // Step 2: Compare the provided password with the hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json(new ApiError(400, "Invalid email or password"));
    }

    // Step 3: Generate a JWT token
    const payload = {
      id: user.id,
      role: user.role,
      username: user.email_id,
    };
    const token = generateToken(payload, req); // Utility function for token generation

    // Step 4: Send login success email
    sendMail("loginSuccess", {
      name: user.f_Name,
      email: user.email_id,
    });

    // Step 5: Create a login success notification
    const notification = new NotificationModel({
      recipient: user._id,
      message: `Welcome back ${user.f_Name} ${user.l_Name}, Login successful.`,
      activityType: "LOGIN_SUCCESS",
      relatedId: user._id,
    });
    await notification.save();

    // Step 6: Send response with the token and profile image URL (if available)
    res.status(200).json({
      token,
      profile: user.trainer_image,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(new ApiError(500, err.message || "Server Error while Login", err));
  }
};

// Forget Passward controller ----------------------------------------------------------------
const forgetPassward = async (req, res) => {
  const { email_id } = req.body;
  try {
    const user = await Registration.findOne({ email_id: email_id });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }
    const generateResetToken = (userId) => {
      return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
    };
    const token = generateResetToken(user._id);
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    user.resetPasswordToken = token;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    sendEmail(
      "forgotPassword",
      {
        name: user.f_Name,
        email: user.email_id,
      },
      [resetLink, (userName = user.f_Name)]
    );

    res.status(200).json({ message: "Reset link sent to email", token });
  } catch (err) {
    console.log(err);
    res.status(500).json(new ApiError(500, err.message, err));
  }
};

// Reset Passward controller ----------------------------------------------------------------
const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const token = req.query.token;
  console.log(token, newPassword);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Registration.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json(new ApiError(400, "Invalid or expired token"));
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    // console.log(error);
    res.status(500).json(new ApiError(500, error.message, error));
  }
};

const requestRoleChange = asyncHandler(async (req, res) => {
  try {
    const { requested_Role, business_Name, address_1, email } = req.body;
    const userId = req.user.id;
    if (!["INSTITUTE", "SELF_EXPERT", "TRAINER"].includes(requested_Role)) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Invalid role request."));
    }

    if (requested_Role === "SELF_EXPERT") {
      if (requested_Role == "SELF_EXPERT") {
        const user = await Registration.findById(userId);

        if (user?.requested_Role) {
          return res
            .status(400)
            .json(
              new ApiResponse(400, "Role change request is already pending.")
            );
        }

        await Registration.findByIdAndUpdate(userId, {
          requested_Role: requested_Role,
          business_Name,
        });

        const superAdmin = await Registration.findOne({ role: "SUPER_ADMIN" });
        const Admin = await Registration.findOneAndUpdate(
          { role: "SUPER_ADMIN", "requests.userid": userId },
          {
            $set: {
              "requests.$.requestedRole": requested_Role,
              "requests.$.status": "pending",
            },
          },
          { new: true }
        );

        if (!Admin) {
          await Registration.findOneAndUpdate(
            { role: "SUPER_ADMIN" },
            {
              $push: {
                requests: {
                  userid: userId,
                  requestedRole: requested_Role,
                },
              },
            },
            { new: true }
          );
        }

        if (
          requested_Role === "INSTITUTE" ||
          requested_Role === "SELF_EXPERT"
        ) {
          if (!superAdmin) {
            return res
              .status(500)
              .json(
                new ApiError(
                  500,
                  "No SUPER_ADMIN found to approve the request."
                )
              );
          }
          const userEmail = req.user.username;
          const userName = user.f_Name;

          sendEmail(
            "roleChangeRequestToSuperAdmin",
            {
              name: superAdmin.f_Name,
              email: superAdmin.email_id,
            },
            [requested_Role, userId, userEmail, userName]
          );
        }

        const notificationToSuperAdmin = new NotificationModel({
          recipient: superAdmin._id, // Super Admin ID
          message: `User ${user.f_Name} ${user.l_Name} has requested to change their role to ${requested_Role}.`,
          activityType: "ROLE_CHANGE_REQUEST",
          relatedId: user._id,
        });
        await notificationToSuperAdmin.save();

        sendEmail(
          "roleChangeRequestToUser",
          {
            name: user.f_Name,
            email: user.email_id,
          },
          [requested_Role]
        );
        const notificationToUser = new NotificationModel({
          recipient: user._id,
          message: `Hello ${user.f_Name} ${user.l_Name}, your request to change your role to ${requested_Role} has been sent successfully.`,
          activityType: "ROLE_CHANGE_REQUEST_SENT",
          relatedId: superAdmin._id,
        });
        await notificationToUser.save();
        res
          .status(200)
          .json(
            new ApiResponse(200, "Role change request submitted successfully.")
          );
      }
    }

    if (requested_Role === "INSTITUTE") {
      try {
        if (!business_Name || !address_1) {
          res
            .status(400)
            .json(
              new ApiError(
                400,
                "Business name and address is required to register Institute"
              )
            );
        } else {
          const user = await Registration.findById(userId);

          if (user.requested_Role) {
            return res
              .status(400)
              .json(
                new ApiResponse(400, "Role change request is already pending.")
              );
          }

          await Registration.findByIdAndUpdate(userId, {
            requested_Role: requested_Role,
            business_Name,
          });

          const superAdmin = await Registration.findOne({
            role: "SUPER_ADMIN",
          });
          const Admin = await Registration.findOneAndUpdate(
            { role: "SUPER_ADMIN", "requests.userid": userId },
            {
              $set: {
                "requests.$.requestedRole": requested_Role,
                "requests.$.status": "pending",
              },
            },
            { new: true }
          );

          if (!Admin) {
            await Registration.findOneAndUpdate(
              { role: "SUPER_ADMIN" },
              {
                $push: {
                  requests: {
                    userid: userId,
                    requestedRole: requested_Role,
                  },
                },
              },
              { new: true }
            );
          }

          if (
            requested_Role === "INSTITUTE" ||
            requested_Role === "SELF_EXPERT"
          ) {
            if (!superAdmin) {
              return res
                .status(500)
                .json(
                  new ApiError(
                    500,
                    "No SUPER_ADMIN found to approve the request."
                  )
                );
            }
            const userEmail = req.user.username;
            const userName = user.f_Name;

            const newInstitute = new InstituteModel({
              institute_name: business_Name,
              address_1: address_1,
              email: userEmail,
              Phone_No: "",
              createdBy: req.user.id,
              admins: req.user.id,
            });

            await newInstitute.save();

            sendEmail(
              "roleChangeRequestToSuperAdmin",
              {
                name: superAdmin.f_Name,
                email: superAdmin.email_id,
              },
              [requested_Role, userId, userEmail, userName]
            );
          }

          const notificationToSuperAdmin = new NotificationModel({
            recipient: superAdmin._id, // Super Admin ID
            message: `User ${user.f_Name} ${user.l_Name} has requested to change their role to ${requested_Role}.`,
            activityType: "ROLE_CHANGE_REQUEST",
            relatedId: user._id,
          });
          await notificationToSuperAdmin.save();

          sendEmail(
            "roleChangeRequestToUser",
            {
              name: user.f_Name,
              email: user.email_id,
            },
            [requested_Role]
          );
          const notificationToUser = new NotificationModel({
            recipient: user._id,
            message: `Hello ${user.f_Name} ${user.l_Name}, your request to change your role to ${requested_Role} has been sent successfully.`,
            activityType: "ROLE_CHANGE_REQUEST_SENT",
            relatedId: superAdmin._id,
          });
          await notificationToUser.save();
          res
            .status(200)
            .json(
              new ApiResponse(
                200,
                "Role change request submitted successfully."
              )
            );
        }
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json(new ApiError(500, error.message || "Server Error", error));
      }
    }

    if (requested_Role == "TRAINER") {
      try {
        const { instituteId } = req.body;
        const userId = req.user.id;
        const user = await Registration.findById(userId);
        const userName = `${user.f_Name} ${user.l_Name}`;
        const userEmail = user.email_id;

        const institute = await InstituteModel.findById(instituteId);
        if (!institute) {
          return res.status(404).json(new ApiError(404, "Institute not found"));
        }

        if (!user) {
          return res.status(404).json(new ApiError(404, "User not found"));
        }

        if (user.requested_Role === "TRAINER") {
          return res
            .status(400)
            .json(new ApiError(400, "Request already pending"));
        }

        user.requested_Role = "TRAINER";
        user.business_Name = institute.institute_name;
        await user.save();

        const admins = await Registration.find({
          _id: { $in: institute.admins },
        });

        if (admins.length === 0) {
          return res
            .status(404)
            .json(new ApiError(404, "No admins found for the institute"));
        }

        // Send approval requests to all admins via email
        admins.forEach(async (admin) => {
          const adminEmail = admin.email_id;
          const Admin = await Registration.findOneAndUpdate(
            { _id: admin._id, "requests.userid": userId },
            {
              $set: {
                "requests.$.requestedRole": requested_Role,
                "requests.$.status": "pending",
              },
            },
            { new: true }
          );
          if (!Admin) {
            await Registration.findOneAndUpdate(
              { _id: admin._id },
              {
                $push: {
                  requests: {
                    userid: userId,
                    requestedRole: requested_Role,
                  },
                },
              },
              { new: true }
            );
          }
          sendEmail(
            "trainerRequest",
            {
              name: "Admin",
              email: adminEmail,
            },
            [userName, institute.institute_name]
          );
        });

        res.status(200).json({
          message: "Request sent to institute admins for approval",
          requested_Role: user.requested_Role,
        });
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json(
            new ApiError(500, error.message || "Error sending request", error)
          );
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server Error", error));
  }
});

// Helper function to send emails and notifications
// async function sendRoleChangeEmailsAndNotifications({
//   user,
//   superAdmin,
//   requested_Role,
//   userId,
//   business_Name,
// }) {
//   const userEmail = user.username;
//   const userName = user.f_Name;

//   // Send email to Super Admin
//   sendEmail(
//     "roleChangeRequestToSuperAdmin",
//     {
//       name: superAdmin.f_Name,
//       email: superAdmin.email_id,
//     },
//     [requested_Role, userId, userEmail, userName, business_Name || "N/A"]
//   );

//   // Notification to Super Admin
//   const notificationToSuperAdmin = new NotificationModel({
//     recipient: superAdmin._id,
//     message: `User ${user.f_Name} ${user.l_Name} has requested to change their role to ${requested_Role}.`,
//     activityType: "ROLE_CHANGE_REQUEST",
//     relatedId: user._id,
//   });
//   await notificationToSuperAdmin.save();

//   // Send confirmation email to the user
//   sendEmail(
//     "roleChangeRequestToUser",
//     {
//       name: user.f_Name,
//       email: user.email_id,
//     },
//     [requested_Role]
//   );

//   // Notification to the user
//   const notificationToUser = new NotificationModel({
//     recipient: user._id,
//     message: `Hello ${user.f_Name} ${user.l_Name}, your request to change your role to ${requested_Role} has been sent successfully.`,
//     activityType: "ROLE_CHANGE_REQUEST_SENT",
//     relatedId: superAdmin._id,
//   });
//   await notificationToUser.save();
// }

const approveRoleChange = asyncHandler(async (req, res) => {
  try {
    const { userid, approved } = req.body;
    const adminRole = req.user.role;
    const adminId = req.user.id;

    if (adminRole !== "SUPER_ADMIN" && adminRole !== "INSTITUTE") {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            "You are NOT authorized to approve or deny requests."
          )
        );
    }

    const user = await Registration.findById(userid);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found."));
    }

    if (!user.requested_Role) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, "No pending role change request for this user.")
        );
    }

    if (approved) {
      await Registration.findByIdAndUpdate(userid, {
        role: user.requested_Role,
        requested_Role: "",
      });

      await Registration.updateOne(
        { _id: adminId, "requests.userid": userid },
        { $set: { "requests.$.status": "approved" } }
      );

      if (user.requested_Role === "TRAINER") {
        const institute = await InstituteModel.findOneAndUpdate(
          {
            admins: { $in: [adminId] },
          },
          { $push: { trainers: userid } }
        );
      }

      const approvedRole = user.requested_Role;
      sendEmail(
        "roleChangeApproved",
        { name: user.f_Name, email: user.email_id },
        [(userName = user.f_Name), approvedRole]
      );

      const notificationForApproval = new NotificationModel({
        recipient: user._id,
        message: `Congratulations ${user.f_Name} ${user.l_Name}, your request to change your role ${user.role} to ${user.requestedRole} has been approved.`,
        activityType: "ROLE_CHANGE_APPROVED",
        relatedId: adminId,
      });
      await notificationForApproval.save();

      return res
        .status(200)
        .json(new ApiResponse(200, "Role change approved successfully."));
    } else {
      await Registration.findByIdAndUpdate(userid, {
        requested_Role: "",
        business_Name: "",
      });

      await Registration.updateOne(
        { _id: adminId, "requests.userid": userid },
        { $set: { "requests.$.status": "denied" } }
      );

      const requestedRole = user.requested_Role;
      sendEmail(
        "roleChangeDenied",
        { name: user.f_Name, email: user.email_id },
        [requestedRole]
      );

      const notificationForRejection = new NotificationModel({
        recipient: user._id,
        message: `Hello ${user.f_Name} ${user.l_Name}, unfortunately, your request to change your role to ${user.requestedRole} has been rejected.`,
        activityType: "ROLE_CHANGE_REJECTED",
        relatedId: adminId,
      });
      await notificationForRejection.save();

      return res
        .status(200)
        .json(new ApiResponse(200, "Role change request denied."));
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(
        new ApiError(
          500,
          err.message || "Error processing role change approval request.",
          err
        )
      );
  }
});

const getRequestsByStatus = async (adminId, status, page = 1, limit = 10) => {
  try {
    // Fetch the admin's requests and populate user details
    const admin = await Registration.findById(adminId, "requests").populate({
      path: "requests.userid",
      select: "f_Name l_Name",
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    // Filter the requests based on the given status
    const filteredRequests = admin.requests.filter(
      (request) => request.status === status
    );

    // Calculate pagination
    const totalRequests = filteredRequests.length;
    const totalPages = Math.ceil(totalRequests / limit);
    const startIndex = (page - 1) * limit;
    const paginatedRequests = filteredRequests.slice(
      startIndex,
      startIndex + limit
    );

    // Map the paginated requests to the required format
    const requests = paginatedRequests.map((item) => ({
      _id: item._id || "",
      userid: item?.userid?._id || "",
      user_name:
        `${item?.userid?.f_Name || ""} ${item?.userid?.l_Name || ""}` || "",
      requestedRole: item.requestedRole || "",
      status: item.status || "",
      requestDate: formatDate(item.requestDate) || "",
      requestTime:
        item?.requestDate?.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        }) || "",
    }));

    // Return paginated requests along with pagination info
    return {
      requests,
      pagination: {
        currentPage: page,
        totalPages,
        totalRequests,
        limit,
      },
    };
  } catch (error) {
    throw error;
  }
};

const getPendingRequestByAdminId = async (req, res) => {
  const adminId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { requests, pagination } = await getRequestsByStatus(
      adminId,
      "pending",
      page,
      limit
    );

    if (requests.lenght === 0)
      return res.status(200).json(new ApiResponse(200, "No Approved Requests"));

    res
      .status(200)
      .json(new ApiResponse(200, "Pending Requests", requests, pagination));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(new ApiError(500, err.message || "An error occurred", err));
  }
};

const getApprovedRequestByAdminId = async (req, res) => {
  const adminId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { requests, pagination } = await getRequestsByStatus(
      adminId,
      "approved",
      page,
      limit
    );

    if (requests.lenght === 0)
      return res.status(200).json(new ApiResponse(200, "No Approved Requests"));
    res
      .status(200)
      .json(new ApiResponse(200, "Approved Requests", requests, pagination));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(new ApiError(500, err.message || "An error occurred", err));
  }
};

const getRejectedRequestByAdminId = async (req, res) => {
  const adminId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { requests, pagination } = await getRequestsByStatus(
      adminId,
      "denied",
      page,
      limit
    );

    if (requests.length === 0)
      return res.status(200).json(new ApiResponse(200, "No Rejected Requests"));
    res
      .status(200)
      .json(new ApiResponse(200, "Rejected Requests", requests, pagination));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(new ApiError(500, err.message || "An error occurred", err));
  }
};

const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const totalCourses = await Course.countDocuments({ trainer_id: userId });

    const totalEnrollments = await Enrollment.countDocuments({
      userid: userId,
    });

    const upcomingCourses = await Course.countDocuments({
      trainer_id: userId,
      start_date: { $gt: new Date() }, // filter for future start dates
    });

    const totalProducts = await Product.countDocuments({ created_by: userId });

    const totalSoldProducts = await Product.countDocuments({
      created_by: userId,
      sold: true,
    });

    const availableProducts = await Product.countDocuments({
      created_by: userId,
      sold: false,
    });

    const totalEvents = await Event.countDocuments({ created_by: userId });

    const totalBookedSeats = await Booking.countDocuments({
      userid: userId,
    });

    const upcomingEvents = await Event.countDocuments({
      created_by: userId,
      start_date: { $gt: new Date() },
    });

    // Return the dashboard data
    res.status(200).json({
      totalCourses,
      totalEnrollments,
      upcomingCourses,
      totalProducts,
      totalSoldProducts,
      availableProducts,
      totalEvents,
      totalBookedSeats,
      upcomingEvents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching user dashboard data",
      error: error.message || "Server Error",
    });
  }
});

const addSkills = asyncHandler(async (req, res) => {
  try {
    const userid = req.user.id;
    const { skills } = req.body;

    console.log(skills);
    if (!skills) {
      res.status(400).json(new ApiError(400, "Skills are required"));
    } else {
      const updateSkills = await registration.findByIdAndUpdate(userid, {
        skills: skills,
        new: true,
      });
      res.status(200).json(new ApiResponse(200, "Skill Added", updateSkills));
    }
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "server error", error));
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const userid = req.params.userid;

  Registration.findById(userid)
    .select("-password -role -requested_Role -requests")
    .then((trainer) => {
      const result = {
        _id: trainer?._id,
        f_Name: trainer?.f_Name,
        l_Name: trainer?.l_Name,
        mobile_number: trainer?.mobile_number,
        whatsapp_no: trainer?.whatsapp_no,
        email_id: trainer?.email_id,
        date_of_birth: trainer?.date_of_birth
          ? formatDate(trainer?.date_of_birth)
          : "",
        rating_count: trainer?.rating_count,
        address1: trainer?.address1,
        address2: trainer?.address2,
        city: trainer?.city,
        country: trainer?.country,
        state: trainer?.state,
        pincode: trainer?.pincode,
        trainer_image: trainer?.trainer_image || "",
      };
      res.status(200).json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

module.exports = {
  userRegistration,
  loginController,
  forgetPassward,
  resetPassword,
  requestRoleChange,
  // requestToBecomeTrainer,
  approveRoleChange,
  getPendingRequestByAdminId,
  getApprovedRequestByAdminId,
  getRejectedRequestByAdminId,
  getUserDashboard,
  addSkills,
  getUserById,
};
