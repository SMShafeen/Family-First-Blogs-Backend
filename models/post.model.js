import mongoose from "mongoose";
import { Schema } from "mongoose";

const postSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    coverImage: {
        url:{ type: String },
        fileId:{ type: String }
    },
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    desc: {
        type: String,
    },
    category: {
        type: String,
        default: "general",
    },
    status: {
        type: String,
        default: "publish",
    },
    seoTitle: {
        type: String,
    },
    imgText: {
        type: String,
    },
    metaDesc: {
        type: String,
    },
    content: {
        type: String,
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    visitNumber: {
        type: Number,
        default: 0,
    },
},
{ timestamps: true }
);

export default mongoose.model("Post", postSchema);