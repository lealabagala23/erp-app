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
  payment_type: {
    type: String,
  },
  status: {
    type: String,
  },
  initiator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  discount_card: {
    type: String,
  },
  discount_card_number: {
    type: String,
  },
  sc_pwd_discount: {
    type: Boolean,
  },
  vat_exempted: {
    type: Boolean,
  },
  special_discount: {
    type: Number,
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
  referring_doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
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
