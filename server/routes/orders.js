const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authenticateToken = require("../middleware/auth");
const OrderItem = require("../models/OrderItem");
const { default: mongoose } = require("mongoose");

const getOrderPayload = ({
  customer_id,
  invoice_number,
  tin,
  billing_address,
  total_amount,
  payment_type,
  status,
  initiator_id,
  company_id,
  referrer_id,
  approver_id,
}) => {
  return {
    customer_id,
    invoice_number,
    tin,
    billing_address,
    total_amount,
    payment_type,
    status,
    initiator_id,
    company_id,
    referrer_id,
    approver_id,
  };
};

const getOrderItemPayload = ({
  _id,
  product_id,
  quantity,
  unit_price,
  custom_discount,
  total_price,
}) => ({
  _id,
  product_id,
  quantity,
  unit_price,
  custom_discount,
  total_price,
});

const orderAggregateParams = [
  {
    $lookup: {
      from: "customers",
      localField: "customer_id",
      foreignField: "_id",
      as: "customer_id",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "initiator_id",
      foreignField: "_id",
      as: "initiator_id",
    },
  },
  {
    $lookup: {
      from: "companies",
      localField: "company_id",
      foreignField: "_id",
      as: "company_id",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "approver_id",
      foreignField: "_id",
      as: "approver_id",
    },
  },
  {
    $lookup: {
      from: "referrers",
      localField: "referrer_id",
      foreignField: "_id",
      as: "referrer_id",
    },
  },
  {
    $lookup: {
      from: "orderitems",
      localField: "_id",
      foreignField: "order_id",
      as: "order_items",
    },
  },
  {
    $unwind: {
      path: "$customer_id",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $unwind: {
      path: "$initiator_id",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $unwind: {
      path: "$company_id",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $unwind: {
      path: "$approver_id",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $unwind: {
      path: "$referrer_id",
      preserveNullAndEmptyArrays: true,
    },
  },
  { $unwind: { path: "$order_items", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "products",
      localField: "order_items.product_id",
      foreignField: "_id",
      as: "order_items.product_id",
    },
  },
  {
    $unwind: {
      path: "$order_items.product_id",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: "$_id",
      invoice_number: { $first: "$invoice_number" },
      tin: { $first: "$tin" },
      billing_address: { $first: "$billing_address" },
      total_amount: { $first: "$total_amount" },
      payment_type: { $first: "$payment_type" },
      status: { $first: "$status" },
      initiator_id: { $first: "$initiator_id" },
      customer_id: { $first: "$customer_id" },
      company_id: { $first: "$company_id" },
      referrer_id: { $first: "$referrer_id" },
      approver_id: { $first: "$approver_id" },
      created_at: { $first: "$created_at" },
      order_items: { $push: "$order_items" },
    },
  },
];

// Create a orders
router.post("/", authenticateToken, async (req, res) => {
  const payload = getOrderPayload(req.body);
  const newOrder = new Order({
    ...payload,
    status: "draft",
    created_at: new Date(),
  });
  try {
    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all orders
router.get("/", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $match: {
          company_id: new mongoose.Types.ObjectId(req.query.company_id),
        },
      },
      ...orderAggregateParams,
    ]);

    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Get order
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      ...orderAggregateParams,
    ]);

    res.status(200).json(orders[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Update a Order
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const order_id = req.params.id;
    const { order_items, ...rest } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      getOrderPayload(rest),
      {
        new: true,
      }
    );
    if (order_items?.length > 0 && order_id) {
      const existingOrderItems = order_items
        .filter(({ _id }) => !!_id)
        .map(({ _id, ...rest }) => ({
          updateOne: {
            filter: { _id },
            update: { $set: { ...rest } },
          },
        }));
      if (existingOrderItems.length > 0) {
        await OrderItem.bulkWrite(existingOrderItems);
      }
      const newOrderItems = order_items
        .filter(({ _id }) => !_id)
        .map(({ _id, ...rest }) => ({
          order_id,
          ...getOrderItemPayload(rest),
          created_at: new Date(),
        }));
      if (newOrderItems.length > 0) {
        await OrderItem.insertMany(newOrderItems);
      }

      // TODO: if status === 'approved', reduce quantity_on_hand on Product Inventory
    }
    res.status(200).json(updatedOrder);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Delete a Order
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
