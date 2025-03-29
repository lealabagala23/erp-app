const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  stock_arrival_date: {
    type: Date,
  },
  quantity_on_hand: {
    type: Number,
  },
  quantity_on_order: {
    type: Number,
  },
  expiry_date: {
    type: Date,
  },
  batch_number: {
    type: String,
  },
  status: {
    type: String,
  },
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  last_updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  created_at: {
    type: Date,
    required: true,
  },
  updated_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Inventory", InventorySchema);
