

// const express = require('express');
// const cors = require('cors');
// const errorHandler = require('./middleware/errorhandler');
// const bodyParser = require('body-parser');
// require('dotenv').config();

// const app = express();

// app.use(bodyParser.json());

// app.use(cors({
//     origin: true,
//     credentials: true
// }));

// app.use(express.json());

// app.use("/api/user", require('./routes/users'));
// app.use("/api/bookings", require('./routes/bookings'));

// const path = require("path");

// // Static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Error Handler
// app.use(errorHandler);

// app.use((err, req, res, next) => {
//     err.statusCode = err.statusCode || 500;
//     err.message = err.message || "Internal Server Error";

//     res.status(err.statusCode).json({
//         success: false,
//         message: err.message
//     });
// });

// // =====================
// // START SERVER
// // =====================

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });



const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

const errorHandler = require('./middleware/errorhandler');

dotenv.config();

const app = express();

const connectDB = require("./database/db");
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
// Connect Database
connectDB();

// MongoDB Connection
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log("MongoDB Connected");
//     })
//     .catch((err) => {
//         console.error("MongoDB Connection Error:", err);
//     });

// Middleware
app.use(bodyParser.json());
app.use(express.json());

app.use(cors({
    origin: true,
    credentials: true
}));

// Routes
app.use("/api/user", require('./routes/users'));
app.use("/api/bookings", require('./routes/bookings'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error Handler
app.use(errorHandler);

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});