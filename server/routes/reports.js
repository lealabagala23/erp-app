const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authenticateToken = require("../middleware/auth");
const { default: mongoose } = require("mongoose");
const defaultOrderAggrParams = require("../constants/defaultOrderAggrParams");

// Get all reports
router.get("/:time_period", authenticateToken, async (req, res) => {
  try {
    const time_period = req.params.time_period;
    const { start_date, end_date } = req.query;
    const params = {
      company_id: new mongoose.Types.ObjectId(req.query.company_id),
      //   status: "completed",
      created_at: {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      },
    };

    const reports = await Order.aggregate([
      {
        $match: params,
      },
      ...defaultOrderAggrParams,
      {
        $group: {
          _id: { $dateToString: { format: "%m-%d-%Y", date: "$created_at" } },
          orders: { $push: "$$ROOT" },
          total_sales: {
            $sum: {
              $multiply: ["$order_items.unit_price", "$order_items.quantity"],
            },
          },
          order_count: { $sum: 1 },
          cancelled_qty: {
            $sum: { $ifNull: ["$order_items.cancelled_quantity", 0] },
          },
          net_sales: {
            $sum: {
              $subtract: [
                {
                  $multiply: [
                    "$order_items.unit_price",
                    "$order_items.quantity",
                  ],
                },
                {
                  $multiply: [
                    "$order_items.unit_price",
                    { $ifNull: ["$order_items.cancelled_quantity", 0] },
                  ],
                },
              ],
            },
          },
        },
      },
      {
        $addFields: {
          avg_order_value: { $divide: ["$net_sales", "$order_count"] },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $setWindowFields: {
          partitionBy: null,
          sortBy: { _id: 1 },
          output: {
            previousDaySales: {
              $shift: { output: "$net_sales", by: -1 },
            },
          },
        },
      },
      {
        $addFields: {
          sales_growth: {
            $cond: {
              if: { $eq: ["$previousDaySales", 0] },
              then: 0,
              else: {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ["$net_sales", "$previousDaySales"] },
                      "$previousDaySales",
                    ],
                  },
                  100,
                ],
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      start_date,
      end_date,
      data: reports,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
