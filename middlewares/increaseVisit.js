import Post from "../models/post.model.js";

const increaseVisit = async (req, res, next) => {
    const slug = req.params.slug;

    await Post.findOneAndUpdate({ slug }, { $inc: { visitNumber: 1 } });

    next();
}

export default increaseVisit;