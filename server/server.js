const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/products");
const inventoryRoutes = require("./routes/inventory");
const orderRoutes = require("./routes/orders");
const customerRoutes = require("./routes/customers");
const supplierRoutes = require("./routes/suppliers");
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

app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
