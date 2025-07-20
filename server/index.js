const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const categoryRoute = require("./routes/categories");
const multer = require("multer");
const path = require("path");
const cors=require("cors")
require("./passport");
const passport = require("passport");
const cookieParser = require("cookie-parser");


dotenv.config();
app.use(cors({origin:"http://localhost:5173",credentials:true}))
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));
app.use(cookieParser())

app.use(passport.initialize());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    },
});

const upload = multer({ storage: storage });


app.post("/api/upload", upload.single("file"), (req, res) => {
    res.status(200).json("File has been uploaded");
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoryRoute);

app.listen("5000", () => {
    console.log("Backend is running.");
});