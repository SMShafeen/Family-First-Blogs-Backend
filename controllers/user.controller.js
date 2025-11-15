import User from "../models/user.model.js"

export const getUserSavedPosts = async (req, res) => {
    const clerkUserID = req.auth().userId;

    if (!clerkUserID) {
        return res.status(401).json("Not authenticated!");
    }
    const user = await User.findOne({clerkUserID});

    res.status(200).json(user.savedPosts);
};

export const savePosts = async (req, res) => {
    const clerkUserID = req.auth().userId;
    const postID = req.body.postID;
    
    if (!clerkUserID) {
        return res.status(401).json("Not authenticated!");
    }
    const user = await User.findOne({clerkUserID});

    const isSaved = user.savedPosts.some((p) => p === postID);

    if (!isSaved) {
        await User.findByIdAndUpdate(user._id, {
            $push: { savedPosts: postID}
        });
    } else {
        await User.findByIdAndUpdate(user._id, {
            $pull: { savedPosts: postID}
        });
    }

    setTimeout(() => {
        res.status(200).json(isSaved ? "Post unsaved!" : "Post saved!");
    }, 3000);
};