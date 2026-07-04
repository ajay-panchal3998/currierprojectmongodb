// const mysql = require("mysql2/promise");

// const pool = mysql.createPool({
//     host: process.env.HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.PASSWORD || "",
//     database: process.env.DATABASE || "courier_db",
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
// });

// // Check connection
// (async () => {
//     try {
//         const connection = await pool.getConnection();
//         console.log("✅ Connected to MySQL Database");
//         connection.release();
//     } catch (err) {
//         console.error("❌ Database connection failed:", err.message);
//     }
// })();

// module.exports = { pool };


const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1); // stop server if DB fails
    }
};

module.exports = connectDB;