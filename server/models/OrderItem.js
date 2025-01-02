const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  inventory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
  },
  quantity: {
    type: Number,
  },
  cancelled_quantity: {
    type: Number,
  },
  unit_price: {
    type: Number,
  },
  total_price: {
    type: Number,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("OrderItem", OrderItemSchema);
