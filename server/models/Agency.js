const mongoose = require("mongoose");

const AgencySchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  agency_address: {
    type: String,
  },
  industry_type: {
    type: String,
  },
  contact_person_name: {
    type: String,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Agency", AgencySchema);
