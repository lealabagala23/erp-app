const defaultOrderAggrParams = [
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
      from: "users",
      localField: "cancel_initiator_id",
      foreignField: "_id",
      as: "cancel_initiator_id",
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
      from: "doctors",
      localField: "referring_doctor_id",
      foreignField: "_id",
      as: "referring_doctor_id",
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
    $lookup: {
      from: "payments",
      localField: "_id",
      foreignField: "order_id",
      as: "payments",
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
      path: "$cancel_initiator_id",
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
  {
    $unwind: {
      path: "$referring_doctor_id",
      preserveNullAndEmptyArrays: true,
    },
  },
  { $unwind: { path: "$order_items", preserveNullAndEmptyArrays: true } },
];

module.exports = defaultOrderAggrParams;
