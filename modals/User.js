const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userid: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    access: { type: Number, default: 1 },
    otp: String,
    otp_created_at: Date
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);