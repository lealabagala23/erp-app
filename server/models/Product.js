const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  barcode: {
    type: String,
    unique: true,
  },
  product_name: {
    type: String,
    required: true,
    unique: true,
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
    required: true,
  },
  patient_price: {
    type: Number,
    required: true,
  },
  doctor_price: {
    type: Number,
    required: true,
  },
  agency_price: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
