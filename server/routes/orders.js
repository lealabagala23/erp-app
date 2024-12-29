const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authenticateToken = require("../middleware/auth");
const OrderItem = require("../models/OrderItem");
const { default: mongoose } = require("mongoose");
const Payment = require("../models/Payment");
const Inventory = require("../models/Inventory");

const getOrderPayload = ({
  customer_id,
  invoice_number,
  tin,
  billing_address,
  total_amount,
  payment_type,
  status,
  sc_pwd_discount,
  vat_exempted,
  special_discount,
  initiator_id,
  company_id,
  referrer_id,
  referring_doctor_id,
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
    sc_pwd_discount,
    vat_exempted,
    special_discount,
    initiator_id,
    company_id,
    referrer_id,
    referring_doctor_id,
    approver_id,
  };
};

const getOrderItemPayload = ({
  _id,
  product_id,
  quantity,
  unit_price,
  total_price,
}) => ({
  _id,
  product_id,
  quantity,
  unit_price,
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
    const params = {
      company_id: new mongoose.Types.ObjectId(req.query.company_id),
    };

    if (req.query.status) {
      params.status = req.query.status;
    }
    const orders = await Order.aggregate([
      {
        $match: params,
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
    const { payments } = orders[0];
    const total_amount_paid = payments.reduce(
      (accum, obj) => accum + obj.amount_paid,
      0
    );

    res.status(200).json({ ...orders[0], total_amount_paid });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Update a Order
router.put("/:id/payment", authenticateToken, async (req, res) => {
  try {
    const order_id = req.params.id;
    const {
      payment_date,
      amount_paid,
      payment_method,
      bank_name,
      trans_ref_no,
      collection_receipt_no,
    } = req.body;
    const newPayment = new Payment({
      order_id,
      payment_date,
      amount_paid,
      payment_method,
      bank_name,
      trans_ref_no,
      collection_receipt_no,
      created_at: new Date(),
    });
    await newPayment.save();
    const orders = await Order.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
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
    ]);
    const { payments, total_amount } = orders[0];
    const total_amount_paid = payments.reduce(
      (accum, obj) => accum + obj.amount_paid,
      0
    );
    if (total_amount_paid >= total_amount) {
      await Order.findByIdAndUpdate({ _id: order_id }, { status: "completed" });
    }
    res.status(200).json("Payment success");
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Update a Order
router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    const order_id = req.params.id;
    const { status } = req.body;
    const approverParams =
      status === "for_printing" ? { approver_id: req.user.id } : {};
    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      { status, ...approverParams },
      {
        new: true,
      }
    );

    const orderItems = OrderItem.find({ order_id });
    const promises = orderItems.map(({ product_id, quantity }) => {
      return Inventory.findOneAndUpdate(
        { product_id },
        { $inc: { quantity_on_hand: -quantity } },
        { new: true, useFindAndModify: false }
      );
    });

    await Promise.all(promises);

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Update a Order
router.put("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const order_id = req.params.id;
    const { cancel_items, cancel_all } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      { status: cancel_all ? "cancelled" : "partial_cancelled" },
      {
        new: true,
      }
    );

    const promises = cancel_items.map(({ product_id, quantity }) => {
      return Inventory.findOneAndUpdate(
        { product_id },
        { $inc: { quantity_on_hand: quantity } },
        { new: true, useFindAndModify: false }
      );
    });

    await Promise.all(promises);

    res.status(200).json(updatedOrder);
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

    if (rest.status !== "draft")
      return res.status(200).json("Only draft orders can be updated");

    const total_sales = order_items.reduce(
      (accum, obj) => accum + obj.total_price,
      0
    );
    const { sc_pwd_discount, vat_exempted, special_discount } = rest;
    let total_sales_amount = vat_exempted
      ? total_sales - total_sales * 0.12
      : total_sales;
    total_sales_amount = sc_pwd_discount
      ? total_sales_amount - total_sales_amount * 0.2
      : total_sales_amount;

    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      {
        ...getOrderPayload(rest),
        total_amount: total_sales_amount - special_discount,
      },
      {
        new: true,
      }
    );
    const dbOrderItems = await OrderItem.find({ order_id });
    if (dbOrderItems.length > 0) {
      const ids = order_items?.map((o) => o._id);
      const deletedOrderItems = dbOrderItems.filter(
        ({ _id }) => !ids.includes(_id.toString())
      );
      if (deletedOrderItems.length > 0) {
        const idsToDelete = deletedOrderItems.map(
          ({ _id }) => new mongoose.Types.ObjectId(_id)
        );
        await OrderItem.deleteMany({ _id: { $in: idsToDelete } });
      }
    }
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
