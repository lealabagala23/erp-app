const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authenticateToken = require("../middleware/auth");
const { default: mongoose } = require("mongoose");

// Get all reports
router.get("/sales/:time_period", authenticateToken, async (req, res) => {
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
    let start_date_field = undefined;
    let end_date_field = undefined;
    let group_id_field = undefined;

    switch (time_period) {
      case "week":
        id_field = "$weekStart";
        start_date_field = "$weekStart";
        end_date_field = "$weekEnd";
        group_id_field = "$_id";
        break;
      case "month":
        id_field = "$monthStart";
        start_date_field = "$monthStart";
        end_date_field = "$monthEnd";
        group_id_field = "$_id";
        break;
      default:
        id_field = {
          date: "$dayStart",
          order_id: "$_id",
        };
        start_date_field = "$dayStart";
        end_date_field = "$dayStart";
        group_id_field = "$_id.date";
    }

    const reports = await Order.aggregate([
      {
        $match: params,
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
        $addFields: {
          dayStart: {
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
          weekStart: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateSubtract: {
                  startDate: "$created_at",
                  unit: "day",
                  amount: {
                    $subtract: [{ $dayOfWeek: "$created_at" }, 1],
                  },
                },
              },
            },
          },
          weekEnd: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateAdd: {
                  startDate: {
                    $dateSubtract: {
                      startDate: "$created_at",
                      unit: "day",
                      amount: {
                        $subtract: [{ $dayOfWeek: "$created_at" }, 1],
                      },
                    },
                  },
                  unit: "day",
                  amount: 6,
                },
              },
            },
          },
          monthStart: {
            $dateToString: {
              format: "%Y-%m-01",
              date: "$created_at",
            },
          },
          monthEnd: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateSubtract: {
                  startDate: {
                    $dateAdd: {
                      startDate: {
                        $dateTrunc: { date: "$created_at", unit: "month" },
                      },
                      unit: "month",
                      amount: 1,
                    },
                  },
                  unit: "day",
                  amount: 1,
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: id_field,
          start_date: { $first: start_date_field },
          end_date: { $first: end_date_field },
          orders: { $push: "$$ROOT" },
        },
      },
      {
        $addFields: {
          order_count: { $size: "$orders" },
        },
      },
      { $unwind: { path: "$orders", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$order_items", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          total_sales: {
            $sum: {
              $reduce: {
                input: "$orders.order_items",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: ["$$this.unit_price", "$$this.quantity"] },
                  ],
                },
              },
            },
          },
          cancelled_qty: {
            $sum: {
              $reduce: {
                input: "$orders.order_items",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $ifNull: ["$$this.cancelled_quantity", 0] },
                  ],
                },
              },
            },
          },
          net_sales: {
            $sum: {
              $sum: {
                $reduce: {
                  input: "$orders.order_items",
                  initialValue: 0,
                  in: {
                    $add: [
                      "$$value",
                      {
                        $multiply: [
                          // subtract senior and vat and sd
                          "$$this.unit_price",
                          {
                            $subtract: [
                              "$$this.quantity",
                              { $ifNull: ["$$this.cancelled_quantity", 0] },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: group_id_field,
          start_date: { $first: "$start_date" },
          end_date: { $first: "$end_date" },
          orders: { $push: "$orders" },
          total_sales: { $sum: "$total_sales" },
          cancelled_qty: { $sum: "$cancelled_qty" },
          order_count: {
            [`${time_period === "day" ? "$sum" : "$first"}`]: "$order_count",
          },
          net_sales: { $sum: "$net_sales" },
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
          avg_order_value: { $divide: ["$net_sales", "$order_count"] },
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

// Get all reports
router.get("/top-metrics/:time_period", authenticateToken, async (req, res) => {
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

    const groupBy = {
      day: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
      week: { $isoWeek: "$created_at" },
      month: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
    };

    const aggregatePipeline = [
      {
        $match: params,
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer_id",
        },
      },
      {
        $unwind: {
          path: "$customer_id",
          preserveNullAndEmptyArrays: true,
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
      { $unwind: "$order_items" },
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
    ];

    const groupPipeline = {
      _id: {
        period: groupBy[time_period],
        product_id: "$order_items.product_id",
      },
      product_name: { $first: "$order_items.product_id.product_name" },
    };

    const products_by_quantity = await Order.aggregate([
      ...aggregatePipeline,
      {
        $group: {
          ...groupPipeline,
          total_quantity: { $sum: "$order_items.quantity" },
        },
      },
      { $sort: { total_quantity: -1 } },
      { $limit: 5 },
    ]);

    const products_by_sales = await Order.aggregate([
      ...aggregatePipeline,
      {
        $group: {
          ...groupPipeline,
          total_sales: {
            $sum: {
              $multiply: ["$order_items.unit_price", "$order_items.quantity"],
            },
          },
        },
      },
      { $sort: { total_sales: -1 } },
      { $limit: 5 },
    ]);

    const top_customers = await Order.aggregate([
      ...aggregatePipeline,
      {
        $group: {
          _id: "$customer_id._id",
          customer_name: { $first: "$customer_id.customer_name" },
          total_quantity: { $sum: "$order_items.quantity" },
          total_sales: {
            $sum: {
              $multiply: ["$order_items.unit_price", "$order_items.quantity"],
            },
          },
        },
      },
      { $sort: { total_sales: -1 } },
      { $limit: 5 },
    ]);

    // Top referrers by quantity of customers / total sales

    res.status(200).json({
      products_by_quantity,
      products_by_sales,
      top_customers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
