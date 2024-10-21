const express = require("express");
const {
  getCoursesByFilter,
} = require("../../../controllers/Course/course.controller");
const router = express.Router();

router.get("/courses", getCoursesByFilter);

module.exports = router;
