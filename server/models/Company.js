const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true,
    unique: true,
  },
  company_display_name: {
    type: String,
    required: true,
    unique: true,
  },
  company_address: {
    type: String,
    required: true,
  },
  tin: {
    type: String,
    required: true,
  },
  contact_info: {
    type: String,
    required: true,
  },
  company_description: {
    type: String,
    required: true,
  },
  company_logo: {
    type: String,
    required: false,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Company", CompanySchema);
