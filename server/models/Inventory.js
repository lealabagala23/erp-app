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
  unit_of_measure: {
    type: String,
    required: true,
  },
  quantity_on_hand: {
    type: Number,
    required: true,
  },
  quantity_on_order: {
    type: Number,
    required: true,
  },
  expiry_date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Inventory", InventorySchema);
