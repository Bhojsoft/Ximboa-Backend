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
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      box-sizing: border-box;
    "
  >
    <div
      class="container"
      style="
        width: 100%;
        margin: 0 auto;
        box-shadow: 0 10px 30px rgba(17, 12, 46, 0.1);
        border-radius: 10px;
        max-width: 600px;
        margin: 0 auto;
        box-sizing: border-box;
      "
    >
      <!-- Header Section -->
      <div
        class="header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #e9eef8;
          padding: 10px;
          border-radius: 10px 10px 0 0;
          flex-wrap: wrap;
        "
      >
      <div style="float:left; width:50%;text-align:start;"> 
      <img
          src=${logoUrl}
          alt="Ximboa Logo"
          class="logo"
          style="width: 100%; display: inline-block;"/>
        </div>
        <div class="header-text" style="float:right;width:50%;text-align:end;padding-top:13px">
          <p class="subject" style="font-size: 16px;margin:0px">Subject: Course Inquiry</p>
          <p class="email" style="color: #265bbd;margin:0px">
            Received from:
            <a
              href="mailto:test@test.com"
              style="color: #265bbd; text-decoration: none"
              >test@test.com</a>
          </p>
        </div>
      </div>

      <img
        src=${banner}
        alt="Banner Image"
        class="banner"
        style="width: 100%; height: auto; display: block"
      />

      <!-- Content Section -->
      <div style="text-align:end;margin-top:20px;">
      <button
            class="btn-primary"
            style="
              background-color: #265bbd;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              width: 100%;
              max-width: 200px;">
            Sign Up for It’s Free
          </button>
      </div>
        <div style="margin-top: 8px">
          <p
            style="
              font-size: 28px;
              margin-top: 0px;
              margin-left: 5px;
              font-weight: bold;
              color: #307dff;">
            Congratulations!
          </p>
        </div>

      <div class="content" style="padding: 0px 20px; margin: 0px 20px">
        <div
          class="message-section"
          style="margin-bottom: 20px; line-height: 1.5">
          <p>Hi Instructor/Institute ${name},</p>
          <p>You have received a new inquiry regarding [Course Name].</p>
        </div>

        <!-- Table Section -->
        <div class="table-container" style="margin-bottom: 20px">
          <table
            class="info-table"
            style="
              width: 100%;
              border-collapse: collapse;
              max-width: 100%;
              margin: 0 auto;
            "
          >
            <tbody>
              <tr>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Name
                </td>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Amit Bhoj
                </td>
              </tr>
              <tr>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Email
                </td>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  <a href="" style="color: #265bbd">test@test.com</a>
                </td>
              </tr>
              <tr>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Subject
                </td>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Course Inquiry
                </td>
              </tr>
              <tr>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Message
                </td>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  When will the batch start?
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Dashboard Section -->
        <p style="font-size: 14px; line-height: 1.5">
          To see your inquiries from one single place, visit your dashboard.
        </p>
        <button
          class="btn-primary dashboard-btn"
          style="
            background-color: #265bbd;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            margin: 30px 0;
            width: 100%;
            max-width: 250px;
          "
        >
          Go to Dashboard
        </button>
      </div>

      <!-- Footer Section -->
      <div
        class="footer"
        style="
          background-color: #265bbd;
          color: white;
          padding: 10px 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 0 0 10px 10px;
          gap: 10px;
          flex-wrap: wrap;
        "
      >
        <a
          href="#"
          class="footer-link"
          style="
            color: white;
            text-decoration: none;
            width: 100%;
            max-width: 150px;
            text-align: center;
          "
          >www.ximboa.io</a
        >
        <div
          class="social-icons"
          style="
            display: flex;
            justify-content: center;
            font-size: 12px;
            flex-direction: row;
            width: 100%;
            max-width: 250px;
            margin-top: 10px;
            gap: 10px;
          "
        >
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-facebook-f"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-twitter"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-instagram"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-linkedin-in"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-youtube"></i
          ></a>
        </div>
        <a
          href="mailto:contact@ximboa.io"
          class="footer-link"
          style="
            color: white;
            text-decoration: none;
            width: 100%;
            max-width: 200px;
            text-align: center;
          "
          >contact@ximboa.io</a
        >
      </div>
    </div>
  </body>
