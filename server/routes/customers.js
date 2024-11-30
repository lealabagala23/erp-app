const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const authenticateToken = require("../middleware/auth");
const Doctor = require("../models/Doctor");
const Agency = require("../models/Agency");
const Patient = require("../models/Patient");

const getPatientPayload = ({
  date_of_birth,
  discount_card,
  discount_card_number,
  referring_doctor_id,
  status,
}) => ({
  date_of_birth,
  discount_card,
  discount_card_number,
  referring_doctor_id,
  status,
});

const getDoctorPayload = ({
  specialization,
  license_number,
  clinic_address,
}) => ({
  specialization,
  license_number,
  clinic_address,
});

const getAgencyPayload = ({
  agency_address,
  industry_type,
  contact_person_name,
}) => ({
  agency_address,
  industry_type,
  contact_person_name,
});

// Create a customers
router.post("/", authenticateToken, async (req, res) => {
  const { customer_details, ...rest } = req.body;

  if (!["PATIENT", "DOCTOR", "AGENCY"].includes(rest.customer_type)) {
    return res
      .status(422)
      .json("customer_type should be PATIENT/DOCTOR/AGENCY only");
  }

  const newCustomer = new Customer({ ...rest, created_at: new Date() });
  try {
    const savedCustomer = await newCustomer.save();
    switch (savedCustomer.customer_type) {
      case "PATIENT":
        const newPatient = new Patient({
          customer_id: savedCustomer._id,
          ...getPatientPayload(customer_details),
          created_at: new Date(),
        });
        await newPatient.save();
        break;
      case "DOCTOR":
        const newDoctor = new Doctor({
          customer_id: savedCustomer._id,
          ...getDoctorPayload(customer_details),
          created_at: new Date(),
        });
        await newDoctor.save();
        break;
      default:
        const newAgency = new Agency({
          customer_id: savedCustomer._id,
          ...getAgencyPayload(customer_details),
          created_at: new Date(),
        });
        await newAgency.save();
        break;
    }

    res.status(201).json("Customer created successfully");
  } catch (err) {
    console.log("err", err);
    res.status(500).json(err);
  }
});

router.post("/bulk", authenticateToken, async (req, res) => {
  try {
    const data = req.body; // Assuming JSON data from the client
    const existingCustomers = await Customers.find();
    const dataWithCreatedAt = data
      .filter((d) => {
        const { customer_name } = d;
        const existing = existingCustomers.some((e) =>
          e.customer_name.includes(customer_name)
        );
        return !existing;
      })
      .map((d) => ({
        ...d,
        created_at: new Date(),
      }));
    const newCustomers = await Customer.insertMany(dataWithCreatedAt); // Insert multiple records
    console.log("newCustomers", newCustomers);
    res.status(200).send("Data uploaded successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading data");
  }
});

// Get all customers
router.get("/", authenticateToken, async (req, res) => {
  try {
    const customers = await Customer.aggregate([
      {
        $lookup: {
          from: "patients",
          localField: "_id",
          foreignField: "customer_id",
          as: "patients",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "customer_id",
          as: "doctors",
        },
      },
      {
        $lookup: {
          from: "agencies",
          localField: "_id",
          foreignField: "customer_id",
          as: "agencies",
        },
      },
    ]);
    const formatted = customers.reduce((arr, obj) => {
      const { patients, doctors, agencies, ...rest } = obj;
      const details =
        rest.customer_type === "PATIENT"
          ? patients[0]
          : rest.customer_type === "DOCTOR"
          ? doctors[0]
          : agencies[0];
      return [...arr, { ...rest, details }];
    }, []);

    res.status(200).json(formatted);
  } catch (err) {
    console.log("err", err);
    res.status(500).json(err);
  }
});

// Update a customer
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { customer_details, ...rest } = req.body;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...rest },
      {
        new: true,
      }
    );
    if (customer_details) {
      switch (updatedCustomer.customer_type) {
        case "PATIENT":
          const newPatient = await Patient.findOneAndUpdate(
            { customer_id: updatedCustomer._id },
            {
              ...getPatientPayload(customer_details),
            },
            { new: true }
          );
          await newPatient.save();
          break;
        case "DOCTOR":
          const newDoctor = await Doctor.findOneAndUpdate(
            { customer_id: updatedCustomer._id },
            {
              ...getDoctorPayload(customer_details),
            },
            { new: true }
          );
          await newDoctor.save();
          break;
        default:
          const newAgency = await Agency.findOneAndUpdate(
            { customer_id: updatedCustomer._id },
            {
              ...getAgencyPayload(customer_details),
            },
            { new: true }
          );
          await newAgency.save();
          break;
      }
    }

    res.status(200).json("Customer updated successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// Delete a customer
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(403).json("Customer not found");
    }

    switch (customer.customer_type) {
      case "PATIENT":
        await Patient.findOneAndDelete({
          customer_id: customer._id,
        });
        break;
      case "DOCTOR":
        await Doctor.findOneAndDelete({
          customer_id: customer._id,
        });
        break;
      default:
        await Agency.findOneAndDelete({
          customer_id: customer._id,
        });
        break;
    }

    await Customer.findByIdAndDelete(customer._id);
    res.status(200).json("Customer deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
