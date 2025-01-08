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

    let id_field = {};
    let extra_fields = {};
    let group_id_field = undefined;

    switch (time_period) {
      case "week":
        id_field = "$weekStart";
        extra_fields = {
          week_start_date: {
            $dateSubtract: {
              startDate: "$first_order_date",
              unit: "day",
              amount: { $subtract: [{ $dayOfWeek: "$first_order_date" }, 1] },
            },
          },
          week_end_date: {
            $dateAdd: {
              startDate: {
                $dateSubtract: {
                  startDate: "$first_order_date",
                  unit: "day",
                  amount: {
                    $subtract: [{ $dayOfWeek: "$first_order_date" }, 1],
                  },
                },
              },
              unit: "day",
              amount: 6,
            },
          },
        };
        group_id_field = "$_id";
        break;
      case "month":
        id_field = "$monthStart";
        group_id_field = "$_id";
        break;
      default:
        id_field = {
          date: {
            $dateToString: {
              format: "%m-%d-%Y",
              date: {
                $dateTrunc: {
                  date: "$created_at",
                  unit: "day",
                },
              },
            },
          },
          order_id: "$_id",
        };
        group_id_field = "$_id.date";
    }

    const reports = await Order.aggregate([
      {
        $match: params,
      },
      ...defaultOrderAggrParams,
      {
        $addFields: {
          weekStart: {
            $dateToString: {
              format: "%Y-%m-$d",
              date: {
                $dateSubtract: {
                  startDate: "$created_at",
                  unit: "day",
                  amount: {
                    $subtract: [
                      { $dayOfWeek: "$created_at" }, // Get the day of the week (1 = Sunday, 7 = Saturday)
                      1, // Adjust by subtracting 1 (so Sunday becomes 0)
                    ],
                  },
                },
              },
            },
          },
          monthStart: {
            $dateToString: {
              format: "%Y-%m-01", // Format to get the first day of the month
              date: "$created_at",
            },
          },
        },
      },
      {
        $group: {
          _id: id_field,
          orders: { $push: "$$ROOT" },
          total_sales: {
            $sum: {
              $multiply: ["$order_items.unit_price", "$order_items.quantity"],
            },
          },
          order_count: { $sum: 1 },
          transactions: { $addToSet: "$_id" },
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
          first_order_date: { $min: "$created_at" },
        },
      },
      {
        $group: {
          _id: group_id_field,
          orders: { $first: "$orders" },
          total_sales: { $sum: "$total_sales" },
          order_count: { $first: "$order_count" },
          cancelled_qty: { $sum: "$cancelled_qty" },
          net_sales: { $sum: "$net_sales" },
          transactions: { $first: "$transactions" },
        },
      },
      {
        $addFields: {
          avg_order_value: { $divide: ["$net_sales", "$order_count"] },
          ...extra_fields,
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
            previous_day_sales: {
              $shift: { output: "$net_sales", by: -1 },
            },
          },
        },
      },
      {
        $addFields: {
          sales_growth: {
            $cond: {
              if: { $eq: ["$previous_day_sales", 0] },
              then: 0,
              else: {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ["$net_sales", "$previous_day_sales"] },
                      "$previous_day_sales",
                    ],
                  },
                  100,
                ],
              },
            },
          },
          transaction_count: { $size: "$transactions" },
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
