import Comment from "../models/comment.model.js"
import User from "../models/user.model.js";

export const getPostComments = async (req, res) => {
    const comments = await Comment.find({ post: req.params.postID }).populate("user", "username img").
    sort({createdAt: -1});

    res.status(200).json(comments);
};

export const addComment = async (req, res) => {
    const clerkUserID = req.auth().userId;
    const postID = req.params.postID;

    if (!clerkUserID) {
        return res.status(401).json("Not authenticated!");
    }

    const user = await User.findOne({ clerkUserID });

    const newComment = new Comment({
        ...req.body,
        user: user._id,
        post: postID
    });

    const savedComment = await newComment.save();

    setTimeout(() => {
        res.status(201).send(savedComment);
    }, 3000);
};

export const deleteComment = async (req, res) => {
    try {
        const clerkUserID = req.auth().userId;
        const id = req.params.id;

        if (!clerkUserID) {
            return res.status(401).json("Not authenticated!");
        }

        const role = req.auth().sessionClaims?.metadata?.role || "user";
        if (role === "admin") {
            await Comment.findByIdAndDelete(id);
            return res.status(200).json("Comment has been deleted by admin!");
        }

        const user = await User.findOne({ clerkUserID });
        if(!user){
            return res.status(404).json("User not found!");
        }

        const deletedComment = await Comment.findOneAndDelete({ _id: id, user: user._id});

        if (!deletedComment) {
            return res.status(403).json("You can delete only your own comments!");
        }

        return res.status(200).json("Comment deleted!");
        
    } catch (error) {
        console.error("Error deleting comment: ", error);
        return res.status(500).json("Internal server error!")
    }
};