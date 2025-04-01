const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  barcode: {
    type: String,
  },
  product_name: {
    type: String,
    required: true,
  },
  product_description: {
    type: String,
  },
  product_unit: {
    type: String,
  },
  generic_name: {
    type: String,
  },
  purchase_price: {
    type: Number,
  },
  unit_price: {
    type: Number,
    required: true,
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

module.exports = mongoose.model("Product", ProductSchema);
