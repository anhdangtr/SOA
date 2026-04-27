import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { deliveryRoutes } from "./routes/deliveryRoutes.js";

export const app = express();

app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());

app.use("/", deliveryRoutes);

app.use(errorHandler);
