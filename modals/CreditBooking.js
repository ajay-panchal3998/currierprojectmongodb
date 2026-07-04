const mongoose = require("mongoose");

const creditBookingSchema = new mongoose.Schema({
    userid: Number,
    client: String,
    department: String,
    document_number: { type: String, unique: true },
    delivery_pin_code: String,
    type: String,
    service: String,
    travel_by: String,
    receiver_name: String,
    receiver_address: String,
    mobile_number: String,
    receiver_mobile_number: String,
    email: String,
    content: String,
    company_name: String,
    value: Number,
    weight: Number,
    insured: String,
    price: Number,
    length: Number,
    width: Number,
    height: Number,
    vol_weight: Number,
    package_charge: Number,
    total_amount: Number,
    pdf: String
}, { timestamps: true });

module.exports = mongoose.model("CreditBooking", creditBookingSchema);