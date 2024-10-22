### 💻 Running locally

To run the FreeAPI project locally, follow these steps:

1. Install [NodeJs](https://www.nodejs.org/), [MongoDB](https://www.mongodb.com) and [MongoDB Compass (optional)](https://www.mongodb.com/products/compass) on your machine.
2. Clone the project repository.
3. Navigate to the project directory.

```bash
   cd Ximboa-Backend
```

5. Install the packages:

```bash
npm install
```

6. Run the project:

```bash
npm run start
```



#just hold

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