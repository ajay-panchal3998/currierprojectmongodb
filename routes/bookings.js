const router = require("express").Router();
const { pool } = require("../database/db");
const multerfunc = require('../middleware/multer.js');
const generatePdf = require("../middleware/generateCreditBookingPdf");
const generateretailPdf = require("../middleware/generateRetailBookingPdf.js");
const sendBookingEmail = require("../middleware/sendbookingemail.js");

const upload = multerfunc();
const CreditBooking = require("../modals/CreditBooking");
const RetailBooking = require("../modals/RetailBooking");

router.post("/credit_booking", async (req, res) => {
    try {
        const userid = 22;

        const pdfPath = await generatePdf(req.body);

        const { document_number } = req.body;

        const exists = await CreditBooking.findOne({ document_number });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: `Document number already exists`
            });
        }

        const booking = await CreditBooking.create({
            userid,
            ...req.body,
            pdf: pdfPath
        });

        res.status(201).json({
            success: true,
            message: "Credit booking created",
            pdfPath,
            data: booking
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/fetch_clients", async (req, res) => {
    try {
        const search = req.body.search?.trim();

        let query = {};

        if (search) {
            query.client = { $regex: `^${search}`, $options: "i" };
        }

        const clients = await CreditBooking.find(query)
            .distinct("client");

        res.json(clients.slice(0, 5));

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/fetch_departments", async (req, res) => {
    try {
        const { client, department } = req.body;

        let query = {};

        if (client?.trim()) {
            query.client = client.trim();
        }

        if (department?.trim()) {
            query.department = { $regex: `^${department}`, $options: "i" };
        }

        const departments = await CreditBooking.find(query)
            .distinct("department");

        res.json(departments.slice(0, 10));

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/retail_booking", upload.single("document_image"), async (req, res) => {
    try {
        const data = req.body;
        const document_image = req.file ? req.file.path : null;

        const pdfPath = await generateretailPdf(data, document_image);

        const exists = await RetailBooking.findOne({
            document_number: data.document_number
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: `Document number already exists`
            });
        }

        const booking = await RetailBooking.create({
            ...data,
            document_image,
            pdf: pdfPath
        });

        await sendBookingEmail(
            data.email_address,
            data.receiver_email,
            data,
            pdfPath
        );

        res.status(201).json({
            success: true,
            message: "Retail booking created",
            pdfPath,
            data: booking
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
});

router.post("/fetch_credit_booking", async (req, res) => {
    try {
        const { fromDate, toDate, client, department, docSearch: search, page = 1, limit = 20 } = req.body;
        console.log(req.body, '------------------------------------')
        let query = {};

        if (fromDate && toDate) {
            query.createdAt = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            };
        }

        if (client) query.client = client;
        if (department) query.department = department;

        if (search && search.trim()) {
            const s = search.trim();

            const orConditions = [
                { document_number: { $regex: s, $options: "i" } },
                { client: { $regex: s, $options: "i" } },
                { department: { $regex: s, $options: "i" } },
                { company_name: { $regex: s, $options: "i" } },
                { receiver_name: { $regex: s, $options: "i" } },
                { receiver_address: { $regex: s, $options: "i" } },
                { mobile_number: { $regex: s, $options: "i" } },
                { receiver_mobile_number: { $regex: s, $options: "i" } },
                { email: { $regex: s, $options: "i" } },
                { delivery_pin_code: { $regex: s, $options: "i" } },
                { type: { $regex: s, $options: "i" } },
                { service: { $regex: s, $options: "i" } },
                { travel_by: { $regex: s, $options: "i" } },
                { content: { $regex: s, $options: "i" } },
                { status: { $regex: s, $options: "i" } }
            ];

            // number search separately
            const num = Number(s);
            if (!isNaN(num)) {
                orConditions.push(
                    { weight: num },
                    { price: num },
                    { total_amount: num }
                );
            }

            // IMPORTANT FIX (wrap in $and)
            query = {
                ...query,
                $and: [
                    ...(Object.keys(query).length ? [query] : []),
                    { $or: orConditions }
                ]
            };
        }

        const total = await CreditBooking.countDocuments(query);

        const data = await CreditBooking.find(query)
            .sort({ _id: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            success: true,
            data,
            total
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/delete_retail_booking", async (req, res) => {
    try {
        const { id } = req.body;

        const result = await RetailBooking.deleteOne({ _id: id });

        if (!result.deletedCount) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.json({
            success: true,
            message: "Deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post("/fetch_retail_booking", async (req, res) => {
    try {
        const { fromDate, toDate, search, page = 1, limit = 20 } = req.body;

        let query = {};

        // Date filter
        if (fromDate && toDate) {
            query.createdAt = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            };
        }

        // Search filter (OR condition)
        if (search) {
            const s = search;

            query.$or = [
                { document_number: { $regex: s, $options: "i" } },
                { sender_name: { $regex: s, $options: "i" } },
                { receiver_name: { $regex: s, $options: "i" } },
                { mobile_number: { $regex: s, $options: "i" } },
                { email_address: { $regex: s, $options: "i" } },
                { company_name: { $regex: s, $options: "i" } }
            ];
        }

        const total = await RetailBooking.countDocuments(query);

        const data = await RetailBooking.find(query)
            .sort({ _id: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            success: true,
            data,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

router.delete("/delete_credit_booking", async (req, res) => {
    try {
        const { id } = req.body;

        const result = await CreditBooking.deleteOne({ _id: id });

        if (!result.deletedCount) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.json({
            success: true,
            message: "Deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;