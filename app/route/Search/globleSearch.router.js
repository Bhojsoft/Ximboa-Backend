const {
  unifiedSearch,
} = require("../../../controllers/Search/courseSearch.controller");
const {
  globalSearch,
  searchCourseByName,
  searchProductByName,
  searchEventByName,
  searchTrainerByName,
  getBreadcrumb,
} = require("../../../controllers/Search/search.controller");
const express = require("express");
const router = express.Router();

router.get("/global", globalSearch);
router.get("/courses", searchCourseByName);
router.get("/products", searchProductByName);
router.get("/events", searchEventByName);
router.get("/trainer", searchTrainerByName);
router.get("/search/course", unifiedSearch);
router.get("/getbreadcrumb", getBreadcrumb);

module.exports = router;
