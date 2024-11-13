const express = require("express");
const cors = require("cors");
const itemRoutes = require("./routes/items");
const companyRoutes = require("./routes/companies");
const authRoutes = require("./routes/auth");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.options("*", cors());

app.use(express.json());
app.use(bodyParser.json());

connectDB();

app.use("/api/items", itemRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
