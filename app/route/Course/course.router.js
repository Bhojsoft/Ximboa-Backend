const express = require("express");
const { getCoursesByCategory } = require("../../../controllers/Course/course.controller");
const router = express.Router();

router.get("/courses", getCoursesByCategory);

module.exports = router;
