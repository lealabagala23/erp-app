const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const authenticateToken = require("../middleware/auth");
const Doctor = require("../models/Doctor");
const CODoctor = require("../models/CODoctor");
const Agency = require("../models/Agency");
const Patient = require("../models/Patient");
const { default: mongoose } = require("mongoose");

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

  if (
    !["PATIENT", "DOCTOR", "CO_DOCTOR", "AGENCY"].includes(rest.customer_type)
  ) {
    return res
      .status(422)
      .json("customer_type should be PATIENT/DOCTOR/AGENCY only");
  }

  const newCustomer = new Customer({
    ...rest,
    created_at: new Date(),
    updated_at: new Date(),
    last_updated_by: new mongoose.Types.ObjectId(req.user.id),
  });
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
      case "CO_DOCTOR":
        const newCODoctor = new CODoctor({
          customer_id: savedCustomer._id,
          co_doctor_name: customer_details.co_doctor_name,
          created_at: new Date(),
        });
        await newCODoctor.save();
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

    res.status(201).json(savedCustomer);
  } catch (err) {
    console.log("err", err);
    res.status(500).json(err);
  }
});

router.post("/bulk", authenticateToken, async (req, res) => {
  try {
    const data = req.body; // Assuming JSON data from the client
    const existingCustomers = await Customer.find();

    const capitalize = (str) => {
      if (!str) return ""; // Handle empty strings
      return str
        .split(" ") // Split the string into an array of words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(" "); // Join the array back into a string
    };

    const dataWithCreatedAt = data
      .filter((d) => {
        const { customer_name } = d;
        const existing = existingCustomers.some((e) =>
          e.customer_name.includes(customer_name)
        );
        return !existing;
      })
      .map(({ customer_name, ...d }) => ({
        ...d,
        customer_name: capitalize(customer_name),
        created_at: new Date(),
        updated_at: new Date(),
        last_updated_by: new mongoose.Types.ObjectId(req.user.id),
      }));

    let newCustomers = [...existingCustomers];

    if (dataWithCreatedAt.length > 0) {
      newCustomers = await Customer.insertMany(dataWithCreatedAt); // Insert multiple records
    }

    const patientData = data
      .filter((d) => d.customer_type === "PATIENT")
      .map(
        ({
          date_of_birth,
          discount_card,
          discount_card_number,
          customer_name,
        }) => ({
          customer_id: newCustomers.find(
            (c) => c.customer_name === customer_name
          )?._id,
          date_of_birth,
          discount_card,
          discount_card_number,
          status: "active",
          created_at: new Date(),
        })
      );
    await Patient.insertMany(patientData);

    const doctorData = data
      .filter((d) => d.customer_type === "DOCTOR")
      .map(
        ({
          specialization,
          license_number,
          clinic_address,
          customer_name,
        }) => ({
          customer_id: newCustomers.find(
            (c) => c.customer_name === customer_name
          )?._id,
          specialization,
          license_number,
          clinic_address,
          created_at: new Date(),
        })
      );
    await Doctor.insertMany(doctorData);
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
          from: "codoctors",
          localField: "_id",
          foreignField: "customer_id",
          as: "codoctors",
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
      {
        $lookup: {
          from: "users",
          localField: "last_updated_by",
          foreignField: "_id",
          as: "last_updated_by",
        },
      },
    ]);
    const formatted = customers.reduce((arr, obj) => {
      const {
        patients,
        doctors,
        codoctors,
        agencies,
        last_updated_by,
        ...rest
      } = obj;
      const customer_details =
        (rest.customer_type === "PATIENT"
          ? patients[0]
          : rest.customer_type === "DOCTOR"
          ? doctors[0]
          : rest.customer_type === "CO_DOCTOR"
          ? codoctors[0]
          : agencies[0]) || {};
      return [
        ...arr,
        { ...rest, last_updated_by: last_updated_by[0], customer_details },
      ];
    }, []);

    res.status(200).json(formatted);
  } catch (err) {
    console.log("err", err);
    res.status(500).json(err);
  }
});

router.get("/:customer_type", authenticateToken, async (req, res) => {
  try {
    const customer_type = req.params.customer_type;
    const ItemModel =
      customer_type === "PATIENT"
        ? Patient
        : customer_type === "DOCTOR"
        ? Doctor
        : Agency;

    const populateParams = [
      {
        path: "customer_id",
      },
    ];
    if (customer_type === "PATIENT")
      populateParams.push({ path: "referring_doctor_id" });
    const result = await ItemModel.find()
      .populate(populateParams)
      .sort({ "customer_id.customer_name": 1 });

    res.status(200).json(result);
  } catch (err) {
    console.log("err", err);
    res.status(500).json(err);
  }
});

// Update a customer
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { customer_details, ...rest } = req.body;
    const customer_id = req.params.id;
    await Customer.findByIdAndUpdate(
      customer_id,
      {
        ...rest,
        updated_at: new Date(),
        last_updated_by: new mongoose.Types.ObjectId(req.user.id),
      },
      {
        new: true,
      }
    );
    if (customer_details) {
      switch (rest.customer_type) {
        case "PATIENT":
          await Patient.findOneAndUpdate(
            { customer_id },
            {
              $set: {
                ...getPatientPayload(customer_details),
              },
            },
            { new: true, useFindAndModify: false }
          );
          break;
        case "DOCTOR":
          await Doctor.findOneAndUpdate(
            { customer_id },
            {
              $set: {
                ...getDoctorPayload(customer_details),
              },
            },
            { new: true, useFindAndModify: false }
          );
          break;
        case "CO_DOCTOR":
          await CODoctor.findOneAndUpdate(
            { customer_id },
            {
              $set: {
                co_doctor_name: customer_details.co_doctor_name,
              },
            },
            { new: true, useFindAndModify: false }
          );
          break;
        default:
          await Agency.findOneAndUpdate(
            { customer_id },
            {
              $set: {
                ...getAgencyPayload(customer_details),
              },
            },
            { new: true, useFindAndModify: false }
          );
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
      case "CO_DOCTOR":
        await CODoctor.findOneAndDelete({
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
