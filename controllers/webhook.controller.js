import User from "../models/user.model.js";
import { Webhook } from "svix";


export const clerkWebHook = async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if(!WEBHOOK_SECRET){
        throw new Error("Webhook secret needed!");
    }

    // res.status(200).send("Ok!");

    const payload = req.body;
    const headers = req.headers;

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;
    try {
        evt = wh.verify(payload, headers);
    } catch (error) {
        return res.status(400).json({ message: "Webhook verification failed!" });
    }
    // console.log(evt.data);
    
    if(evt.type === "user.created") {
        // console.log("userID:", evt.data.id);
        const newUser = new User({
            clerkUserID: evt.data.id,
            username: evt.data.username || evt.data.email_addresses[0].email_address,
            email: evt.data.email_addresses[0].email_address,
            img: evt.data.profile_image_url
        });

        await newUser.save();
        return res.status(200).json({ message: "Webhook received and user created!" });
    }
    
    if(evt.type === "user.updated") {
        // console.log("userID:", evt.data.id);
        await User.findOneAndUpdate({clerkUserID: evt.data.id}, {
            $set: {
                username: evt.data.username || evt.data.email_addresses[0].email_address,
                email: evt.data.email_addresses[0].email_address,
                img: evt.data.profile_image_url
            }
    }, { new: true });

        return res.status(200).json({ message: "Webhook received and user updated!" });
    }
};