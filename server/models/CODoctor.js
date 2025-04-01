const mongoose = require("mongoose");

const CODoctorSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  co_doctor_name: {
    type: String,
  },
});

module.exports = mongoose.model("CODoctor", CODoctorSchema);
