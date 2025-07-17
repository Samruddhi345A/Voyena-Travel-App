const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
 
    name: {
        type: String,
        required: true,
       
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountid: {
        type: String,
        required: true,
        unique: true,
    },
    imageUrl: {
        type: String,
        
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    authProvider: { 
        type: String,
        enum: ["google", "email"],
        default: "email" }
});

module.exports = mongoose.model("User", userSchema,'user');