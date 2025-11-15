import ImageKit from "imagekit";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import { clerkClient } from "@clerk/express";

export const getPosts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const query = {};
    console.log(req.query);

    const cat = req.query.cat;
    const author = req.query.author;
    const searchQuery = req.query.search;
    const sortQuery = req.query.sort;
    const featured = req.query.featured;

    if (cat) {
        query.category = cat;
    }

    if (searchQuery) {
        query.title = { $regex: searchQuery, $options: "i" };
    }

    if (author) {
        const user = await User.findOne({ username: author }).select("_id");

        if (!user) {
            return res.status(404).json("No post found!");
        }

        query.user = user._id;
    }

    let sortObj = {createdAt: -1};
    if (sortQuery) {
        switch (sortQuery) {
            case "newest":
                sortObj = {createdAt: -1};
                break;
            case "oldest":
                sortObj = {createdAt: 1};
                break;
            case "popular":
                sortObj = {visitNumber: -1};
                break;
            case "trending":
                sortObj = {visitNumber: -1};
                query.createdAt = {
                    $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
                }
                break;
            default:
                break;
        }
    }

    if (featured) {
        query.isFeatured = true;
    }

    const posts = await Post.find(query).populate("user", "username").sort(sortObj).limit(limit).skip((page-1)*limit);

    const totalPosts = await Post.countDocuments();
    const hasMore = page * limit < totalPosts;
    res.status(200).json({ posts, hasMore });
};

export const getPost = async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug }).populate("user", "username img");
    res.status(200).json(post);
};

export const createPost = async (req, res) => {
    try {
        const clerkUserID = req.auth().userId;
        // console.log(req.headers);
        
        if(!clerkUserID){
            return res.status(401).json("Not authenticated!");
        }

        const userCheck = await clerkClient.users.getUser(clerkUserID);
        const role = userCheck.publicMetadata?.role || "user";

        if (role !== "admin") {
            return res.status(403).json("Access denied. Only admin can perform this action!");
        }

        const user = await User.findOne({ clerkUserID });

        if(!user){
            return res.status(404).json("User not found!");
        }

        let slug = req.body.title
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();

        let existingPost = await Post.findOne({ slug });
        let counter = 2;

        while (existingPost) {
            slug = `${slug}-${counter}`;
            existingPost = await Post.findOne({ slug });
            counter++;
        }

        const newPost = new Post({ user: user._id, slug, ...req.body });

        const post = await newPost.save();

        if(!post){
            return res.status(404).json("Blog not found!");
        }
        res.status(200).json(post);
    } catch (error) {
        console.error("Error saving blog:", error);
        res.status(500).json("Internal server error while saving the blog!");
    }
};

export const editPost = async (req, res) => {
    try {
        const clerkUserID = req.auth().userId;
        if(!clerkUserID){
            return res.status(401).json("Not authenticated!");
        }
        
        const user = await clerkClient.users.getUser(clerkUserID);
        const role = user.publicMetadata?.role || "user";
        const postID = req.params.id;
        
        const updateData = req.body;
        
        if (role !== "admin") {
            return res.status(403).json("Access denied. Only admin can perform this action!");
        }

        const updatedPost = await Post.findByIdAndUpdate(postID, updateData, { new: true });

        if(!updatedPost){
            return res.status(404).json("Blog not found!");
        }
        
        return res.status(200).json(updatedPost);
    } catch (error) {
        console.error("Error editing blog:", error);
        res.status(500).json("Internal server error while editing the blog!");
    }
};

export const deletePost = async (req, res) => {
    try {
        const clerkUserID = req.auth().userId;
        if(!clerkUserID){
            return res.status(401).json("Not authenticated!");
        }
        
        const user = await clerkClient.users.getUser(clerkUserID);
        const role = user.publicMetadata?.role || "user";

        if (role !== "admin") {
            return res.status(403).json("Access denied. Only admin can perform this action!");
        }

        const deletedBlog = await Post.findByIdAndDelete(req.params.id);

        if(!deletedBlog){
            return res.status(404).json("Blog not found!");
        }

        await Comment.deleteMany({ post: deletedBlog._id });
        
        return res.status(200).json("Blog and its comment has been deleted!");
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json("Internal server error while deleting the blog!");
    }
};

export const featurePost = async (req, res) => {
    try {
        const clerkUserID = req.auth().userId;
        const postID = req.body.postID;

        if(!clerkUserID){
            return res.status(401).json("Not authenticated!");
        }

        const user = await clerkClient.users.getUser(clerkUserID);
        const role = user.publicMetadata?.role || "user";

        if (role !== "admin") {
            return res.status(403).json("Access denied. Only admin can perform this action!");
        }
        
        const post = await Post.findById(postID);
        
        if (!post) {
            return res.status(404).json("Post not found!");
        }

        const isFeatured = post.isFeatured;

        const updatedPost = await Post.findByIdAndUpdate(postID, { isFeatured: !isFeatured }, { new: true });

        setTimeout(() => {
            res.status(200).json(updatedPost);
        }, 3000);
    } catch (error) {
        console.error("Error featuring blog:", error);
        res.status(500).json("Internal server error while featuring the blog!");
    }
};

const imagekit = new ImageKit({
    urlEndpoint: process.env.IK_URL_ENDPOINT,
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY
})

export const uploadAuth = async (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
};

export const deleteCoverImage = async (req, res) => {
    try {
        const { fileId } = req.body;
        if(!fileId) return res.status(400).json({ error: "fileId required" });

        await imagekit.deleteFile(fileId);
        res.json({ message: "Cover image deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}