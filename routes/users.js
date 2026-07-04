// const router = require("express").Router();
// const jwt = require("jsonwebtoken");
// const { pool } = require("../database/db");
// const { genUserId, genOTP } = require("../Helper/encriptpass.js");
// const { encryptPassword, decryptPassword } = require("../helper/encriptpass.js");
// const verifyToken = require('../middleware/verifyToken.js');
// const genJwtToken = require("../middleware/genjwttoken.js");
// const sendMail = require("../Helper/sendMail.js");

const router = require("express").Router();
const jwt = require("jsonwebtoken");

const User = require("../modals/User");

const { genUserId, genOTP } = require("../Helper/encriptpass.js");
const { encryptPassword, decryptPassword } = require("../helper/encriptpass.js");

const genJwtToken = require("../middleware/genjwttoken.js");
const sendMail = require("../Helper/sendMail.js");

// ---------------- REGISTER ----------------
// router.post("/register", async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password)
//             return res.status(400).json({ message: "All fields required" });

//         // check user exists
//         const [exist] = await pool.query(
//             "SELECT id FROM users WHERE email=?",
//             [email]
//         );

//         if (exist.length > 0) return res.status(409).json({ message: "User already exists" });

//         const userid = await genUserId();
//         const hashPassword = await encryptPassword(password);

//         await pool.query(
//             "INSERT INTO users (userid, email, password, created_at) VALUES (?, ?, ?, NOW())",
//             [userid, email, hashPassword]
//         );

//         return res.status(201).json({
//             success: true,
//             message: "User registered successfully",
//             userid
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server error" });
//     }
// });

router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "All fields required" });

        const exist = await User.findOne({ email });

        if (exist)
            return res.status(409).json({ message: "User already exists" });

        const userid = await genUserId();
        const hashPassword = await encryptPassword(password);

        await User.create({
            userid,
            email,
            password: hashPassword,
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            userid
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "email & password required" });

        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({ message: "User not found" });

        if (user.access !== 1)
            return res.status(403).json({ message: "Account is disabled" });

        const isMatch = await decryptPassword(password, user.password);

        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });

        const token = genJwtToken(user.userid, email);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/forgotpassword", async (req, res) => {
    try {
        const { email } = req.body;

        const otp = genOTP();

        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({ message: "User not found" });

        await User.updateOne(
            { email },
            { otp, otp_created_at: new Date() }
        );

        await sendMail(
            "Update Password OTP",
            `otp for update password is ${otp}`,
            email
        );

        res.json({
            success: true,
            message: "OTP sent",
            userid: user.userid
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/update-password", async (req, res) => {
    try {
        const { otp, password, userid } = req.body;

        if (!otp || !password)
            return res.status(400).json({ message: "All fields required" });

        const user = await User.findOne({ userid });

        if (!user)
            return res.status(404).json({ message: "User not found" });

        if (user.otp !== otp)
            return res.status(401).json({ message: "Invalid OTP" });

        const diff = (new Date() - new Date(user.otp_created_at)) / 60000;

        if (diff > 5)
            return res.status(401).json({ message: "OTP expired" });

        const hash = await encryptPassword(password);

        await User.updateOne(
            { userid },
            { password: hash, otp: null }
        );

        res.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;