const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  payment_date: {
    type: Date,
    required: true,
  },
  amount_paid: {
    type: Number,
  },
  payment_method: {
    type: String,
  },
  bank_name: {
    type: String,
  },
  trans_ref_no: {
    type: String,
  },
  collection_receipt_no: {
    type: String,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
