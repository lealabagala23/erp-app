const mongoose = require("mongoose");

const ReferrerSchema = new mongoose.Schema({
  referrer_name: {
    type: String,
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  contact_info: {
    type: String,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Referrer", ReferrerSchema);
