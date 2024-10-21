/**
 * @type {{ ADMIN: "ADMIN"; USER: "USER"} as const}
 */
const UserRolesEnum = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SELF_EXPERT: "SELF_EXPERT",
  INSTITUTE: "INSTITUTE",
  TRAINER: "TRAINER",
  USER: "USER",
};
const AvailableUserRoles = Object.values(UserRolesEnum);

/**
 * @Email_Templates { registrationSuccess }
 */

const banner = "https://ximboatest.s3.amazonaws.com/Innner+banner.jpg";
const emailTemplates = {
  instituteRequest: {
    subject: "New Institute Approval Request",
    html: (instituteName, createdBy, instituteId, logoUrl) => `
      <h3>New Institute Approval Request</h3>
        <p>A new institute has been created and is awaiting your approval:</p>
        <ul>
          <li><strong>Institute Name:</strong> ${instituteName}</li>
          <li><strong>Created By Admin ID:</strong> ${createdBy}</li>
          <li><strong>Institute ID:</strong> ${instituteId}</li>
        </ul>
        <p>Please review and approve the institute.</p>`,
  },
  registrationSuccess: {
    subject: "Welcome to Ximboa!",
    html: (name, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Ximboa Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${name},</h2>
        <p>Thank you for registering at <strong>Ximboa</strong>! We're excited to have you on board.</p>
        <p>If you have any questions, feel free to contact us at support@Ximboa.com.</p>
        <p>Best regards,<br>Ximboa Team</p>
      </div>`,
  },
  loginSuccess: {
    subject: "Login Successful",
    html: (name, logoUrl) => `
    <html>
  <head>
    <style>
      /* Responsive Styles for Mobile Devices */
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
          padding: 0 !important;
        }
        .content {
          padding: 15px !important;
        }
        .header, .footer {
          padding: 10px 15px !important;
          flex-direction: column !important;
          text-align: center !important;
        }
        .logo {
          width: 100px !important;
          height: 50px !important;
        }
        .congrats-text {
          font-size: 24px !important;
          text-align: center !important;
        }
        .info-table {
          width: 100% !important;
        }
        .btn-primary {
          width: 100% !important;
          padding: 15px !important;
        }
        .social-icons {
          justify-content: center !important;
          margin-top: 10px;
        }
      }
    </style>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
    <div class="container" style="max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(17, 12, 46, 0.1); border-radius: 10px;">
      <!-- Header Section -->
      <div class="header" style="display: flex; justify-content: space-between; align-items: center; background-color: #E9EEF8; padding: 20px; border-radius: 10px 10px 0 0;">
        <img src="${logoUrl}" alt="Ximboa Logo" style="width: 150px; height: auto; margin-right: 30px;" class="logo">
        <div class="header-text" style="text-align: center;">
          <p style="font-size: 20px;">Subject: Course Inquiry</p>
          <p><a href="mailto:test@test.com" style="color: #265BBD; text-decoration: none;">Received from: test@test.com</a></p>
        </div>
      </div>

      <!-- Banner Image -->
      <img src="${banner}" alt="Banner Image" style="width: 100%; height: auto;" class="banner">

      <!-- Content Section -->
      <div class="content" style="padding: 20px; margin: 20px;">
        <div class="congrats-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <p class="congrats-text" style="font-size: 35px; font-weight: bold; color: #307DFF;">Congratulations!</p>
        </div>
        <button class="btn-primary" style="background-color: #265BBD; color: white; padding: 10px 20px; border: none; border-radius: 10px; cursor: pointer; width: auto;">Sign Up for It’s Free</button>

        <div class="message-section" style="margin-top: 20px;">
          <p>Hi [Instructor/Institute Name],</p>
          <p>You have received a new inquiry regarding [Course Name].</p>
        </div>

        <!-- Table Section -->
        <div class="table-container" style="margin-top: 20px;">
          <table class="info-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">Name</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">Amit Bhoj</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">Email</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left;"><a href="mailto:test@test.com" style="color: #265BBD; text-decoration: none;">test@test.com</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">Subject</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">Course Inquiry</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">Message</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">When will the batch start?</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Dashboard Section -->
        <p style="margin-bottom: 20px;">To see your inquiries from one single place, visit your dashboard.</p>
        <button class="btn-primary" style="background-color: #265BBD; color: white; padding: 10px 20px; border: none; border-radius: 10px; cursor: pointer; width: auto;">Go to Dashboard</button>
      </div>

      <!-- Footer Section -->
      <div class="footer" style="background-color: #265BBD; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 0 0 10px 10px;">
        <a href="#" style="color: white; text-decoration: none;">www.ximboa.io</a>
        <div class="social-icons" style="display: flex; justify-content: flex-start;">
          <a href="#" style="margin-right: 10px; color: white; text-decoration: none; border: 1px solid white; padding: 5px; border-radius: 50%;"><i class="fab fa-facebook-f"></i></a>
          <a href="#" style="margin-right: 10px; color: white; text-decoration: none; border: 1px solid white; padding: 5px; border-radius: 50%;"><i class="fab fa-twitter"></i></a>
          <a href="#" style="margin-right: 10px; color: white; text-decoration: none; border: 1px solid white; padding: 5px; border-radius: 50%;"><i class="fab fa-instagram"></i></a>
          <a href="#" style="margin-right: 10px; color: white; text-decoration: none; border: 1px solid white; padding: 5px; border-radius: 50%;"><i class="fab fa-linkedin-in"></i></a>
          <a href="#" style="margin-right: 10px; color: white; text-decoration: none; border: 1px solid white; padding: 5px; border-radius: 50%;"><i class="fab fa-youtube"></i></a>
        </div>
        <a href="mailto:contact@ximboa.io" style="color: white; text-decoration: none;">contact@ximboa.io</a>
      </div>
    </div>
  </body>
</html>
    `,
  },
  resetPassword: {
    subject: "Password Reset Request",
    html: (name, resetLink, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Ximboa Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${name},</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="color: #1a73e8;">Reset Password</a>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>Best regards,<br>Ximboa Team</p>
      </div>`,
  },

  forgotPassword: {
    subject: "Password Reset Request",
    html: (name, resetLink, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Ximboa Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${name},</h2>
        <p>We received a request to reset your password for your <strong>Ximboa</strong> account.</p>
        <p>Please click the link below to reset your password:</p>
        <p><a href="${resetLink}" style="color: #1a73e8;">Reset Password</a></p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have any questions.</p>
        <p>Best regards,<br>Ximboa Team</p>
      </div>`,
  },

  trainerRequest: {
    subject: "Trainer Request Pending Approval",
    html: (adminName, userName, instituteName, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Institute Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${adminName},</h2>
        <p>A new request has been submitted by <strong>${userName}</strong> to become a trainer under your institute <strong>${instituteName}</strong>.</p>
        <p>Please log in to your admin panel to review and approve this request.</p>
        <p>If you have any questions, feel free to contact us.</p>
        <p>Best regards,<br>Ximboa Team</p>
      </div>`,
  },

  enrollment: {
    subject: "Course Enrollment Successful",
    html: (name, courseName, logoUrl) => `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="text-align: center;">
            <img src="${logoUrl}" alt="Ximboa Logo" style="width: 150px; margin-bottom: 20px;">
          </div>
          <h2>Hello ${name},</h2>
          <p>You have successfully enrolled in the course: <strong>${courseName}</strong>.</p>
          <p>Best regards,<br>Ximboa Team</p>
        </div>`,
  },

  enrollmentNotificationToTrainer: {
    subject: "New Student Enrollment in Your Course!",
    html: (trainerName, studentName, courseName, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Course Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${trainerName},</h2>
        <p>We're excited to inform you that <strong>${studentName}</strong> has just enrolled in your course <strong>${courseName}</strong>!</p>
        <p>This is a great opportunity to share your expertise and help ${studentName} achieve their goals.</p>
        <p>You can view more details about the enrollment and manage your courses through your trainer dashboard.</p>
        <p>Thank you for being an important part of our team, and we look forward to seeing your students thrive under your guidance.</p>
        <p>Best regards,<br>Ximboa Team</p>
      </div>
    `,
  },

  roleChangeRequestToUser: {
    subject: "Your Role Change Request is Pending Approval",
    html: (userName, requested_Role, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Course Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${userName},</h2>
        <p>Your request to change your role to <strong>${requested_Role}</strong> has been successfully submitted. It is currently awaiting approval by the admin.</p>
        <p>We will notify you once your request has been reviewed.</p>
        <p>Thank you,<br>The Team</p>
      </div>
    `,
  },

  roleChangeRequestToSuperAdmin: {
    subject: "Role Change Request",
    html: (requested_Role, userId, userEmail, userName, logoUrl) => `
      <div>
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Course Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h3>New Role Change Request</h3>
        <p>User <strong>${userName}</strong> (${userEmail}) has requested to change their role to <strong>${requested_Role}</strong>.</p>
        <p>User ID: ${userId}</p>
        <p>Please log in to your admin dashboard to approve or deny this request.</p>
      </div>
    `,
  },

  roleChangeApproved: {
    subject: "Your Role Change Request Has Been Approved",
    html: (userName, approvedRole, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${userName},</h2>
        <p>We are pleased to inform you that your request to change your role to <strong>${approvedRole}</strong> has been approved.</p>
        <p>Welcome to your new role!</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
  },

  roleChangeDenied: {
    subject: "Your Role Change Request Has Been Denied",
    html: (userName, requestedRole, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${userName},</h2>
        <p>Unfortunately, your request to change your role to <strong>${requestedRole}</strong> has been denied.</p>
        <p>If you have any questions, feel free to contact us.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
  },
};

module.exports = { UserRolesEnum, AvailableUserRoles, emailTemplates };
