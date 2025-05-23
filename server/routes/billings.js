const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authenticateToken = require("../middleware/auth");
const orderAggregateParams = require("../constants/orderAggregateParams");
const { default: mongoose } = require("mongoose");

// Get all billing statements
router.get("/", authenticateToken, async (req, res) => {
  try {
    const params = {
      company_id: new mongoose.Types.ObjectId(req.query.company_id),
      status: { $in: ["unpaid", "partially_paid"] },
    };

    const result = await Order.aggregate([
      {
        $match: params,
      },
      ...orderAggregateParams,
      {
        $group: {
          _id: "$customer_id._id",
          customer_name: { $first: "$customer_id.customer_name" },
          company_name: { $first: "$company_id.company_name" },
          bank_name: { $first: "$company_id.bank_name" },
          bank_account_name: { $first: "$company_id.bank_account_name" },
          bank_account_number: { $first: "$company_id.bank_account_number" },
          billing_address: { $first: "$billing_address" },
          order_count: { $sum: 1 },
          orders: { $push: "$$ROOT" },
          total_balance: {
            $sum: {
              $subtract: ["$net_total", { $ifNull: ["$total_amount_paid", 0] }],
            },
          },
          min_created_at: { $min: "$created_at" },
        },
      },
      {
        $addFields: {
          order: {
            $first: "$orders",
          },
        },
      },
      {
        $addFields: {
          co_doctor_name: "$order.customer_id.codoctors.co_doctor_name",
        },
      },
      {
        $sort: { min_created_at: -1 },
      },
    ]);
    res.status(200).json(result);
  } catch (err) {
    console.log("err", err);
    res.status(500).json(err);
  }
});

module.exports = router;
