const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  customer_name: {
    type: String,
    required: true,
    unique: true,
  },
  customer_type: {
    type: String,
    required: true,
  },
  contact_info: {
    type: String,
  },
  tin: {
    type: String,
  },
  address: {
    type: String,
  },
  created_at: {
    type: Date,
    required: true,
  },
  updated_at: {
    type: Date,
    required: true,
  },
  last_updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Customer", CustomerSchema);
