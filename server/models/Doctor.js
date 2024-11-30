const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  specialization: {
    type: String,
  },
  license_number: {
    type: String,
  },
  clinic_address: {
    type: String,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Doctor", DoctorSchema);
