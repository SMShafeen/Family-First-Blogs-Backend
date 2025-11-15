import express from "express";
import { createPost, deletePost, getPost, getPosts, uploadAuth, featurePost, editPost, deleteCoverImage } from "../controllers/post.controller.js";
import increaseVisit from "../middlewares/increaseVisit.js";

const router = express.Router();

router.get("/upload-auth", uploadAuth);

router.get("/", getPosts);

router.get("/:slug", increaseVisit, getPost);

router.post("/", createPost);

router.put("/:id", editPost);

router.delete("/:id", deletePost);

router.delete("/imagekit/delete-img", deleteCoverImage);

router.patch("/feature", featurePost);

export default router;