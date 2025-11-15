import express from "express";
import { addComment, deleteComment, getPostComments } from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/:postID", getPostComments);
router.post("/:postID", addComment);
router.delete("/:id", deleteComment);

export default router;