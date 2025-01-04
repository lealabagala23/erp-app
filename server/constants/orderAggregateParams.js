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
      total_amount: { $first: "$total_amount" },
      total_amount_paid: { $first: "$total_amount_paid" },
      discount_card: { $first: "$discount_card" },
      discount_card_number: { $first: "$discount_card_number" },
      sc_pwd_discount: { $first: "$sc_pwd_discount" },
      vat_exempted: { $first: "$vat_exempted" },
      special_discount: { $first: "$special_discount" },
      payment_type: { $first: "$payment_type" },
      status: { $first: "$status" },
      initiator_id: { $first: "$initiator_id" },
      customer_id: { $first: "$customer_id" },
      company_id: { $first: "$company_id" },
      referrer_id: { $first: "$referrer_id" },
      referring_doctor_id: { $first: "$referring_doctor_id" },
      approver_id: { $first: "$approver_id" },
      created_at: { $first: "$created_at" },
      order_items: { $push: "$order_items" },
      payments: { $first: "$payments" },
    },
  },
];

module.exports = orderAggregateParams;
