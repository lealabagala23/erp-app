const defaultOrderAggrParams = require("./defaultOrderAggrParams");

const orderAggregateParams = [
  ...defaultOrderAggrParams,
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
    $lookup: {
      from: "inventories",
      localField: "order_items.inventory_id",
      foreignField: "_id",
      as: "order_items.inventory_id",
    },
  },
  {
    $unwind: {
      path: "$order_items.inventory_id",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "patients",
      localField: "customer_id._id",
      foreignField: "customer_id",
      as: "customer_id.customer_details",
    },
  },
  {
    $unwind: {
      path: "$customer_id.customer_details",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: "$_id",
      invoice_number: { $first: "$invoice_number" },
      tin: { $first: "$tin" },
      billing_address: { $first: "$billing_address" },
      total_amount_paid: { $first: "$total_amount_paid" },
      discount_card: { $first: "$discount_card" },
      discount_card_number: { $first: "$discount_card_number" },
      sc_pwd_discount: { $first: "$sc_pwd_discount" },
      vat_exempted: { $first: "$vat_exempted" },
      special_discount: { $first: "$special_discount" },
      payment_type: { $first: "$payment_type" },
      status: { $first: "$status" },
      initiator_id: { $first: "$initiator_id" },
      cancel_initiator_id: { $first: "$cancel_initiator_id" },
      customer_id: { $first: "$customer_id" },
      company_id: { $first: "$company_id" },
      referrer_id: { $first: "$referrer_id" },
      referring_doctor_id: { $first: "$referring_doctor_id" },
      approver_id: { $first: "$approver_id" },
      last_updated_by: { $first: "$last_updated_by" },
      created_at: { $first: "$created_at" },
      updated_at: { $first: "$updated_at" },
      order_items: { $push: "$order_items" },
      payments: { $first: "$payments" },
    },
  },
  {
    $addFields: {
      sub_total: {
        $reduce: {
          input: "$order_items",
          initialValue: 0,
          in: {
            $add: [
              "$$value",
              {
                $multiply: [
                  { $ifNull: ["$$this.unit_price", 0] },
                  {
                    $subtract: [
                      { $ifNull: ["$$this.quantity", 0] },
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
  {
    $addFields: {
      vat_exempt_amount: {
        $cond: {
          if: { $eq: ["$vat_exempted", true] },
          then: { $multiply: ["$sub_total", 0.12] },
          else: 0,
        },
      },
      sc_pwd_disc_amount: {
        $cond: {
          if: { $eq: ["$sc_pwd_discount", true] },
          then: { $multiply: ["$sub_total", 0.2] },
          else: 0,
        },
      },
      special_discount: {
        $ifNull: ["$special_discount", 0],
      },
    },
  },
  {
    $addFields: {
      net_total: {
        $subtract: [
          {
            $subtract: [
              { $subtract: ["$sub_total", "$vat_exempt_amount"] },
              "$sc_pwd_disc_amount",
            ],
          },
          { $ifNull: ["$special_discount", 0] },
        ],
      },
    },
  },
];

module.exports = orderAggregateParams;