</html>

    `,
  },
  newEnquiry: {
    subject: "Course Inquiry",
    html: (
      name,
      logoUrl,
      trainerName,
      studentName,
      studentEmail,
      description
    ) => `
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      box-sizing: border-box;
    "
  >
    <div
      class="container"
      style="
        width: 100%;
        margin: 0 auto;
        box-shadow: 0 10px 30px rgba(17, 12, 46, 0.1);
        border-radius: 10px;
        max-width: 600px;
        margin: 0 auto;
        box-sizing: border-box;
      "
    >
      <!-- Header Section -->
      <div
        class="header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #e9eef8;
          padding: 10px;
          border-radius: 10px 10px 0 0;
          flex-wrap: wrap;
        "
      >
      <div style="float:left; width:50%;text-align:start;"> 
      <img
          src=${logoUrl}
          alt="Ximboa Logo"
          class="logo"
          style="width: 100%; display: inline-block;"/>
        </div>
        <div class="header-text" style="float:right;width:50%;text-align:end;padding-top:13px">
          <p class="subject" style="font-size: 16px;margin:0px">Subject: Course Inquiry</p>
          <p class="email" style="color: #265bbd;margin:0px">
            Received from:
            <a
              href="mailto:test@test.com"
              style="color: #265bbd; text-decoration: none"
              >test@test.com</a>
          </p>
        </div>
      </div>

      <img
        src=${banner}
        alt="Banner Image"
        class="banner"
        style="width: 100%; height: auto; display: block"
      />

      <!-- Content Section -->
      <div style="text-align:end;margin-top:20px;">
      <button
            class="btn-primary"
            style="
              background-color: #265bbd;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              width: 100%;
              max-width: 200px;">
            Sign Up for It's Free
          </button>
      </div>
        <div style="margin-top: 8px">
          <p
            style="
              font-size: 28px;
              margin-top: 0px;
              margin-left: 5px;
              font-weight: bold;
              color: #307dff;">
            Congratulations!
          </p>
        </div>

      <div class="content" style="padding: 0px 20px; margin: 0px 20px">
        <div
          class="message-section"
          style="margin-bottom: 20px; line-height: 1.5">
          <p>Hi ${trainerName},</p>
          <p>You have received a new inquiry.</p>
        </div>

        <!-- Table Section -->
        <div class="table-container" style="margin-bottom: 20px">
          <table
            class="info-table"
            style="
              width: 100%;
              border-collapse: collapse;
              max-width: 100%;
              margin: 0 auto;
            "
          >
            <tbody>
              <tr>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Name
                </td>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  ${studentName}
                </td>
              </tr>
              <tr>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Email
                </td>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  <a href="" type="email" style="color: #265bbd">${studentEmail}</a>
                </td>
              </tr>
              <tr>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Subject
                </td>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Course Inquiry
                </td>
              </tr>
              <tr>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Message
                </td>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  ${description}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Dashboard Section -->
        <p style="font-size: 14px; line-height: 1.5">
          To see your inquiries from one single place, visit your dashboard.
        </p>
        <a style="
            color: white;">
          <button
            class="btn-primary dashboard-btn"
            style="
              background-color: #265bbd;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              margin: 30px 0;
              width: 100%;
              max-width: 250px;
            "
              >
              Go to Dashboard
            </button>
          </a>
      </div>

      <!-- Footer Section -->
      <div
        class="footer"
        style="
          background-color: #265bbd;
          color: white;
          padding: 10px 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 0 0 10px 10px;
          gap: 10px;
          flex-wrap: wrap;
        "
      >
        <a
          href="#"
          class="footer-link"
          style="
            color: white;
            text-decoration: none;
            width: 100%;
            max-width: 150px;
            text-align: center;
          "
          >www.ximboa.io</a
        >
        <div
          class="social-icons"
          style="
            display: flex;
            justify-content: center;
            font-size: 12px;
            flex-direction: row;
            width: 100%;
            max-width: 250px;
            margin-top: 10px;
            gap: 10px;
          "
        >
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-facebook-f"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-twitter"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-instagram"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-linkedin-in"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-youtube"></i
          ></a>
        </div>
        <a
          href="mailto:contact@ximboa.io"
          class="footer-link"
          style="
            color: white;
            text-decoration: none;
            width: 100%;
            max-width: 200px;
            text-align: center;
          "
          >contact@ximboa.io</a
        >
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
    html: (name, logoUrl, courseName) => `
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      box-sizing: border-box;
    "
  >
    <div
      class="container"
      style="
        width: 100%;
        margin: 0 auto;
        box-shadow: 0 10px 30px rgba(17, 12, 46, 0.1);
        border-radius: 10px;
        max-width: 600px;
        margin: 0 auto;
        box-sizing: border-box;
      "
    >
      <!-- Header Section -->
      <div
        class="header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #e9eef8;
          padding: 10px;
          border-radius: 10px 10px 0 0;
          flex-wrap: wrap;
        "
      >
      <div style="float:left; width:50%;text-align:start;"> 
      <img
          src=${logoUrl}
          alt="Ximboa Logo"
          class="logo"
          style="width: 100%; display: inline-block;"/>
        </div>
        <div class="header-text" style="float:right;width:50%;text-align:end;padding-top:13px">
          <p class="subject" style="font-size: 16px;margin:0px">Subject: Course Enroll</p>
          <p class="email" style="color: #265bbd;margin:0px">
            Received from:
            <a
              href="mailto:test@test.com"
              style="color: #265bbd; text-decoration: none"
              >test@test.com</a>
          </p>
        </div>
      </div>

      <img
        src=${banner}
        alt="Banner Image"
        class="banner"
        style="width: 100%; height: auto; display: block"
      />

      <!-- Content Section -->
      <div style="text-align:end;margin-top:20px;">
      <button
            class="btn-primary"
            style="
              background-color: #265bbd;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              width: 100%;
              max-width: 200px;">
            Sign Up for It's Free
          </button>
      </div>
        <div style="margin-top: 8px">
          <p
            style="
              font-size: 28px;
              margin-top: 0px;
              margin-left: 5px;
              font-weight: bold;
              color: #307dff;">
            Congratulations!
          </p>
        </div>

      <div class="content" style="padding: 0px 20px; margin: 0px 20px">
        <div
          class="message-section"
          style="margin-bottom: 20px; line-height: 1.5">
          <p>Dear ${name},</p>
          <p>Congratulations!!! you have been successfully enrolled to course <b> ${courseName}.</b><br>
          To manage all your courses from one single place visit your student dashboard.<br>
          To see your enrollment from one single place visit your dashboard.</p>        
          </div>
        <!-- Dashboard Section -->
          <button
            class="btn-primary dashboard-btn"
            style="
              background-color: #265bbd;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              margin: 30px 0;
              width: 100%;
              max-width: 250px;
            "
              >
              <a style="
            color: white;">
              Go to Dashboard
              </a>
            </button>
      </div>

      <!-- Footer Section -->
      <div
        class="footer"
        style="
          background-color: #265bbd;
          color: white;
          padding: 10px 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 0 0 10px 10px;
          gap: 10px;
          flex-wrap: wrap;
        "
      >
        <a
          href="#"
          class="footer-link"
          style="
            color: white;
            text-decoration: none;
            width: 100%;
            max-width: 150px;
            text-align: center;
          "
          >www.ximboa.io</a
        >
        <div
          class="social-icons"
          style="
            display: flex;
            justify-content: center;
            font-size: 12px;
            flex-direction: row;
            width: 100%;
            max-width: 250px;
            margin-top: 10px;
            gap: 10px;
          "
        >
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-facebook-f"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-twitter"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-instagram"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-linkedin-in"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-youtube"></i
          ></a>
        </div>
        <a
          href="mailto:contact@ximboa.io"
          class="footer-link"
          style="
            color: white;
            text-decoration: none;
            width: 100%;
            max-width: 200px;
            text-align: center;
          "
          >contact@ximboa.io</a
        >
      </div>
    </div>
  </body>
</html>

    `,
  },

  enrollmentNotificationToTrainer: {
    subject: "New Student Enrollment in Your Course!",
    html: (
      name,
      logoUrl,
      trainerName,
      studentName,
      courseName,
      studentEmail,
      studentContactNo
    ) => `
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      box-sizing: border-box;
    "
  >
    <div
      class="container"
      style="
        width: 100%;
        margin: 0 auto;
        box-shadow: 0 10px 30px rgba(17, 12, 46, 0.1);
        border-radius: 10px;
        max-width: 600px;
        margin: 0 auto;
        box-sizing: border-box;
      "
    >
      <!-- Header Section -->
      <div
        class="header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #e9eef8;
          padding: 10px;
          border-radius: 10px 10px 0 0;
          flex-wrap: wrap;
        "
      >
      <div style="float:left; width:50%;text-align:start;"> 
      <img
          src=${logoUrl}
          alt="Ximboa Logo"
          class="logo"
          style="width: 100%; display: inline-block;"/>
        </div>
        <div class="header-text" style="float:right;width:50%;text-align:end;padding-top:13px">
          <p class="subject" style="font-size: 16px;margin:0px">Subject: New Student Enrollment in Your Course!</p>
          <p class="email" style="color: #265bbd;margin:0px">
            Received from:
            <a
              href="mailto:test@test.com"
              style="color: #265bbd; text-decoration: none"
              >test@test.com</a>
          </p>
        </div>
      </div>

      <img
        src=${banner}
        alt="Banner Image"
        class="banner"
        style="width: 100%; height: auto; display: block"
      />

      <!-- Content Section -->
      <div style="text-align:end;margin-top:20px;">
      <button
            class="btn-primary"
            style="
              background-color: #265bbd;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              width: 100%;
              max-width: 200px;">
            Sign Up for It's Free
          </button>
      </div>
        <div style="margin-top: 8px">
          <p
            style="
              font-size: 28px;
              margin-top: 0px;
              margin-left: 5px;
              font-weight: bold;
              color: #307dff;">
            Congratulations!
          </p>
        </div>

      <div class="content" style="padding: 0px 20px; margin: 0px 20px">
        <div
          class="message-section"
          style="margin-bottom: 20px; line-height: 1.5">
          <p>Hi ${trainerName},</p>
          <p>You have received a new inquiry regarding <b>${courseName}.</b></p>
        </div>

        <!-- Table Section -->
        <div class="table-container" style="margin-bottom: 20px">
          <table
            class="info-table"
            style="
              width: 100%;
              border-collapse: collapse;
              max-width: 100%;
              margin: 0 auto;
            "
          >
            <tbody>
              <tr>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Name
                </td>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  ${studentName}
                </td>
              </tr>
              <tr>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Email
                </td>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  <a href="" type="email" style="color: #265bbd">${studentEmail}</a>
                </td>
              </tr>
              <tr>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Subject
                </td>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Course Inquiry
                </td>
              </tr>
              <tr>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  Mobile Number
                </td>
                <td
                  style="
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                    font-size: 14px;
                  "
                >
                  ${studentContactNo || ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Dashboard Section -->
        <p style="font-size: 14px; line-height: 1.5">
          To see your inquiries from one single place, visit your dashboard.
        </p>
        <a style="
            color: white;">
          <button
            class="btn-primary dashboard-btn"
            style="
              background-color: #265bbd;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              margin: 30px 0;
              width: 100%;
              max-width: 250px;
            "
              >
              Go to Dashboard
            </button>
          </a>
      </div>

      <!-- Footer Section -->
      <div
        class="footer"
        style="
          background-color: #265bbd;
          color: white;
          padding: 10px 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 0 0 10px 10px;
          gap: 10px;
          flex-wrap: wrap;
        "
      >
        <a
          href="#"
          class="footer-link"
          style="
            color: white;
            text-decoration: none;
            width: 100%;
            max-width: 150px;
            text-align: center;
          "
          >www.ximboa.io</a
        >
        <div
          class="social-icons"
          style="
            display: flex;
            justify-content: center;
            font-size: 12px;
            flex-direction: row;
            width: 100%;
            max-width: 250px;
            margin-top: 10px;
            gap: 10px;
          "
        >
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-facebook-f"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-twitter"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-instagram"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-linkedin-in"></i
          ></a>
          <a
            href="#"
            class="icon-border"
            style="
              border: 1px solid white;
              border-radius: 50%;
              color: white;
              text-align: center;
              padding: 5px;
            "
            ><i class="fab fa-youtube"></i
          ></a>
        </div>
        <a
          href="mailto:contact@ximboa.io"
          class="footer-link"
          style="
            color: white;
            text-decoration: none;
            width: 100%;
            max-width: 200px;
            text-align: center;
          "
          >contact@ximboa.io</a
        >
      </div>
    </div>
  </body>
</html>

    `,
  },

  roleChangeRequestToUser: {
    subject: "Your Role Change Request is Pending Approval",
    html: (userName, requested_Role, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Course Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hi ${userName},</h2>
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
