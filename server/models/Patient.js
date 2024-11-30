const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  date_of_birth: {
    type: String,
  },
  discount_card: {
    type: String,
  },
  discount_card_number: {
    type: String,
  },
  referring_doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  status: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Patient", PatientSchema);
