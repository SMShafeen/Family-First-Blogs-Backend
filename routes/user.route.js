import express from "express";
import { getUserSavedPosts, savePosts } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/saved", getUserSavedPosts);
router.patch("/save", savePosts);

export default router;