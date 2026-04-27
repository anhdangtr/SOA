const express = require("express");
const cors = require("cors");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Mount at root so /payments and /payments/:orderId are correct
app.use("/", paymentRoutes);

module.exports = app;
