const Forum = require("../../model/Forum/Forum.model"); // Assuming Forum model is located in models folder
const NotificationModel = require("../../model/Notifications/Notification.model");
const { formatDate } = require("../../services/servise");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");

// Controller to add a new forum
const addForum = async (req, res) => {
  try {
    const { title, description, category, tags, isPrivate } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json(new ApiError(400, "Title and description are required."));
    }

    const newForum = new Forum({
      title,
      description,
      creator: req.user.id,
      category,
      tags,
    });

    const savedForum = await newForum.save();

    const notificationToUser = new NotificationModel({
      recipient: req.user.id,
      message: `Forum post titled "${savedForum.title}" was successfully added.`,
      activityType: "FORUM_POST_ADDED",
      relatedId: savedForum._id,
    });

    await notificationToUser.save();

    return res.status(201).json(
      new ApiResponse(201, "Forum created successfully", {
        _id: savedForum._id,
        title: savedForum.title,
      })
    );
  } catch (error) {
    console.error("Error creating forum:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Server error", error.message));
  }
};

// Controller to get a forum by ID
const getForumById = async (req, res) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");
    const forumid = req.params.id;

    const forum = await Forum.findById(forumid)
      .populate("creator", "f_Name l_Name trainer_image")
      .populate("answers.author", "f_Name l_Name trainer_image")
      .select("-isPrivate -updatedAt");
    if (!forum) {
      return res.status(404).json(new ApiError(404, "Forum not found."));
    }

    return res.status(200).json(
      new ApiResponse(200, "Forum found.", {
        _id: forum?._id,
        title: forum?.title,
        description: forum?.description,
        likes: forum?.likes?.length,
        dislikes: forum?.dislikes?.length,
        comments: forum?.comments?.length,
        creator_id: forum?.creator?._id,
        creator_name: forum?.creator?.f_Name + " " + forum?.creator?.l_Name,
        trainer_image: forum?.creator?.f_Name
          ? `${baseUrl}/${forum?.creator?.trainer_image?.replace(/\\/g, "/")}`
          : "",
        tags: forum?.tags,
        participants: forum?.participants,
        answer: forum?.answers
          ?.map((ans) => ({
            author_id: ans?.author?._id,
            content: ans?.content || "",
            author_name: ans?.author?.f_Name
              ? `${ans?.author?.f_Name} ${ans?.author?.l_Name}`
              : "",
            author_image: ans?.author?.trainer_image
              ? `${ans?.author?.trainer_image?.replace(/\\/g, "/")}`
              : "",
          }))
          .reverse(),
        createdAt: formatDate(forum?.createdAt),
      })
    );
  } catch (error) {
    console.error("Error retrieving forum:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Server error", error.message));
  }
};

const getForums = async (req, res) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");

    const forums = await Forum.find()
      .sort({ createdAt: -1 })
      .populate("creator", "f_Name l_Name trainer_image")
      .select("-isPrivate -updatedAt");
    if (!forums) {
      return res.status(404).json(new ApiError(404, "Forum not found."));
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        "Forum found.",
        forums?.map((forum) => ({
          _id: forum?._id,
          title: forum?.title,
          description: forum?.description,
          likes: forum?.likes?.length,
          dislikes: forum?.dislikes?.length,
          comments: forum?.comments?.length,
          creator_id: forum?.creator?._id,
          creator_name: forum?.creator?.f_Name
            ? `${forum?.creator?.f_Name} ${forum?.creator?.l_Name}`
            : "",
          trainer_image: forum?.creator?.trainer_image
            ? `${baseUrl}/${forum?.creator?.trainer_image?.replace(/\\/g, "/")}`
            : "",
          tags: forum?.tags,
          participants: forum?.participants,
          answer_count: forum?.answers?.length,
          createdAt: formatDate(forum?.createdAt),
        }))
      )
    );
  } catch (error) {
    console.error("Error retrieving forum:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Server error", error.message));
  }
};

// Controller to handle likes and dislikes
const toggleLikeDislike = async (req, res) => {
  try {
    const { forumid } = req.params;
    const userId = req.user.id;

    const forum = await Forum.findById(forumid);
    if (!forum) {
      return res.status(404).json({ message: "Forum post not found" });
    }
    const hasLiked = forum.likes.includes(userId);
    const hasDisliked = forum.dislikes.includes(userId);

    // Handle Like
    if (req?.body?.action === "like") {
      if (hasLiked) {
        forum.likes.pull(userId);
      } else {
        if (hasDisliked) {
          forum.dislikes.pull(userId);
        }
        forum.likes.push(userId);
      }
    }

    if (req.body.action === "dislike") {
      if (hasDisliked) {
        forum.dislikes.pull(userId);
      } else {
        if (hasLiked) {
          forum.likes.pull(userId);
        }
        forum.dislikes.push(userId);
      }
    }

    await forum.save();

    return res.status(200).json(
      new ApiResponse(200, `Forum post ${req.body.action}d successfully`, {
        likes: forum.likes.length,
        dislikes: forum.dislikes.length,
      })
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(new ApiError(500, "Server error" || error.message, error));
  }
};

// Controller to add Comment / Reply
async function addReplyToPost(req, res) {
  const forumid = req.query.forumid;
  const userid = req.user.id;
  const replyContent = req.body.replyContent;
  const post = await Forum.findById(forumid);
  if (!post) {
    throw new Error("Post not found");
  }
  post.comments.push({
    content: replyContent,
    author: userid,
  });
  await post.save();

  const notificationToUser = new NotificationModel({
    recipient: req.user.id,
    message: `A reply was successfully added to the forum post titled "${post.title}".`,
    activityType: "FORUM_REPLY_ADDED",
    relatedId: post._id,
  });
  await notificationToUser.save();
  res.send("commented");
}

// Post an Answer to a Forum
const postAnswer = async (req, res) => {
  try {
    const { forumid } = req.body;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: "Answer content is required" });
    }

    // Find the forum by its ID
    const forum = await Forum.findById(forumid);
    if (!forum) {
      return res.status(404).json({ message: "Forum not found" });
    }

    // Create the answer object
    const newAnswer = {
      content,
      author: userId,
    };

    // Add the answer to the answers array in the forum document
    forum.answers.push(newAnswer);

    // Save the updated forum
    await forum.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "Answer posted successfully", forum?.answers));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiError(500, error.message || "Server error", error));
  }
};

module.exports = {
  addForum,
  getForumById,
  getForums,
  toggleLikeDislike,
  addReplyToPost,
  postAnswer,
};
