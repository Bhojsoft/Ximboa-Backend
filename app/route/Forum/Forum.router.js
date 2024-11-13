const express = require("express");
const router = express.Router();
const {
  addForum,
  getForumById,
  addReplyToPost,
  getForums,
  toggleLikeDislike,
  postAnswer,
} = require("../../../controllers/Forum/forum.controller");
const { jwtAuthMiddleware } = require("../../../middleware/auth");

router.post("/add", jwtAuthMiddleware, addForum);
router.post("/reply", jwtAuthMiddleware, addReplyToPost);
router.post("/likedislike/:forumid", jwtAuthMiddleware, toggleLikeDislike);
router.post("/postanswer", jwtAuthMiddleware, postAnswer);

router.get("/:id", getForumById);
router.get("/", getForums);

module.exports = router;
