const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
   name: { type: String, required: true },
   quantity: { type: Number, required: true },
   category: { type: String },
   description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);

