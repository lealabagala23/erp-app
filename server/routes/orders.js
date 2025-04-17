const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authenticateToken = require("../middleware/auth");
const OrderItem = require("../models/OrderItem");
const { default: mongoose } = require("mongoose");
const Payment = require("../models/Payment");
const Inventory = require("../models/Inventory");
const orderAggregateParams = require("../constants/orderAggregateParams");

const getOrderPayload = ({
  customer_id,
  invoice_number,
  tin,
  billing_address,
  payment_type,
  status,
  discount_card,
  discount_card_number,
  sc_pwd_discount,
  vat_exempted,
  special_discount,
  initiator_id,
  company_id,
  referrer_id,
  referring_doctor_id,
  approver_id,
  transaction_date,
}) => {
  return {
    customer_id,
    invoice_number,
    tin,
    billing_address,
    payment_type,
    status,
    discount_card,
    discount_card_number,
    sc_pwd_discount,
    vat_exempted,
    special_discount,
    initiator_id,
    company_id,
    referrer_id,
    referring_doctor_id,
    approver_id,
    transaction_date: transaction_date
      ? new Date(transaction_date)
      : new Date(),
  };
};

const getOrderItemPayload = ({
  _id,
  product_id,
  inventory_id,
  quantity,
  unit_price,
}) => ({
  _id,
  product_id,
  inventory_id,
  quantity,
  unit_price,
});

// Create a orders
router.post("/", authenticateToken, async (req, res) => {
  const payload = getOrderPayload(req.body);
  const newOrder = new Order({
    ...payload,
    status: "draft",
    transaction_date: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    last_updated_by: new mongoose.Types.ObjectId(req.user.id),
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
      {
        $sort: { created_at: -1 }, // Sort by createdAt in ascending order
      },
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
      ...orderAggregateParams,
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "order_id",
          as: "payments",
        },
      },
    ]);
    const { payments, net_total } = orders[0];
    const total_amount_paid = payments.reduce(
      (accum, obj) => accum + obj.amount_paid,
      0
    );
    await Order.findByIdAndUpdate(
      { _id: order_id },
      {
        status: total_amount_paid >= net_total ? "completed" : "partially_paid",
        updated_at: new Date(),
        last_updated_by: new mongoose.Types.ObjectId(req.user.id),
      }
    );
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
      status === "approved" ? { approver_id: req.user.id } : {};
    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      {
        status,
        updated_at: new Date(),
        last_updated_by: new mongoose.Types.ObjectId(req.user.id),
        ...approverParams,
      },
      {
        new: true,
      }
    );

    if (status === "approved") {
      const orderItems = await OrderItem.find({ order_id });
      const promises = orderItems.map(({ product_id, quantity }) => {
        return Inventory.findOneAndUpdate(
          { product_id },
          { $inc: { quantity_on_hand: -quantity } },
          { new: true, useFindAndModify: false }
        );
      });

      await Promise.all(promises);
    }

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
    const { cancel_items, cancel_all, invoice_number } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      {
        status: cancel_all ? "cancelled" : "unpaid",
        updated_at: new Date(),
        last_updated_by: new mongoose.Types.ObjectId(req.user.id),
        invoice_number,
        cancel_initiator_id: req.user.id,
      },
      {
        new: true,
      }
    );

    const oPromises = cancel_items.map(({ _id, quantity }) => {
      return OrderItem.findOneAndUpdate(
        { _id },
        { $set: { cancelled_quantity: quantity } },
        { new: true, useFindAndModify: false }
      );
    });

    const cPromises = cancel_items.map(({ product_id, quantity }) => {
      return Inventory.findOneAndUpdate(
        { product_id },
        { $inc: { quantity_on_hand: quantity } },
        { new: true, useFindAndModify: false }
      );
    });

    await Promise.all([...oPromises, ...cPromises]);

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

    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      {
        ...getOrderPayload(rest),
        updated_at: new Date(),
        last_updated_by: new mongoose.Types.ObjectId(req.user.id),
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
    const order_id = req.params.id;
    const dbOrderItems = await OrderItem.find({ order_id });
    const dbPayments = await Payment.find({ order_id });
    if (dbOrderItems.length > 0) {
      const idsToDelete = dbOrderItems.map(
        ({ _id }) => new mongoose.Types.ObjectId(_id)
      );
      await OrderItem.deleteMany({ _id: { $in: idsToDelete } });
    }
    if (dbPayments.length > 0) {
      const idsToDelete = dbPayments.map(
        ({ _id }) => new mongoose.Types.ObjectId(_id)
      );
      await Payment.deleteMany({ _id: { $in: idsToDelete } });
    }
    await Order.findByIdAndDelete(order_id);
    res.status(200).json("Order deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
