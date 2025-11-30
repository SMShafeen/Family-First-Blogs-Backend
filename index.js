import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/connectDB.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webhookRouter from "./routes/webhook.route.js";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import cors from "cors";
import path from "path";
import { env } from "process";

const app = express();
dotenv.config();

// const __dirname = path.resolve();

app.use("/webhooks", webhookRouter);
app.use(express.json());

const environment = process.env.NODE_ENV === "development" ? process.env.CLIENT_URL : "https://blogs.familyfirstguidance.com";
// app.use(cors(process.env.CLIENT_URL));
app.use(
  cors({
    origin: environment,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Access-Control-Allow-Headers",
      "Content-Type",
      "Authorization",
      "Origin",
      "Accept",
      "X-Requested-With",
    ],
  }),
);

app.use(clerkMiddleware());

// allow cross-origin requests
// app.use(function(req, res, next) {
//   // res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", 
//     "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// app.get("/auth-state", (req, res) => {
//     const authState = req.auth();
//     res.json(authState);
// });

// app.get("/protect", (req, res) => {
//     const { userId } = req.auth();
//     if(!userId){
//         return res.status(401).json("Not authenticated!");
//     }
//     res.status(200).json("Authenticated!");
// });

// app.get("/protect2", requireAuth(),(req, res) => {
//     res.status(200).json("Authenticated!");
// });

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);

app.use((error, req, res, next) => {
    res.status(error.status || 500);

    res.json({
        message: error.message || "Something went wrong!",
        status: error.status,
        stack: error.stack
    });
});

// if(process.env.NODE_ENV === 'production'){
//   app.use(express.static(path.join(__dirname, '../frontend/dist')));

//   app.get(/(.*)/, (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

const port = process.env.PORT;
app.listen(port, ()=>{
    console.log(`Server is running in port: ${port}`);
    connectDB();
});