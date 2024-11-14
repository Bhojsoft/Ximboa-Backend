// // Import the necessary modules from AWS SDK v3
// const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
// const multer = require("multer");
// const multerS3 = require("multer-s3");

// // Create a new S3 client instance using the AWS SDK v3
// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// // Multer-S3 configuration
// const uploadCourseThumbnail = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.S3_BUCKET_NAME,
//     acl: "public-read",
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: function (req, file, cb) {
//       const fileName = `${Date.now().toString()}-${file.originalname}`;
//       cb(null, `courses/thumbnails/${fileName}`);
//     },
//   }),
// });

// const uploadProductImage = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.S3_BUCKET_NAME,
//     acl: "public-read",
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: function (req, file, cb) {
//       const fileName = `${Date.now().toString()}-${file.originalname}`;
//       cb(null, `products/product_images/${fileName}`);
//     },
//   }),
// });

// module.exports = { uploadCourseThumbnail, uploadProductImage };

// Import the necessary modules from AWS SDK v3
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

// Create a new S3 client instance using the AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer-S3 configuration for course thumbnail upload
const uploadCourseThumbnail = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      cb(null, `courses/thumbnails/${fileName}`); // Path for course thumbnails
    },
  }),
});

// Multer-S3 configuration for product image upload
const uploadProductImage = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      cb(null, `products/product_images/${fileName}`); // Path for product images
    },
  }),
});

// Multer-S3 configuration for event image upload
const uploadEventImage = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      cb(null, `events/event_images/${fileName}`); // Path for event images
    },
  }),
});

const uploadProfileImage = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      cb(null, `users/profile_images/${fileName}`); // Path for event images
    },
  }),
});

const uploadCategoryImage = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      cb(null, `categories/category_images/${fileName}`); // Path for event images
    },
  }),
});

module.exports = {
  uploadCourseThumbnail, // For course thumbnail uploads
  uploadProductImage, // For product image uploads
  uploadEventImage, // For event image uploads
  uploadProfileImage,
  uploadCategoryImage,
};
