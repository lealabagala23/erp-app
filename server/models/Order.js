const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  invoice_number: {
    type: Number,
  },
  tin: {
    type: String,
  },
  billing_address: {
    type: String,
  },
  total_amount: {
    type: Number,
  },
  payment_type: {
    type: String,
  },
  payment_status: {
    type: String,
  },
  initiator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  referrer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Referrer",
  },
  approver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  created_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
