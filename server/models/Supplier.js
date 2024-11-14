const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema({
  supplier_name: {
    type: String,
    required: true,
    unique: true,
  },
  contact_info: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Supplier", SupplierSchema);
